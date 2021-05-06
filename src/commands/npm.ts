import { Command } from "@aeroware/aeroclient/dist/types";
import { MessageEmbed } from "discord.js";
import fetch from "node-fetch";
import { utils } from "@aeroware/aeroclient";
import { oneLine } from "common-tags";

export default {
    name: "npm",
    category: "information",
    description: "Searches npm for packages.",
    details:
        "Provide a query or name of a package. Wrap package name in `backticks` to search a package under a user (like `@aeroware/aeroclient`).",
    usage: "<query>",
    minArgs: 1,
    async callback({ message, args }) {
        let query = args.join(" ");

        if (query.startsWith("`") && query.endsWith("`"))
            query = query.slice(1, query.length - 2);

        const json = await (
            await fetch(
                `https://api.npms.io/v2/search?q=${encodeURIComponent(query)}`
            )
        ).json();

        const first = json.results[0];

        if (json.results.length === 1) {
            const sent = await message.channel.send(
                new MessageEmbed()
                    .setTitle(first.package.name)
                    .setURL(first.package.links.npm)
                    .setDescription(first.package.description)
                    .setFooter(`v${first.package.version}`)
            );

            sent.delete({ timeout: 60000 });
            return;
        } else {
            utils.paginate(
                message,
                json.results
                    .reverse()
                    .slice(-10)
                    .reverse()
                    .map((r: any) =>
                        new MessageEmbed()
                            .setTitle(r.package.name)
                            .setURL(r.package.links.npm)
                            .setDescription(r.package.description)
                            .setFooter(`v${r.package.version}`)
                    ),
                {
                    time: 60000,
                    fastForwardAndRewind: {
                        time: 5000,
                    },
                    goTo: {
                        time: 5000,
                    },
                }
            );
        }
    },
} as Command;
