import { client } from "../config/index.js";
import fetch from "node-fetch";

//TODO: one again add proper error handling 😭
//TODO: test with info changes

async function _sendDiscordWebhook(url, fields, title) {

    try {
        // sort embeds in a better format for fields
        let embedsResult =[];

        //split embeds into chunks of 25 as embeds can only have 25 fields
        while (fields.length > 0) {

            let chunk = fields.splice(0,25)
            let fieldsResult = [];

            for (const [key, val] of Object.entries(chunk)){
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
    } catch(e) {
        console.log(e)
    }
}

export async function sendToDiscord(url, data) {

    for (let [key, val] of  Object.entries(data)) {
        //send webhook
        await _sendDiscordWebhook(url, val, key !== "info_changes" ? `${key} Data Update` : undefined)
    }

}