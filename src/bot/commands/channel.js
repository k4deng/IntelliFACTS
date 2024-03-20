import { ApplicationCommandOptionType } from "discord-api-types/v9";
import { success, error, question, awaitButton } from "../functions.js";
import {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    ChannelType, ComponentType,
    EmbedBuilder,
    StringSelectMenuBuilder,
    StringSelectMenuOptionBuilder
} from "discord.js";
import { Setting, User } from "../../models/index.js";
import { client } from "../../config/index.js";

const commandData = {
    name: "channel",
    description: "Channel functions.",
    options: [{
        name: "create",
        type: ApplicationCommandOptionType.Subcommand,
        description: "Create a new channel in your category.",
        options: [{
            name: "name",
            type: ApplicationCommandOptionType.String,
            description: "Name of the channel to create.",
            required: false,
        }],
    }, {
        name: "delete",
        type: ApplicationCommandOptionType.Subcommand,
        description: "Deletes the current channel.",
        options: [],
    }, {
        name: "edit",
        type: ApplicationCommandOptionType.SubcommandGroup,
        description: "Edit the current channel.",
        options: [{
            name: "elements",
            type: ApplicationCommandOptionType.Subcommand,
            description: "Edit what elements are sent to the current channel.",
            options: [],
        }, {
            name: "name",
            type: ApplicationCommandOptionType.Subcommand,
            description: "Rename the current channel.",
            options: [{
                name: "name",
                type: ApplicationCommandOptionType.String,
                description: "Name to rename to.",
                required: true,
            }],
        }],
    }]
}

async function run(bot, interaction) {
    const subcommand = interaction.options.getSubcommand();

    await interaction.deferReply({ ephemeral: true })

    // find user category
    const userCategory = interaction.guild.channels.cache.find(c => c.type === ChannelType.GuildCategory && c.name === interaction.user.username)
    if (!userCategory) return error("You must first set up your user with <\/start:1219451314518495335>.", interaction)

    if (subcommand === "create") {
        // check if limit from user settings is already reached
        const user = await User.findOne({ discordId: interaction.user.id }).exec()
        const { updater: { botMaxChannels } } = await Setting.findOne({ userId: user._id }).exec()
        const numChannels = interaction.guild.channels.cache.filter(c => c.type === ChannelType.GuildText && c.parentId === userCategory.id).size
        if (numChannels >= botMaxChannels) return error("You have reached the maximum number of channels you can create.", interaction, true)

        // create new channel in category
        const newChannel = await interaction.guild.channels.create({
            name: interaction.options.get("name")?.value ?? `${interaction.user.username}-${numChannels + 1}`,
            reason: "User setup",
            type: ChannelType.GuildText,
            parent: userCategory
        })

        // create webhook for new channel
        const webhook = await newChannel.createWebhook({ name: client.name, reason: `Webhook for ${interaction.user.username}` })

        // update db with new channel
        await Setting.findOneAndUpdate(
            { userId: user._id },
            { $push: {
                "updater.notifications": {
                    channelId: newChannel.id,
                    webhook: webhook.url,
                    sentElements: []
                }
            }}
        )

        // send success message
        return success(`New channel <#${newChannel.id}> created!`, interaction, true)
    } else

    if (subcommand === "delete") {
        if (interaction.channel.parentId !== userCategory.id) return error("You can only delete channels in your user category.", interaction)

        // make sure user wants to delete the channel
        const confButton = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId(`deleteChannelBtn-${interaction.user.id}-${interaction.channel.id}`)
                    .setLabel("Confirm")
                    .setStyle(ButtonStyle.Danger),
            );
        const embed = question(`Are you sure you want to delete <#${interaction.channel.id}>?`, interaction, true, true)
        await interaction.editReply({ embeds: [embed], components: [confButton] });
        const confirm = await awaitButton(interaction, `deleteChannelBtn-${interaction.user.id}-${interaction.channel.id}`, 20000);

        // timed out or rejected
        if (!confirm) {
            const timedOutEmbed = error(`Deletion of <#${interaction.channel.id}> was cancelled`, interaction, true, true)
            return interaction.editReply({ embeds: [timedOutEmbed], components: [] });
        }

        // delete channel
        const user = await User.findOne({ discordId: interaction.user.id }).exec()
        await Setting.findOneAndUpdate(
            { userId: user._id },
            { $pull: {
                    "updater.notifications": {
                        channelId: interaction.channel.id
                    }
                }},
            { safe: true, multi: false }
        )

        await interaction.channel.delete().catch(err => {
            return error("An error occurred while deleting the channel: " + err, interaction);
        })
    } else

    if (subcommand === "name") {
        const newName = interaction.options.get("name").value

        if (interaction.channel.parentId !== userCategory.id) return error("You can only rename channels in your user category.", interaction)
        if (interaction.channel.name === newName) return error("The new name must be different from the current name.", interaction)

        // the discord rate limit for this is 2 requests per 10 minutes
        await interaction.channel.setName(newName).catch(err => {
            return error("An error occurred while renaming the channel: " + err, interaction);
        })

        return success(`Channel renamed to \`${newName}\``, interaction)
    } else

    if (subcommand === "elements") {
        // send embed with currently active elements
        // add 2 action rows each with a multislect menu with info and data elements respectively
        // (user can select and deselect elements to add and remove which are being sent to current channel)
        // (embed updates with each change)
        success("Elements edited!", interaction, true)
    }
}

export default { commandData, run };
