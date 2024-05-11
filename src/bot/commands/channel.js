import { ApplicationCommandOptionType } from "discord-api-types/v9";
import { success, error, question, awaitButton } from "../functions.js";
import {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    ChannelType, ComponentType,
    EmbedBuilder
} from "discord.js";
import { Setting, User } from "../../models/index.js";
import { client } from "../../config/index.js";
import { sentElementsEnum, styleEnum } from "../../models/setting.js";

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
        }, {
            name: "style",
            type: ApplicationCommandOptionType.Subcommand,
            description: "Change the style of messages in the current channel.",
            options: [],
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
                "updater.discordNotifications": {
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
                    "updater.discordNotifications": {
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

    if (subcommand === "style") {
        if (interaction.channel.parentId !== userCategory.id) return error("You must run this in a channel in your user category!", interaction)

        // find settings for current channel
        const user = await User.findOne({ discordId: interaction.user.id }).exec()
        const { updater: { discordNotifications } } = await Setting.findOne({ userId: user._id }).exec()
        const { style } = discordNotifications.find(n => n.channelId === interaction.channel.id)

        const capitalize = s => s && s[0].toUpperCase() + s.slice(1)
        let styleChoices = [];
        for (const item of styleEnum) {
            styleChoices.push({ name: capitalize(item), value: item })
        }

        // make select menu for style
        const components = [{
            type: ComponentType.ActionRow,
            components: [{
                type: ComponentType.StringSelect,
                customId: `styleSelect-${interaction.user.id}-${interaction.channel.id}`,
                placeholder: "Select style",
                options: styleChoices.map(s => ({
                    label: s.name,
                    value: s.value,
                    default: s.value === style
                }))
            }]
        }, {
            type: ComponentType.ActionRow,
            components: [{
                type: ComponentType.Button,
                style: ButtonStyle.Primary,
                label: "Send Test",
                customId: `testStyle-${interaction.user.id}-${interaction.channel.id}`
            }]
        }]

        // send initial embed
        const embed = new EmbedBuilder()
            .setColor("#0099ff")
            .setTitle("Edit Message Style")
            .setDescription("Select the style you want for messages in this channel. Changes are automatically saved.\n\n" +
                "• **Fancy**: Each message in Discord is sent with the most formatting, but notifications on devices are useless and show no information.\n" +
                "• **Optimized**: Best of both worlds. Messages are sent as embeds with some formatting, and notifications work well, but they have formatting characters in them.\n" +
                "• **Plain**: Each message is sent without embeds, and notifications work well with very few formatting characters in them. (Formatting is required for readability in messages)\n\n" +
                "*For notifications only, `Plain` works the best. If you want to be able to read history in Discord, `Optimized` or `Fancy` will be better.*")
        const initialMessage = await interaction.editReply({ embeds: [embed], components: components });

        const selectCollector = initialMessage.createMessageComponentCollector({
            componentType: ComponentType.StringSelect,
            time: 900000
        });

        let finalStyle = style;

        selectCollector.on('collect', async i => {
            // update db with new style
            await Setting.findOneAndUpdate(
                { userId: user._id },
                { $set: { "updater.discordNotifications.$[elem].style": i.values[0] }},
                { arrayFilters: [{ "elem.channelId": interaction.channel.id }] }
            )

            finalStyle = i.values[0];

            // update components with new values
            components[0].components[0].options = styleChoices.map(s => ({
                label: s.name,
                value: s.value,
                default: s.value === finalStyle
            }))

            // send updated components
            await i.update({ components: components })
        });

        selectCollector.once('end', async () => {
            const finalEmbed = success(`Style set to \`${capitalize(finalStyle)}\``, interaction, true, true)
            return interaction.editReply({ embeds: [finalEmbed], components: [] });
        });

    } else

    if (subcommand === "elements") {
        if (interaction.channel.parentId !== userCategory.id) return error("You must run this in a channel in your user category!", interaction)

        // find sent elements for the current channel
        const user = await User.findOne({ discordId: interaction.user.id }).exec()
        const { updater: { discordNotifications } } = await Setting.findOne({ userId: user._id }).exec()
        const { sentElements } = discordNotifications.find(n => n.channelId === interaction.channel.id)

        // get info and data sent elements enum
        const elementEnums = {
            info: sentElementsEnum.info,
            data: sentElementsEnum.data
        }

        // make select menus for info and data elements
        let components = [{
            type: ComponentType.ActionRow,
            components: [{
                type: ComponentType.StringSelect,
                customId: `infoSelect-${interaction.user.id}-${interaction.channel.id}`,
                placeholder: "Select info elements",
                minValues: 0,
                maxValues: elementEnums.info.length,
                options: elementEnums.info.map(e => ({
                    label: e,
                    value: e,
                    default: sentElements.includes(e)
                }))
            }]
        }, {
            type: ComponentType.ActionRow,
            components: [{
                type: ComponentType.StringSelect,
                customId: `dataSelect-${interaction.user.id}-${interaction.channel.id}`,
                placeholder: "Select data elements",
                minValues: 0,
                maxValues: elementEnums.data.length,
                options: elementEnums.data.map(e => ({
                    label: e,
                    value: e,
                    default: sentElements.includes(e)
                }))
            }]
        }]

        // send initial embed
        const embed = new EmbedBuilder()
            .setColor("#0099ff")
            .setTitle("Edit elements")
            .setDescription("Select the elements you want to be sent to this channel. Changes are automatically saved.")
        const initialMessage = await interaction.editReply({ embeds: [embed], components: components });

        const collector = initialMessage.createMessageComponentCollector({
            componentType: ComponentType.StringSelect,
            time: 900000
        });

        let finalInfoElements = sentElements.filter(e => elementEnums.info.includes(e))
        let finalDataElements = sentElements.filter(e => elementEnums.data.includes(e))

        collector.on('collect', async i => {
            if (i.customId.startsWith("infoSelect")) finalInfoElements = i.values
            if (i.customId.startsWith("dataSelect")) finalDataElements = i.values

            // update db with new elements
            await Setting.findOneAndUpdate(
                { userId: user._id },
                { $set: { "updater.discordNotifications.$[elem].sentElements": [...finalInfoElements, ...finalDataElements] }},
                { arrayFilters: [{ "elem.channelId": interaction.channel.id }] }
            )

            // update components with new values
            components[0].components[0].options = elementEnums.info.map(e => ({
                label: e,
                value: e,
                default: finalInfoElements.includes(e)
            }))
            components[1].components[0].options = elementEnums.data.map(e => ({
                label: e,
                value: e,
                default: finalDataElements.includes(e)
            }))

            // send updated components
            await i.update({ components: components })
        });

        collector.once('end', async () => {
            let infoText = "*None*"
            let dataText = "*None*"
            if (finalInfoElements.length !== 0) infoText = "• " + finalInfoElements.join("\n• ")
            if (finalDataElements.length !== 0) dataText = "• " + finalDataElements.join("\n• ")

            const finalEmbed = new EmbedBuilder()
                .setColor("#0099ff")
                .setTitle("Elements sent to the current channel:")
                .setFields([{
                    name: "Info",
                    value: infoText,
                    inline: true
                }, {
                    name: "Data",
                    value: dataText,
                    inline: true
                }])
            return interaction.editReply({ embeds: [finalEmbed], components: [] });
        });
    }
}

export default { commandData, run };