import { utils } from "@aeroware/aeroclient";
import { Command } from "@aeroware/aeroclient/dist/types";
import { MessageEmbed } from "discord.js";
import fetch from "node-fetch";

const langs = [
    {
        aliases: ["js", "javascript"],
        compiler: "nodejs-14.0.0",
    },
    {
        aliases: ["ts", "typescript"],
        compiler: "typescript-3.9.5",
    },
];

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
    async callback({ message, args, client, text }) {
        const lang = args[0].slice(3).trim();

        if (!lang) return message.channel.send(`No language was provided.`);

        if (!langs.find(({ aliases }) => aliases.includes(lang))) return message.channel.send(`Unsupported language.`);

        const code = text.match(regex.codeblock)?.[1].trim();

        if (!code) return message.channel.send(`No code was provided.`);

        const toEdit = await message.channel.send(
            new MessageEmbed().setTitle("Code input").setAuthor(message.author.tag, message.author.displayAvatarURL()).setDescription(`\`\`\`${lang}\n${code}\n\`\`\``)
        );

        const { compiler } = langs.find(({ aliases }) => aliases.includes(lang))!;

        const output = await (
            await fetch("https://wandbox.org/compile", {
                method: "POST",
                headers: {
                    "content-type": "application/json",
                },
                body: JSON.stringify({
                    compiler,
                    code,
                    codes: [],
                    stdin: "",
                    options: "",
                    "runtime-option-raw": "",
                }),
            })
        ).text();

        const info: { code: number; output: string[]; isOutput: boolean; isError: boolean } = {
            code: 0,
            output: [],
            isOutput: false,
            isError: false,
        };

        const raw = output.split("\n\n\r").map((l) => l.trim());

        raw.forEach((line) => {
            const payload = line.split("\r\n").slice(1).join("\r\n");

            if (payload) {
                payload.split("\n").forEach((load) => {
                    if (info.isError) return info.output.push(load.slice("data: ".length));

                    const stuff = load.slice("data: ".length).split(":");

                    const header = stuff[0];
                    const data = stuff.slice(1).join(":");

                    if (!data) {
                        if (info.isOutput) info.output.push(header);

                        return;
                    }

                    switch (header) {
                        case "SyntaxError":
                        case "TypeError":
                        case "ReferenceError":
                        case "RangeError":
                        case "EvalError":
                        case "URIError":
                        case "AggregateError":
                        case "InternalError":
                        case "Error": {
                            info.isError = true;
                            info.output.push(load.slice("data: ".length));
                            break;
                        }

                        case "StdErr":
                        case "StdOut": {
                            info.isOutput = true;
                            info.output.push(data);
                            break;
                        }

                        case "ExitCode": {
                            info.code = parseInt(data);
                            break;
                        }
                    }

                    return;
                });

                info.isError = false;
                info.isOutput = false;
            }
        });

        return toEdit.edit(
            new MessageEmbed()
                .setTitle("Code output")
                .setAuthor(message.author.tag, message.author.displayAvatarURL())
                .setDescription(`\`\`\`\n${utils.trim(info.output.join("\n"), 2000)}\n\`\`\``)
                .setFooter(`Program exited with code ${info.code}.`)
        );
    },
} as Command;
