import axios from "axios";
import { client, discordClientSecret, discordServerId } from "../../../config/index.js";
import { bot } from "../../../loaders/bot.js";
import { User } from "../../../models/index.js";
import { errorHelper } from "../../../utils/index.js";

export default async (req, res) => {
    const params = new URLSearchParams();
    params.append('client_id', bot.user.id);
    params.append('client_secret', discordClientSecret);
    params.append('grant_type', 'authorization_code');
    params.append('code', req.query.code);
    params.append('redirect_uri', `${client.url}/auth/discord/callback`);

    // get access token from discord using the oauth code
    const { data: { access_token, token_type } } = await axios.post('https://discord.com/api/oauth2/token', params)
        .catch((err) => {
            return res.status(500).json(errorHelper('discordOauthCallback.tokenError', req, err.message))
        });

    // get the users id
    const { data: { id: userId } } = await axios.get('https://discord.com/api/users/@me', {
            headers: { authorization: `${token_type} ${access_token}` }
        })
        .catch((err) => {
            return res.status(500).json(errorHelper('discordOauthCallback.userIdentifyError', req, err.message))
        });

    // store the id in the database
    await User.findOneAndUpdate({ _id: req.session.user }, { discordId: userId })
        .catch((err) => {
            return res.status(500).json(errorHelper('discordOauthCallback.userUpdateError', req, err.message))
        });

    // join the user to the discord server
    await axios.put(`https://discord.com/api/guilds/${discordServerId}/members/${userId}`, 
        { 'access_token': access_token },
        { headers: { 
            "Authorization": `Bot ${bot.token}`,
            "Content-Type": "application/json"
        }})
        .catch((err) => {
            console.log(err);
            return res.status(500).json(errorHelper('discordOauthCallback.userJoinServerError', req, err.message))
        });

    res.redirect("/settings");
}