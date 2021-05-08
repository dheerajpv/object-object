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
    async callback({ client, message, args }) {
        const target =
            client.users.cache.get(args[0]) ??
            message.mentions.users.first() ??
            message.author;

        const user = await users.findById(target.id).populate("snippets");

        if (!user) {
            message.channel.send(`They don't have a profile!`);
            return "invalid";
        }

        const likes = user.snippets.reduce(
            (total, snip) => total + snip.likes.length,
            0
        );

        return message.channel.send(
            new MessageEmbed()
                .setTitle(`${target.username}'s profile`)
                .setDescription(user.bio)
                .setColor(user.color)
                .addField(
                    "Snippets",
                    `${user.snippets.length} snippet${
                        user.snippets.length === 1 ? "" : "s"
                    } | ${likes} like${likes === 1 ? "" : "s"}`
                )
                .addField("Reputation", user.reputation)
                .setThumbnail(target.displayAvatarURL())
        );
    },
} as Command;
