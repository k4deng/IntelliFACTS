import { EmbedBuilder, PermissionsBitField } from "discord.js";

const error = (message, interaction, ephemeral = false, returnValue) => {
    const emoji = interaction.guild.members.me.permissions.has(PermissionsBitField.Flags.UseExternalEmojis) ? "<:red:813181113056755762>" : ":negative_squared_cross_mark:";
    const embed = new EmbedBuilder()
        .setColor(15158332)
        .setDescription(`${emoji} ${message}`);
    if (returnValue) {
        return embed;
    } else {
        if (interaction.replied)
            return interaction.followUp({ embeds: [embed], ephemeral: ephemeral });
        else
        if (interaction.deferred)
            return interaction.editReply({ embeds: [embed], ephemeral: ephemeral });
        else
            return interaction.reply({ embeds: [embed], ephemeral: ephemeral });
    }
}

const question = (message, interaction, ephemeral = false, returnValue) => {
    const emoji = interaction.guild.members.me.permissions.has(PermissionsBitField.Flags.UseExternalEmojis) ? "<:yellow:1219455714741850202>" : ":question:";
    const embed = new EmbedBuilder()
        .setColor(15198012)
        .setDescription(`${emoji} ${message}`);
    if (returnValue) {
        return embed;
    } else {
        if (interaction.replied)
            return interaction.followUp({ embeds: [embed], ephemeral: ephemeral });
        else
        if (interaction.deferred)
            return interaction.editReply({ embeds: [embed], ephemeral: ephemeral });
        else
            return interaction.reply({ embeds: [embed], ephemeral: ephemeral });
    }
}

const success = (message, interaction, ephemeral = false, returnValue) => {
    const emoji = interaction.guild.members.me.permissions.has(PermissionsBitField.Flags.UseExternalEmojis) ? "<:green:813181113010356304>" : ":white_check_mark:";
    const embed = new EmbedBuilder()
        .setColor(3066993)
        .setDescription(`${emoji} ${message}`);
    if (returnValue) {
        return embed;
    } else {
        if (interaction.replied)
            return interaction.followUp({ embeds: [embed], ephemeral: ephemeral });
        else
        if (interaction.deferred)
            return interaction.editReply({ embeds: [embed], ephemeral: ephemeral });
        else
            return interaction.reply({ embeds: [embed], ephemeral: ephemeral });
    }
}

const loading = (message, interaction, ephemeral = false, returnValue) => {
    const emoji = interaction.guild.members.me.permissions.has(PermissionsBitField.Flags.UseExternalEmojis) ? "<a:loading:813181113148899330>" : ":arrows_counterclockwise:";
    const embed = new EmbedBuilder()
        .setColor(4565214)
        .setDescription(`${emoji} ${message}`);
    if (returnValue) {
        return embed;
    } else {
        if (interaction.replied)
            return interaction.followUp({ embeds: [embed], ephemeral: ephemeral });
        else
        if (interaction.deferred)
            return interaction.editReply({ embeds: [embed], ephemeral: ephemeral });
        else
            return interaction.reply({ embeds: [embed], ephemeral: ephemeral });
    }
}

async function awaitButton(interaction, id, limit = 60000) {
    const filter = i => (i.customId === id && i.user.id === interaction.user.id);
    try {
        return await interaction.channel.awaitMessageComponent({ filter, time: limit })
            .then(() => {
                return true;
            })
            .catch(() => {
                return false;
            });
    } catch (e) {
        return false;
    }
}

export { error, question, success, loading, awaitButton };