import axios from 'axios';
import fetch from 'node-fetch';
import { load } from 'cheerio';
import { createHash, randomBytes } from 'crypto';

// helper functions
function _parseJwt(token) {
    return JSON.parse(Buffer.from(token.split(".")[1], "base64").toString());
}
function _base64URLEncode(str) {
    return str.toString("base64")
        .replace(/\+/g, "-")
        .replace(/\//g, "_")
        .replace(/=/g, "");
}
function _sha256(buffer) {
    return createHash("sha256").update(buffer).digest();
}

export async function loginUser(districtCode, username, password){
    try {

        // generate unique secrets
        const nonce = _base64URLEncode(randomBytes(32));
        const code_verifier = _base64URLEncode(randomBytes(32));
        const code_challenge = _base64URLEncode(_sha256(code_verifier));
        const state = _base64URLEncode(randomBytes(32));

        //make callback url (we use it twice so i make it here)
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

        const parsedJwt = _parseJwt(res3.data.access_token);
        const parsedUser = JSON.parse(parsedJwt.user)

        return {
            type: "success",
            tokens: {
                ...res3.data,
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


    } catch (error) {
        console.error(error);
    }
}
