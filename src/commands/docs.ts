import { utils } from "@aeroware/aeroclient";
import { Command } from "@aeroware/aeroclient/dist/types";
import { MessageEmbed } from "discord.js";
import { decode } from "html-entities";
import fetch from "node-fetch";

export default {
    name: "docs",
    aliases: ["d"],
    category: "utility",
    description: "Fetches documentation from discord or MDN.",
    details: "use 'djs' or 'mdn' as the first argument",
    usage: "<djs/mdn> <query>",
    minArgs: 2,
    async callback({ message, args }) {
        const [platform, ...search] = args;
        const query = search.join(" ");

        if (platform !== "djs" && platform !== "mdn") {
            message.channel.send(
                "Invalid platform. Allowed platforms are 'djs' and 'mdn'."
            );
            return;
        }

        if (!query) {
            message.channel.send("No query given.");
            return;
        }

        if (platform === "djs") {
            try {
                const res = await fetch(
                    `https://djsdocs.sorta.moe/v2/embed?src=stable&q=${encodeURIComponent(
                        query
                    )}`
                );
                const embed = await res.json();

                message.channel.send(
                    embed ? { embed } : "Cannot find any matches."
                );
                return;
            } catch {
                message.channel.send(
                    "There was a network error querying your request."
                );
                return;
            }
        } else {
            const res = await fetch(
                `https://developer.mozilla.org/api/v1/search/en-US?q=${encodeURIComponent(
                    query
                )}`
            );
            const json = await res.json();

            message.channel.send(
                new MessageEmbed()
                    .setColor("RANDOM")
                    .setDescription(
                        decode(
                            utils.trim(
                                json.documents
                                    .slice(0, 3)
                                    .map(
                                        (doc: any) =>
                                            `**[${doc.title}](https://developer.mozilla.org/${doc.mdn_url})**\n`.replace(
                                                /_/g,
                                                "\\_"
                                            ) +
                                            `\`\`\`js\n${doc.highlight.body
                                                .join(" ")
                                                .replace(
                                                    /<\/?mark>/g,
                                                    ""
                                                )}\`\`\``
                                    )
                                    .join("\n\n"),
                                2048
                            )
                        )
                    )
                    .addField("\u200b", `Search results for \`${query}\``)
                    .setAuthor(
                        "Mozilla Developer Network [Full Results]",
                        "https://developer.mozilla.org/static/img/opengraph-logo.72382e605ce3.png",
                        `https://developer.mozilla.org/en-US/search?q=${encodeURIComponent(
                            query
                        )}`
                    )
            );
        }
    },
} as Command;
