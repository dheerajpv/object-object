import { Command } from "@aeroware/aeroclient/dist/types";
import { MessageEmbed } from "discord.js";
import users from "../../models/user";

export default {
    name: "profile",
    aliases: ["p"],
    category: "snippets",
    description: "",
    details: "",
    cooldown: 2,
    async callback({ message, args }) {
        const target = message.mentions.users.first() ?? message.author;

        const user = await users.findById(target.id).populate("snippets");

        if (!user) {
            message.channel.send(`They don't have a profile!`);
            return "invalid";
        }

        return message.channel.send(
            new MessageEmbed()
                .setTitle(`${target.username}'s profile`)
                .setDescription(user.bio)
                .setColor(user.color)
                .setThumbnail(target.displayAvatarURL())
        );
    },
} as Command;
