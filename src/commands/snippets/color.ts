import { Command } from "@aeroware/aeroclient/dist/types";
import users from "../../models/user";

export default {
    name: "color",
    aliases: ["c"],
    category: "snippets",
    description: "",
    details: "",
    usage: "<color>",
    minArgs: 1,
    cooldown: 2,
    async callback({ message, args }) {
        const user = (await users
            .findById(message.author.id)
            .populate("snippets"))!;

        const color = args[0];

        user.color = color;

        await user.save();

        return message.channel.send(`Color updated successfully!`);
    },
} as Command;
