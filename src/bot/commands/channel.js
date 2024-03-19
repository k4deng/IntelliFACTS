import { ApplicationCommandOptionType } from "discord-api-types/v9";
import { success, error, loading } from "../functions.js";
import { EmbedBuilder } from "discord.js";

const commandData = {
    name: "channel",
    description: "Edit the current channel",
    options: [{
        name: "create",
        type: ApplicationCommandOptionType.Subcommand,
        description: "Create a new channel in your category.",
        options: [],
    }, {
        name: "edit",
        type: ApplicationCommandOptionType.SubcommandGroup,
        description: "Edit the current channel.",
        options: [{
            name: "elements",
            type: ApplicationCommandOptionType.Subcommand,
            description: "Edit what elements are sent to the current channel",
            options: [],
        }],
    }]
}

async function run(bot, interaction) {
    const subcommand = interaction.options.getSubcommand();

    if (subcommand === "create") {
        // find user category
        // create new channel in category
        success("Channel created! Do `/channel edit elements` to edit elements!", interaction, true)
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
