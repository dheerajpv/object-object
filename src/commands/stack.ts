import { Command } from "@aeroware/aeroclient/dist/types";
import { MessageEmbed } from "discord.js";
import { decode } from "html-entities";
import fetch from "node-fetch";

const cache = new Map<
    string,
    {
        timestamp: number;
        embed: MessageEmbed;
    }
>();

export default {
    name: "stack",
    aliases: ["so"],
    category: "information",
    description: "Fetches Stack Overflow questions.",
    details: "Provide a query to search for.",
    cooldown: 5,
    usage: "<query>",
    async callback({ message, args }) {
        const query = args.join(" ").toLowerCase();

        if (!query) return message.channel.send(`Please provide a query.`);

        if (cache.get(query) && cache.get(query)!.timestamp + 1000 * 60 * 60 * 24 > Date.now()) return message.channel.send(cache.get(query)!.embed);

        const json = await (await fetch(`https://api.stackexchange.com/2.2/search?order=desc&sort=activity&site=stackoverflow&intitle=${encodeURIComponent(query)}`)).json();

        const embed = new MessageEmbed()
            .setColor("#f48023")
            .setTitle("Stack Overflow [Full results]")
            .setDescription(
                json.items
                    .slice(0, 5)
                    .map((q: { link: string; title: string }) => `[${decode(q.title)}](${q.link})`)
                    .join("\n\n")
            );

        cache.set(query, { timestamp: Date.now(), embed });

        return message.channel.send(embed);
    },
} as Command;
