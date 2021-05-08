import { utils } from "@aeroware/aeroclient";
import { Command } from "@aeroware/aeroclient/dist/types";
import { MessageEmbed } from "discord.js";
import fetch from "node-fetch";

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

        const exact = json.package
            ? json
            : json.results.find(
                  ({ package: { name } }: { package: { name: string } }) =>
                      name === query
              );

        if (exact) {
            return message.channel.send(
                new MessageEmbed()
                    .setTitle(exact.package.name)
                    .setURL(exact.package.links.npm)
                    .setDescription(exact.package.description)
                    .addField(
                        "Keywords",
                        exact.package.keywords
                            ? exact.package.keywords
                                  .map((k: string) => `\`${k}\``)
                                  .join(", ")
                            : "*No keywords.*"
                    )
                    .addField(
                        "Links",
                        `[Homepage](${exact.package.links.homepage})\n[Repository](${exact.package.links.repository})`
                    )
                    .setTimestamp(exact.package.date)
                    .setFooter(`v${exact.package.version}`)
            );
        } else {
            return utils.paginate(
                message,
                json.results
                    .reverse()
                    .slice(0, 10)
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
