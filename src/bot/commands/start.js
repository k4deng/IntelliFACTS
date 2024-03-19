import { success, error, loading } from "../functions.js";
import { EmbedBuilder } from "discord.js";

const commandData = {
    name: "start",
    description: "Sets up the bot for your user.",
    options: []
}

async function run(bot, interaction) {
    await interaction.deferReply();

    // if user is not linked in database
        // error("You must first link your account with the bot. Go to [settings](http://example.com) to link your account.", interaction, true)

    loading("Setting up...", interaction, true)

    // if categories already set up
        // error("Your user has already been set up!", interaction, true)

    // create category
    // give user permissions to view and talk in category
    // send embed with how to use
    const embed = new EmbedBuilder()
        .setColor("#0099ff")
        .setAuthor({ name: bot.user.username , iconURL: bot.user.displayAvatarURL() })
        .setTitle(`How do I use the ${bot.user.username} bot?`)
        .setDescription("1. Run `/channel create` to create a new channel in your category.\
        \n\n2. Run `/channel edit elements` to select what elements you want sent to the newly created channel.")

    await interaction.editReply({ embeds: [embed] })

}

export default { commandData, run };
