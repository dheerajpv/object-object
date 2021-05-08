import { Command } from "@aeroware/aeroclient/dist/types";
import users from "../../models/user";

export default {
    name: "bio",
    aliases: ["b"],
    category: "snippets",
    description: "",
    details: "",
    usage: "<bio>",
    minArgs: 1,
    cooldown: 2,
    async callback({ message, args }) {
        const user = (await users
            .findById(message.author.id)
            .populate("snippets"))!;

        const bio = args.join(" ");

        user.bio = bio;

        await user.save();

        return message.channel.send(`Bio updated successfully!`);
    },
} as Command;
