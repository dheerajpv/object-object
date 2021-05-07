import { utils } from "@aeroware/aeroclient";
import { Command } from "@aeroware/aeroclient/dist/types";
import { stripIndent } from "common-tags";
import { MessageEmbed } from "discord.js";
import { getCode, getLang } from "../../utils/codeblock";
import exec from "../../utils/exec";

export default {
    name: "exec",
    category: "utility",
    cooldown: 5,
    description: "Executes some code in a codeblock.",
    details: "Currently only supports JavaScript and TypeScript.",
    usage: "<code>",
    async callback({ message, text }) {
        const lang = getLang(text);

        if (!lang) return message.channel.send("No language was provided");

        const code = getCode(text);

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

            let desc = "";

            if (!info.compiler && !info.output) {
                desc += "There is no output.";
            }

            if (info.compiler || info.raw.compiler_message) {
                desc += stripIndent`
                    Compiler output:
                    \`\`\`${info.compiler || info.raw.compiler_message}\`\`\`
                `;
            }

            if (info.output) {
                desc += stripIndent`
                    Program output:
                    \`\`\`${info.output}\`\`\`
                `;
            }

            return toEdit.edit(
                new MessageEmbed()
                    .setTitle("Output")
                    .setAuthor(
                        message.author.tag,
                        message.author.displayAvatarURL()
                    )
                    .setDescription(utils.trim(desc, 2000))
                    .setFooter(`Program exited with code ${info.code}.`)
            );
        } catch (e) {
            return message.channel.send(e.message);
        }
    },
} as Command;
