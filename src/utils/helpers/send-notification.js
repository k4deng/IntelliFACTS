import fetch from "node-fetch";
import { client, vapidPrivateKey, vapidPublicKey } from "../../config/index.js";
import { bot } from "../../loaders/bot.js";
import webpush from "web-push";

/**
 * Sends a POST request to a Discord webhook.
 * @param {string} url - The URL of the Discord webhook.
 * @param {Object[]} [embeds=null] - An array of embed objects to send with the webhook.
 * @param {string} [content=null] - The content of the message to send with the webhook.
 * @returns {Promise<Response>} The Response object representing the response from the Discord API.
 */
export async function sendDiscordWebhook(url, embeds = null, content = null){
    return await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            username: client.name,
            avatar_url: bot.user.displayAvatarURL(),
            ...(embeds ? { embeds: embeds } : {}),
            ...(content ? { content: content } : {}),
        })
    })
}

/**
 * Sends a Web Push Notification.
 * @param {string} endpoint - The endpoint associated with the push subscription.
 * @param {Object} keys - The keys associated with the push subscription.
 * @param {Object} pushData - The data to be sent with the push notification.
 * @param {Object} [options={}] - Optional parameters for the push notification.
 * @returns {Promise} A Promise that resolves once the notification has been sent.
 */
export async function sendWebPushNotification(endpoint, keys, pushData, options = {}){
    return await webpush.sendNotification({ endpoint: endpoint, keys: keys }, JSON.stringify(pushData), {
        vapidDetails: {
            subject: client.url,
            publicKey: vapidPublicKey,
            privateKey: vapidPrivateKey,
        },
        ...options,
    })
}