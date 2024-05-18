import { client } from "../config/index.js";
import { errorHelper, sendDiscordWebhook, sendWebPushNotification } from "../utils/index.js";
import webpush from "web-push";

const clearFormatting = (str) => str.split('*').join('').split('`').join('');

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

export async function sendToDiscord(url, data, style, userId) {

    //check if webhook is discord webhook
    if (!url.startsWith("https://discord.com/api/webhooks/") && !url.startsWith("https://discordapp.com/api/webhooks/")) return;

    for (let [key, fields] of  Object.entries(data)) {
        const title = key !== "info_changes" ? `${key} Data Update` : undefined;
        try {
            // sort embeds in a better format for fields
            let embedsResult = [];

            // split embeds into chunks of 25 items as a failsafe to never reach limit of 4096 characters in description
            // (and for looks, long embeds aren't that good-looking)
            while (fields.length > 0) {
                let chunk = fields.splice(0,25)

                if (style === 'fancy') {
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

                else if (style === 'optimized') {
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

                else if (style === 'plain') {
                    let description = '';

                    for (const [, val] of Object.entries(chunk)) {
                        description += `${clearFormatting(val.title)}\n*${clearFormatting(val.description)}*\n`
                    }

                    await sendDiscordWebhook(url, null, `${title ? '**'+title+'**\n' : ''}${description}`)
                }

            }

            //send to the webhook
            if (embedsResult.length > 0) await sendDiscordWebhook(url, embedsResult)
        } catch (error) {
            //silently fail
            errorHelper('updater.notifications.sendDiscordWebhookError', { session: { user: userId }}, error.message)
        }
    }

}

export async function sendToPush(endpoint, authKeys, data, userId) {

    //get each class with data changes / each info change
    for (let [key, val] of  Object.entries(data)) {

        //get each individual change
        for (const [, change] of Object.entries(val)){

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

                await sendWebPushNotification(endpoint, authKeys, {
                    title: res.title,
                    body: res.body,
                    data: {
                        url: `${client.url}/notifications?type=${res.type}&title=${encodeURIComponent(clearFormatting(change.title))}&body=${encodeURIComponent(clearFormatting(change.description))}`
                    }
                })
            } catch (error) {
                //silently fail
                errorHelper('updater.notifications.sendPushError', { session: { user: userId }}, error.message)
            }
        }
    }
}