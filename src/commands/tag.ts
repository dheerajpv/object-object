import { Command } from "@aeroware/aeroclient/dist/types";
import { stripIndent } from "common-tags";
import { Message } from "discord.js";
import tags from "../models/Tags";

type TagAction = "create" | "update" | "delete";

export default {
    name: "tag",
    aliases: ["t"],
    category: "tag",
    description: "Sends information on a specific topic",
    details: "run tag list to see them all",
    minArgs: 1,
    guildOnly: true,
    async callback({ message, args, text }) {
        const guildTags =
            (await tags.findById(message.guild!.id)) ??
            (await tags.create({ _id: message.guild!.id }));

        if (["create", "update", "delete"].includes(args[0].toLowerCase())) {
            manageTag(
                message,
                args[1],
                args[0] as TagAction,
                text.split(" ").slice(3).join(" ")
            );
            return;
        } else if (args[0].toLowerCase() === "list") {
            if (guildTags.tags.length === 0) {
                message.channel.send(
                    stripIndent`
                        There are no configured tags in this server.
                        Run \`tag create <name> <value>\` to create one.
                    `
                );
                return;
            }

            message.channel.send(
                `My Configured tags are:\n${guildTags.tags
                    .map((t) => t.name)
                    .join("\n")}`
            );
            return;
        }

        const msg = guildTags?.tags.find((t) => t.name === args[0]);

        if (!msg) {
            message.channel.send(`Tag ${args[0]} not found.`);
            return;
        }

        message.channel.send(msg.content);
    },
} as Command;

async function manageTag(
    message: Message,
    tag: string,
    action: TagAction,
    payload?: string
) {
    if (action !== "delete" && !payload) {
        message.channel.send(
            "A value must be given when action is not 'delete'."
        );
        return;
    }

    if (["create", "update", "delete", "list"].includes(tag)) {
        message.channel.send(
            `\`${tag}\` is a special keyword for this command. It cannot be used.`
        );
        return;
    }

    const guildTags = (await tags.findById(message.guild!.id))!;

    switch (action) {
        case "create": {
            if (!payload) {
                message.channel.send("A value is required to create a tag.");
                return;
            }

            guildTags.tags.push({
                owner: message.author.id,
                name: tag,
                content: payload,
            });
            break;
        }

        case "update": {
            if (!payload) {
                message.channel.send("A value is required to update a tag.");
                return;
            }

            const index = guildTags.tags.findIndex((t) => t.name === tag);
            if (guildTags.tags[index].owner !== message.author.id) {
                message.channel.send("You do not control this tag.");
                return;
            }

            guildTags.tags[index].content = payload;
            break;
        }

        case "delete": {
            const index = guildTags.tags.findIndex((t) => t.name === tag);
            if (guildTags.tags[index].owner !== message.author.id) {
                message.channel.send("You do not control this tag.");
                return;
            }

            guildTags.tags = guildTags.tags.filter((_, i) => i !== index);
            break;
        }
    }

    await guildTags.save();
    message.channel.send(`Tag ${tag} ${action}d`);
}
