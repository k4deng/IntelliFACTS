import { client, vapidPrivateKey, vapidPublicKey } from "../config/index.js";
import fetch from "node-fetch";
import { errorHelper } from "../utils/index.js";
import { bot } from "../loaders/bot.js";
import webpush from "web-push";

webpush.setVapidDetails(
    client.url,
    vapidPublicKey,
    vapidPrivateKey
);

export function checkSentElements(sentElements, data) {
    let result = {};
    for (let [subject, val] of  Object.entries(data)) {
        let newElements = [];
        for (const [, val2] of Object.entries(val)){
            if (sentElements.includes(val2.element)) newElements.push(val2);
        }
        result[subject] = newElements;
    }
    return result;
}

async function _sendDiscordWebhook(url, fields, title, userId) {

    try {
        // sort embeds in a better format for fields
        let embedsResult =[];

        // split embeds into chunks of 25 items as a failsafe to never reach limit of 4096 characters in description
        // (and for looks, long embeds aren't that good-looking)
        while (fields.length > 0) {
            let chunk = fields.splice(0,25)
            let description = '';

            for (const [, val] of Object.entries(chunk)) {
                description += `**${val.title}**\n${val.description}\n`
            }

            embedsResult.push({
                color: 2829617,
                ...(title ? { title: title } : {}),
                description: description
            })
        }

        //send to the webhook
        await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                username: client.name,
                avatar_url: bot.user.displayAvatarURL(),
                embeds: embedsResult
            })
        })
    } catch (error) {
        //silently fail
        errorHelper('updater.notifications.sendDiscordWebhookError', { session: { user: userId }}, error.message)
    }
}

async function _sendPushNotification(endpoint, authKeys, key, change, userId) {

    const clearFormatting = (str) => str.split('*').join('').split('`').join('');

    try {
        let res = {}
        if (key === "info_changes") res = {
            type: 'info',
            title: change.title,
            body: clearFormatting(change.description)
        }
        else res = {
            type: 'data',
            title: `${key} Data Update`,
            body: `${clearFormatting(change.title)}\n${clearFormatting(change.description)}`
        }

        //cleanse formatting, remove asterisks and backticks
        const pushData = JSON.stringify({
            title: res.title,
            body: res.body,
            data: {
                url: `${client.url}/notifications?type=${res.type}&title=${encodeURIComponent(clearFormatting(change.title))}&body=${encodeURIComponent(clearFormatting(change.description))}`
            }
        })

        await webpush.sendNotification({ endpoint, keys: authKeys }, pushData)
    } catch (error) {
        //silently fail
        errorHelper('updater.notifications.sendPushError', { session: { user: userId }}, error.message)
    }
}

export async function sendToDiscord(url, data, userId) {

    //check if webhook is discord webhook
    if (!url.startsWith("https://discord.com/api/webhooks/") && !url.startsWith("https://discordapp.com/api/webhooks/")) return;

    for (let [key, val] of  Object.entries(data)) {
        //send webhook
        await _sendDiscordWebhook(url, val, key !== "info_changes" ? `${key} Data Update` : undefined, userId)
    }

}

export async function sendToPush(endpoint, authKeys, data, userId) {

    //get each class with data changes / each info change
    for (let [key, val] of  Object.entries(data)) {

        //get each individual change
        for (const [, val2] of Object.entries(val)){

            //send push notification
            await _sendPushNotification(endpoint, authKeys, key, val2, userId)
        }
    }
}