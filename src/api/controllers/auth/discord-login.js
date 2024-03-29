import { client } from "../../../config/index.js"
import { bot } from "../../../loaders/bot.js";

export default async (req, res) => {
    return res.redirect(`https://discord.com/api/oauth2/authorize?client_id=${bot.user.id}&redirect_uri=${encodeURIComponent(`${client.url}/auth/discord/callback`)}&response_type=code&scope=identify+guilds.join&prompt=consent`);
};