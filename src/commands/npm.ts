import { Command } from "@aeroware/aeroclient/dist/types";
import { MessageEmbed } from "discord.js";
import fetch from "node-fetch";

export default {
    name: "npm",
    aliases: [],
    category: "information",
    description: "Searches npm for packages.",
    details: "Provide a query or name of a package.",
    usage: "<query>",
    minArgs: 1,
    async callback({ message, args }) {
        const query = args.join(" ");

        const json = await (await fetch(`https://api.npms.io/v2/search?q=${encodeURIComponent(query)}`)).json();

        const first = json.results[0];

        console.log(first);

        message.channel.send(
            json.total === 1
                ? new MessageEmbed().setTitle(first.package.name).setURL(first.package.links.npm).setDescription(first.package.description).setFooter(`version ${first.package.version}`)
                : new MessageEmbed()
        );
    },
} as Command;
