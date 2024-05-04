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

        // legacy code for fields, looks better in discord but
        // makes push notifications not have data
        // split embeds into chunks of 25 as embeds can only have 25 fields
        /*while (fields.length > 0) {
            let chunk = fields.splice(0,25)
            let fieldsResult = [];

            for (const [, val] of Object.entries(chunk)){
                fieldsResult.push({
                    name: val.title,
                    value: val.description
                })
            }

            embedsResult.push({
                color: 2829617,
                ...(title ? { title: title } : {}),
                fields: fieldsResult
            })
        }*/

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

export async function sendToDiscord(url, data, userId) {

    //check if webhook is discord webhook
    if (!url.startsWith("https://discord.com/api/webhooks/") && !url.startsWith("https://discordapp.com/api/webhooks/")) return;

    for (let [key, val] of  Object.entries(data)) {
        //send webhook
        await _sendDiscordWebhook(url, val, key !== "info_changes" ? `${key} Data Update` : undefined, userId)
    }

}

export async function sendToPush(endpoint, keys, data, userId) {

    //get each class of datachanges / infochanges
    for (let [key, val] of  Object.entries(data)) {

        //get each individual change
        for (const [, val2] of Object.entries(val)){

           let res = {}
            if (key === "info_changes") res = {
                type: 'info',
                title: val2.title,
                body: val2.description.split('*').join('').split('`').join('')
            }
            else res = {
                type: 'data',
                title: `${key} Data Update`,
                body: `${val2.title.split('*').join('').split('`').join('')}\n${val2.description.split('*').join('').split('`').join('')}`
            }

            //cleanse formatting, remove asterisks and backticks
            const pushData = JSON.stringify({
                title: res.title,
                body: res.body,
                data: {
                    url: `${client.url}/notifications/view?type=${res.type}&title=${encodeURIComponent(val2.title)}&body=${encodeURIComponent(val2.description)}`
                }
            })

            //send push notification
            try {
                await webpush.sendNotification({ endpoint, keys }, pushData)
            } catch (error) {
                //silently fail
                errorHelper('updater.notifications.sendPushError', { session: { user: userId }}, error.message)
            }
        }
    }

}