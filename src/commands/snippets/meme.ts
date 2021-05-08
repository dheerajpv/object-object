import { Command } from "@aeroware/aeroclient/dist/types";
import { MessageEmbed } from "discord.js";
import fetch from "node-fetch";

export default {
    name: "meme",
    aliases: ["m"],
    category: "snippets",
    description: "",
    details: "",
    cooldown: 2,
    async callback({ message, args }) {
        const json = await (
            await fetch(`https://meme-api.herokuapp.com/gimme/programmerhumor`)
        ).json();

        return message.channel.send(
            new MessageEmbed().setImage(json.url).setTitle(json.title)
        );
    },
} as Command;
