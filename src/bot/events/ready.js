import { ActivityType } from "discord.js";

export default async (bot) => {
    // log that bot is ready
    console.log(`Bot logged in as ${bot.user.tag}`);

    // makes sure that client.application has the latest info
    bot.application = await bot.application.fetch();

    // set activity
    bot.user.setActivity({
        type: ActivityType.Custom,
        name: "custom",
        state: "Scanning your grades..."
    });
}