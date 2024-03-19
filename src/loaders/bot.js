import { Client, Collection, GatewayIntentBits } from 'discord.js';
import { readdirSync } from 'fs';
import { discordToken } from "../config/index.js";

export const bot = new Client({ intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildWebhooks,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.MessageContent
]});

export default async () => {
    // make collection where cmds can be read from, listed, etc.
    bot.commands = new Collection();

    // register commands
    const commandFiles = readdirSync("./src/bot/commands/").filter(file => file.endsWith(".js"));
    for (const file of commandFiles) {
        const command = (await import(`../bot/commands/${file}`)).default;
        bot.commands.set(command.commandData.name, command);
    }

    // load events
    const eventFiles = readdirSync("./src/bot/events/").filter(file => file.endsWith(".js"));
    for (const file of eventFiles) {
        const eventName = file.split(".")[0];
        const event = (await import(`../bot/events/${file}`)).default;
        // REST rate limited event
        if (eventName === "rateLimited") bot.rest.on(eventName, event.bind(null, bot));
        bot.on(eventName, event.bind(null, bot));
    }

    await bot.login(discordToken);
};