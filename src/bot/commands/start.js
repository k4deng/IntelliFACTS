import { success, error, loading } from "../functions.js";
import { ChannelType, EmbedBuilder, PermissionFlagsBits } from "discord.js";
import { client } from "../../config/index.js";
import { User, Setting } from "../../models/index.js";

const commandData = {
    name: "start",
    description: "Sets up the bot for your user.",
    options: []
}

async function run(bot, interaction) {
    await interaction.deferReply({ ephemeral: true })

    // find linked user in database
    const user = await User.findOne({ discordId: interaction.user.id }).exec()
    if (!user) return error(`You must first link your account with the bot. Go to [settings](${client.url}/settings) to link your account.`, interaction)

    // if user has already been set up, error
    const userCategory = interaction.guild.channels.cache.find(c => c.type === ChannelType.GuildCategory && c.name === interaction.user.username)
    if (userCategory) return error("Your user has already been set up!", interaction)

    // User has not been set up, so set up user
    loading("Setting up...", interaction)

    // create category and channel
    const newCategory = await interaction.guild.channels.create({
        name: interaction.user.username,
        reason: "User setup",
        type: ChannelType.GuildCategory,
        permissionOverwrites: [{
            id: interaction.user.id,
            allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages],
        }, {
            id: bot.user.id,
            allow: [PermissionFlagsBits.ViewChannel],
        }, {
            id: interaction.guild.id,
            deny: [PermissionFlagsBits.ViewChannel],
        }],
    })
    const newChannel = await interaction.guild.channels.create({
        name: `${interaction.user.username}-1`,
        reason: "User setup",
        type: ChannelType.GuildText,
        parent: newCategory
    })

    // create webhook for new channel
    const webhook = await newChannel.createWebhook({ name: client.name, reason: `Webhook for ${interaction.user.username}` })
    //TODO: when sending notification get avatar and username from bot

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

    // send embed with how to use
    const embed1 = success("Your user has been set up!", interaction, true, true)
    const embed2 = new EmbedBuilder()
        .setColor("#0099ff")
        .setTitle(`How do I use the ${bot.user.username} bot?`)
        .setDescription("1. Go to your newly created channel (<#"+newChannel.id+">)\
        \n2. Run <\/channel edit elements:1219451314518495334> to select what elements you want sent to the channel.\
        \n3. Run <\/channel create:1219451314518495334> if you wish to create more channels in your category.")
    await interaction.editReply({ embeds: [embed1, embed2] })
}

export default { commandData, run };
