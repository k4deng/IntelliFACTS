import { log } from "console";
import { User } from "../../models/index.js";
import { codeBlock } from "discord.js";
import { inspect } from "util";

async function _clean(bot, text) {
    if (text && text.constructor.name == "Promise")
      text = await text;
    if (typeof text !== "string")
      text = inspect(text, {depth: 1});
  
    text = text
      .replace(/`/g, "`" + String.fromCharCode(8203))
      .replace(/@/g, "@" + String.fromCharCode(8203));
  
    text = text.replaceAll(bot.token, "[REDACTED]");
  
    return text;
}

function _splitMessage(text, { maxLength = 2_000, char = "\n", prepend = "", append = "" } = {}) {
    if (text.length <= maxLength) return [text];
    let splitText = [text];
    if (Array.isArray(char)) {
      while (char.length > 0 && splitText.some(elem => elem.length > maxLength)) {
        const currentChar = char.shift();
        if (currentChar instanceof RegExp) {
          splitText = splitText.flatMap(chunk => chunk.match(currentChar));
        } else {
          splitText = splitText.flatMap(chunk => chunk.split(currentChar));
        }
      }
    } else {
      splitText = text.split(char);
    }
    if (splitText.some(elem => elem.length > maxLength)) throw new RangeError("SPLIT_MAX_LEN");
    const messages = [];
    let msg = "";
    for (const chunk of splitText) {
      if (msg && (msg + char + chunk + append).length > maxLength) {
        messages.push(msg + append);
        msg = prepend;
      }
      msg += (msg && msg !== prepend ? char : "") + chunk;
    }
    return messages.concat(msg).filter(m => m);
}

export default async (bot, message) => {
    // Ignore all bots
    if (message.author.bot) return;

    // Ignore non-admins
    const admins = await User.find({ type: "admin" }).exec();
    admins.filter(admin => admin.discordId !== null); //Remove any admins without a discordId
    const adminDiscordIds = admins.map(admin => admin.discordId);
    if (!adminDiscordIds.includes(message.author.id)) return;

    // Eval command
    const command = message.content.split(" ")[0];
    const args = message.content.split(" ").slice(1);
    if (command === "!eval"){
        const code = args.join(" ");
        const evaled = eval(code);
        const cleaned = await _clean(bot, evaled);

        const text = _splitMessage(cleaned, { maxLength: "1950" });
        
        for (const split of text) {
            message.channel.send(codeBlock("js", split));
        }
    }
}