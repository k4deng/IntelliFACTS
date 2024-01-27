import { client } from "../config/index.js";
import fetch from "node-fetch";
import { errorHelper } from "../utils/index.js";

async function _sendDiscordWebhook(url, fields, title, userId) {

    try {
        // sort embeds in a better format for fields
        let embedsResult =[];

        //split embeds into chunks of 25 as embeds can only have 25 fields
        while (fields.length > 0) {

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

        }

        //send to the webhook
        await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                username: client.name,
                embeds: embedsResult
            })
        })
    } catch (error) {
        //silently fail
        errorHelper('updater.notifications.sendDiscordWebhookError', { session: { id: userId }}, error.message)
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