import axios from 'axios';
import fetch from 'node-fetch';
import { load } from 'cheerio';
import { createHash, randomBytes } from 'crypto';
import User from "../../../models/user.js";
import { errorHelper } from "../../index.js";
import { Setting } from "../../../models/index.js";
import { bot } from "../../../loaders/bot.js";
import { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } from "discord.js";
import { client, vapidPrivateKey, vapidPublicKey } from "../../../config/index.js";
import webpush from "web-push";
import mongoose from "mongoose";

// helper functions
function _base64URLEncode(str) {
    return str.toString("base64")
        .replace(/\+/g, "-")
        .replace(/\//g, "_")
        .replace(/=/g, "");
}
function _sha256(buffer) {
    return createHash("sha256").update(buffer).digest();
}
function _makeTokensRes(data){
    const parseJwt = (token) => JSON.parse(Buffer.from(token.split(".")[1], "base64").toString());
    const parsedJwt = parseJwt(data.access_token);
    const parsedUser = JSON.parse(parsedJwt.user)

    return {
        type: "success",
        tokens: {
            ...data,
            issued_at: parsedJwt.iat,
            expiration_time: parsedJwt.exp
        },
        user: {
            personId: parsedUser.PersonId,
            userName: parsedUser.UserName,
            firstName: parsedUser.FirstName,
            lastName: parsedUser.LastName,
            role: parsedUser.Role,
        }
    }
}

export async function loginUser(districtCode, username, password){
    try {

        // generate unique secrets
        const nonce = _base64URLEncode(randomBytes(16));
        const code_verifier = _base64URLEncode(randomBytes(32));
        const code_challenge = _base64URLEncode(_sha256(code_verifier));
        const state = _base64URLEncode(randomBytes(16));

        //make callback url (we use it twice, so I make it here)
        const returnUrl = "/connect/authorize/callback?"
            + `nonce=${nonce}`
            + "&response_type=code"
            + "&code_challenge_method=S256"
            + "&scope=openid%20aware3UserInfo%20aware3UserConfig%20offline_access%20nbsMobileAppApi"
            + `&code_challenge=${code_challenge}`
            + "&redirect_uri=com.renweb.accounts%3A%2Foauthredirect"
            + "&client_id=aware3"
            + `&state=${state}`;

        // open login page to generate form token and get a anti-forgery cookie
        const res1 = await axios("https://accounts.renweb.com/Account/Login?ReturnUrl=" + encodeURIComponent(returnUrl));
        const loginUrl = res1.request.res.responseUrl;
        const token = load(res1.data)("input[name='__RequestVerificationToken']").val();
        const antiforgeryCookie =  res1.headers["set-cookie"][0];

        // post spoofed form data
        // we have to use fetch here since axios doesn't allow us to disable all the redirects :(
        const postFormData = {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
                "Cookie": antiforgeryCookie,
            },
            body: `District=${districtCode}&Username=${username}&Password=${password}&signIn=LOG+IN&__RequestVerificationToken=${token}`,
        }
        const res2 = await fetch(loginUrl, {
            ...postFormData,
            redirect: "manual", // Disable automatic redirect
        });

        //get cookie
        const cookie = res2.headers.raw()["set-cookie"]?.[1]?.match(/idsrv=([^;]*)/)?.[1] ?? null;

        //auth failed
        if (cookie === null) {
            const errRes = await fetch(loginUrl, { ...postFormData, redirect: "follow" });
            const errMessage = load(await errRes.text())(".error-msg-nopadding > ul:nth-child(1) > li:nth-child(1)").text();
            return {
                type: "error",
                message: errMessage
            }
        }

        //call callback url with cookie to get final code
        const authCode = await axios({
            method: "get",
            url: "https://accounts.renweb.com" + returnUrl,
            headers: {
                "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
                "Accept-Encoding": "gzip, deflate",
                "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Mobile/15E148 Safari/604.1",
                "Accept-Language": "en-US,en;q=0.9",
                "Cookie": `idsrv=${cookie}`
            },
            maxRedirects: 2, //callback redirects to local page, we just get the code straight from the redirected url without actually going there
            // note: the way i do this returns an error even if it works, so we have to get the actual code in the catch block
        }).catch((error) => {
            if (error.request._options.search.startsWith("?code")) return error.request._options.search.split("&")[0].split("=")[1]; //not an error!
                else throw error; //actual error
        });

        //get tokens
        const res3PostData = `code=${authCode}&code_verifier=${code_verifier}&redirect_uri=com.renweb.accounts:/oauthredirect&client_id=aware3&grant_type=authorization_code`;
        const res3 = await axios({
            method: "post",
            url: "https://accounts.renweb.com/connect/token",
            headers: {
                "Accept": "*/*",
                "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
                "Accept-Encoding": "gzip, deflate",
                "User-Agent": "CFNetwork/1485 Darwin/23.1.0",
                "Accept-Language": "en-US,en;q=0.9"
            },
            data: res3PostData
        });

        return _makeTokensRes(res3.data);
    } catch (error) {
        return {
            type: "error",
            message: errorHelper('rw.auth.loginUserError', null, error.message).resultMessage.en
        }
    }
}

