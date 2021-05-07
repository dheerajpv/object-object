import { utils } from "@aeroware/aeroclient";
import { Command } from "@aeroware/aeroclient/dist/types";
import { MessageEmbed } from "discord.js";
import Fuse from "fuse.js";
import { decode } from "html-entities";
import fetch from "node-fetch";
import { lookup } from "../events/ready";

export default {
    name: "docs",
    aliases: ["d"],
    category: "information",
    description: "Fetches documentation from various sources.",
    details: "Supported platforms are 'djs', 'html', 'css', and 'mdn'.",
    usage: "<djs/html/css/mdn> <query>",
    minArgs: 2,
    async callback({ message, args }) {
        const [platform, ...search] = args.map((s) => s.toLowerCase());
        const query = search.join(" ");

        if (!["mdn", "html", "css", "djs"].includes(platform)) {
            return message.channel.send(
                "Invalid platform. Allowed platforms are 'djs', 'html', 'css', and 'mdn'."
            );
        }

        if (!query) {
            return message.channel.send("No query given.");
        }

        if (platform === "djs") {
            try {
                const res = await fetch(
                    `https://djsdocs.sorta.moe/v2/embed?src=stable&q=${encodeURIComponent(
                        query
                    )}`
                );
                const embed = await res.json();

                return message.channel.send(
                    embed ? { embed } : "Could find any results."
                );
            } catch {
                return message.channel.send(
                    "There was a network error in your request."
                );
            }
        } else if (platform === "html") {
            const fuse = new Fuse(
                lookup.html.map(({ tag }) => tag),
                {
                    isCaseSensitive: false,
                }
            );

            const results = fuse.search(args[1]);

            const tags = results
                .slice(0, 5)
                .map(
                    ({ item }) => lookup.html.find(({ tag }) => tag === item)!
                );

            return message.channel.send(
                new MessageEmbed()
                    .setTitle(`HTML [Full results]`)
                    .setColor("RANDOM")
                    .setDescription(
                        tags
                            .map(
                                ({ tag, href, text }) =>
                                    `**[${tag}](${href})**\n${text}`
                            )
                            .join("\n\n")
                    )
            );
        } else if (platform === "css") {
            const fuse = new Fuse(
                lookup.css.map(({ property }) => property),
                {
                    isCaseSensitive: false,
                }
            );

            const results = fuse.search(args[1]);

            const properties = results
                .slice(0, 5)
                .map(
                    ({ item }) =>
                        lookup.css.find(({ property }) => property === item)!
                );

            return message.channel.send(
                new MessageEmbed()
                    .setTitle(`CSS [Full results]`)
                    .setColor("RANDOM")
                    .setDescription(
                        properties
                            .map(
                                ({ property, href }) =>
                                    `**[${property}](${href})**`
                            )
                            .join("\n\n")
                    )
            );
        } else {
            const res = await fetch(
                `https://developer.mozilla.org/api/v1/search/en-US?q=${encodeURIComponent(
                    query
                )}`
            );
            const json = await res.json();

            console.log(json.documents[0].highlight);

            return message.channel.send(
                new MessageEmbed()
                    .setColor("RANDOM")
                    .setDescription(
                        decode(
                            utils.trim(
                                json.documents
                                    .slice(0, 5)
                                    .map(
                                        (doc: any) =>
                                            `**[${
                                                doc.title
                                            }](https://developer.mozilla.org/${
                                                doc.locale
                                            }/docs/${
                                                doc.slug
                                            })**\n${doc.summary.replace(
                                                /<\/?mark>/g,
                                                ""
                                            )}`
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
