import { InteractionType } from 'discord.js';
import { User, Setting } from "../../models/index.js";
import { sendToDiscord } from "../../updater/index.js";

export default async (bot, interaction) => {

    // slash command handling
    if (interaction.type === InteractionType.ApplicationCommand) {
        // get command data
        const cmd = bot.commands.get(interaction.commandName);
        
        // if command doesn't exist, do nothing
        if (!cmd) return;
        
        // run command
        try {
            await cmd.run(bot, interaction);
        } catch (e) {
            console.error(e);
            if (interaction.replied)
                interaction.followUp({ content: `There was a problem with your request.\n\`\`\`${e.message}\`\`\``, ephemeral: true })
                    .catch(e => console.error("An error occurred following up on an error", e));
            else
            if (interaction.deferred)
                interaction.editReply({ content: `There was a problem with your request.\n\`\`\`${e.message}\`\`\``, ephemeral: true })
                    .catch(e => console.error("An error occurred following up on an error", e));
            else
                interaction.reply({ content: `There was a problem with your request.\n\`\`\`${e.message}\`\`\``, ephemeral: true })
                    .catch(e => console.error("An error occurred replying on an error", e));
        }
        
    } else

    // button handling (only for testing style buttons)
    if (interaction.isButton()) {
        if (interaction.customId.startsWith('testStyle')) {
            const [, btnUserId, btnChannelId] = interaction.customId.split('-');

            // find settings for button channel
            const user = await User.findOne({ discordId: btnUserId }).exec()
            const { updater: { discordNotifications } } = await Setting.findOne({ userId: user._id }).exec()
            const { webhook, style } = discordNotifications.find(n => n.channelId === btnChannelId)

            // make button stop loading
            await interaction.update({ content: '' });

            const dummyData = {
                "English": [{
                    "element": "Assignment Added (Graded)",
                    "title": "`Vocabulary` (`Homework`) Added:",
                    "description": "Grade: `95`"
                }, {
                    "element": "Assignment Grade Changed",
                    "title": "`Article Worksheet` (`Homework`) Updated:",
                    "description": "`75 (15/20)` ⇒ `100 (20/20)`"
                }],
                "info_changes": [{
                    "element": "Grade Changed",
                    "title": "English Grade Change",
                    "description": "`93 (A)` ⇒ `94 (A)`"
                }]
            }

            // send message
            await sendToDiscord(webhook, dummyData, style, user._id)
        }
    }
}