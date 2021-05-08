import { Command } from "@aeroware/aeroclient/dist/types";
import { MessageEmbed } from "discord.js";
import wiki from "wikipedia";

export default {
    name: "wiki",
    category: "information",
    cooldown: 2,
    description: "Searches Wikipedia.",
    usage: "<query>",
    async callback({ message, args }) {
        const query = args.join(" ").toLowerCase();

        const { results } = await wiki.search(query);

        if (!results.length) return message.channel.send(`No results found.`);

        const page = await wiki.page(results[0].title);

        const summary = await page.summary();

        const images = await page.images();

        return message.channel.send(
            new MessageEmbed()
                .setTitle(summary.title)
                .setURL(summary.content_urls.desktop.page)
                .setDescription(summary.extract)
                .setImage(images[0].url)
                .setTimestamp(new Date(page.touched))
        );
    },
} as Command;