export async function getAuthTokens(userId){
    //get current tokens
    const user = await User.findOne({ _id: userId }).lean().exec();

    //check if tokens are expired, if not return them
    if (user.tokens.expiration_time >= Math.floor(Date.now()/1000)) return user.tokens;

    //check if refresh token exists, if so use to refresh
    if (user.tokens.refresh_token) return await refreshAuthTokens(userId, user.tokens.refresh_token);
}

export async function refreshAuthTokens(userId, refresh_token){
    //use refresh token to get new auth tokens
    try {
        const res = await axios({
            method: "post",
            url: "https://accounts.renweb.com/connect/token",
            validateStatus: status => (status >= 200 && status < 300) || status === 400,
            headers: {
                "Accept": "*/*",
                "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
                "Accept-Encoding": "gzip, deflate",
                "User-Agent": "CFNetwork/1485 Darwin/23.1.0",
                "Accept-Language": "en-US,en;q=0.9"
            },
            data: `refresh_token=${refresh_token}&client_id=aware3&grant_type=refresh_token`
        });

        // the refresh token is invalid
        if (res.data.error === 'invalid_grant') {
            await _notifyTokenExpired(userId);
            throw new Error('Invalid refresh token');
        }

        const tokensRes = _makeTokensRes(res.data)

        //update user with new information
        const mongooseUpdatedUser = {
            personId: tokensRes.user.personId,
            userName: tokensRes.user.userName,
            firstName: tokensRes.user.firstName,
            lastName: tokensRes.user.lastName,
            role: tokensRes.user.role,
            tokens: tokensRes.tokens
        }
        await User.findOneAndUpdate({ _id: userId }, mongooseUpdatedUser);
        return tokensRes;
    } catch (error) {
        errorHelper('rw.auth.refreshAuthTokensError', null, error.message)
        throw error;
    }
}

export async function makeAuthRequest(userId, url){
    try {
        let { access_token } = await getAuthTokens(userId);
        if (access_token === undefined) access_token = (await getAuthTokens(userId)).access_token;

        const res = await axios.get(url, {
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${access_token}`,
                "Accept": "*/*",
                "Accept-Language": "en-US,en;q=0.9",
                "Accept-Encoding": "gzip, deflate",
                "User-Agent": "CFNetwork/1410.0.3 Darwin/22.6.0",
            }
        });

        return res.data;
    } catch (error) {
        errorHelper('rw.auth.makeAuthRequestError', null, error.message)
        throw error;
    }
}

async function _notifyTokenExpired(userId){
    await User.findOneAndUpdate({ _id: userId }, { needsLogin: true }).exec();
    const userSettings = await Setting.findOne({ userId: userId }).exec();

    // if there is a channel setup for notifs, send a message
    const channelId = userSettings.updater.discordNotifications[0]?.channelId;
    if (channelId) {
        const message = new EmbedBuilder()
            .setTitle("RenWeb Login Expired")
            .setDescription(`Your RenWeb login has expired. Please login again to continue getting notifications from ${client.name}.`)
            .setColor(15158332)
        const button = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setLabel("Log In")
                    .setStyle(ButtonStyle.Link)
                    .setURL(`${client.url}/auth/login`)
            );
        const channel = await bot.channels.cache.get(channelId);
        await channel.send({ embeds: [message], components: [button] });
    }

    // send push  if there are any subscriptions
    for (const { endpoint, keys } of userSettings.updater.pushSubscriptions) {
        const pushData = JSON.stringify({
            title: "RenWeb Login Expired",
            body: `Your RenWeb login has expired. Please login again to continue getting notifications from ${client.name}.`,
            data: { url: `${client.url}/auth/login` }
        });

        const options = {
            vapidDetails: {
                subject: client.url,
                publicKey: vapidPublicKey,
                privateKey: vapidPrivateKey,
            },
            urgency: "high"
        }

        await webpush.sendNotification({ endpoint, keys }, pushData, options);
    }

    //delete sessions so users have to log in again
    const Session = mongoose.connection.db.collection("sessions")
    const allSessions = await Session.find({}).toArray();
    const userSessions = allSessions.filter(session => {
        const sessionData = JSON.parse(session.session);
        return sessionData.user == userId;
    })
    for (const session of userSessions) {
        await Session.deleteOne({ _id: session._id });
    }

}