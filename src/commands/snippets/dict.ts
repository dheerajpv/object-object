import { utils } from "@aeroware/aeroclient";
import { Command } from "@aeroware/aeroclient/dist/types";
import { MessageEmbed } from "discord.js";
import fetch from "node-fetch";

export default {
    name: "dict",
    aliases: ["d"],
    category: "snippets",
    description: "",
    details: "",
    usage: "<query>",
    minArgs: 1,
    cooldown: 2,
    async callback({ message, args }) {
        const query = args.join(" ").toLowerCase();

        const json = await (
            await fetch(
                `http://api.urbandictionary.com/v0/define?term=${encodeURIComponent(
                    query
                )}`
            )
        ).json();

        const entry = json.list[0];

        if (!entry) return message.channel.send(`No result found.`);

        return message.channel.send(
            new MessageEmbed()
                .setTitle(entry.word)
                .setDescription(utils.trim(entry.definition, 2048))
                .setFooter(
                    `${entry.thumbs_up} ups | ${entry.thumbs_down} downs`
                )
                .setURL(entry.permalink)
                .addField("Example", utils.trim(entry.example, 1024))
                .setAuthor(entry.author)
                .setTimestamp(new Date(entry.written_on))
        );
    },
} as Command;
