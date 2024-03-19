import { InteractionType } from 'discord.js';

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
        
    }
}