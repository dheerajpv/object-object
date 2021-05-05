import { utils } from "@aeroware/aeroclient";
import { Command } from "@aeroware/aeroclient/dist/types";
import { MessageEmbed } from "discord.js";
import exec from "../util/exec";

const regex = {
    codeblock: /```\w+(.+)```/s,
} as const;

export default {
    name: "exec",
    aliases: [],
    category: "utility",
    cooldown: 5,
    description: "Executes some code in a codeblock.",
    details: "Currently only supports JavaScript and TypeScript.",
    usage: "<code>",
    async callback({ message, args, text }) {
        const lang = args[0].slice(3).trim();

        if (!lang) return message.channel.send("No language was provided");

        const code = text.match(regex.codeblock)?.[1].trim();

        if (!code) return message.channel.send("No code was provided.");

        const toEdit = await message.channel.send(
            new MessageEmbed()
                .setTitle("Code input")
                .setAuthor(
                    message.author.tag,
                    message.author.displayAvatarURL()
                )
                .setDescription(`\`\`\`${lang}\n${code}\n\`\`\``)
        );

        try {
            const info = await exec(code, lang);

            return toEdit.edit(
                new MessageEmbed()
                    .setTitle("Code output")
                    .setAuthor(
                        message.author.tag,
                        message.author.displayAvatarURL()
                    )
                    .setDescription(
                        `\`\`\`\n${utils.trim(
                            info.output.join("\n"),
                            2000
                        )}\n\`\`\``
                    )
                    .setFooter(`Program exited with code ${info.code}.`)
            );
        } catch (e) {
            return message.channel.send(e.message);
        }
    },
} as Command;
