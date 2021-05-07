import { utils } from "@aeroware/aeroclient";
import { Command } from "@aeroware/aeroclient/dist/types";
import { stripIndent } from "common-tags";
import { Message, MessageEmbed, Util } from "discord.js";
import { chunk } from "lodash";
import tags, { ITags } from "../../models/tags";

type TagAction =
    | "create"
    | "update"
    | "delete"
    | "make"
    | "edit"
    | "del"
    | "claim"
    | "info"
    | "raw";

const aliases = {
    make: "create",
    edit: "update",
    del: "delete",
    claim: "claime",
} as const;

export default {
    name: "tag",
    aliases: ["t"],
    category: "information",
    description: "Manage or retrieve tags to display tidbits of info quickly.",
    details: "Supports create, update, and delete operations on tags.",
    minArgs: 1,
    guildOnly: true,
    async callback({ message, args, text }) {
        const guildTags =
            (await tags.findById(message.guild!.id)) ??
            (await tags.create({ _id: message.guild!.id }));

        if (
            [
                "create",
                "update",
                "delete",
                "edit",
                "del",
                "make",
                "claim",
                "info",
                "raw",
            ].includes(args[0].toLowerCase())
        ) {
            return manageTag(
                message,
                guildTags,
                args[1],
                args[0] as TagAction,
                text.split(/\s+/).slice(3).join(" ")
            );
        } else if (["list", "all"].includes(args[0].toLowerCase())) {
            if (!guildTags.tags.length)
                return message.channel.send(
                    stripIndent`
                        There are no configured tags in this server.
                        Run \`tag create <name> <value>\` to create one.
                    `
                );

            const pages = chunk(guildTags.tags, 10).map((chunk, i, arr) =>
                new MessageEmbed()
                    .setDescription(
                        chunk
                            .map(
                                (tag, j) => `${i * 10 + j + 1}. \`${tag.name}\``
                            )
                            .join("\n")
                    )
                    .setFooter(`page ${i + 1} out of ${arr.length}`)
            );

            return utils.paginate(message, pages, {
                fastForwardAndRewind: {},
                goTo: {},
                time: 30000,
            });
        }

        const msg = guildTags.tags.find((t) => t.name === args[0]);

        if (!msg) {
            message.channel.send(`Tag \`${args[0]}\` not found.`);
            return "invalid";
        }

        msg.uses++;

        guildTags.markModified("tags");

        message.channel.send(msg.content);

        return guildTags.save();
    },
} as Command;

async function manageTag(
    message: Message,
    guildTags: ITags,
    tag: string,
    action: TagAction,
    payload?: string
) {
    if (
        !["delete", "claim", "del", "info", "raw"].includes(action) &&
        !payload
    ) {
        message.channel.send("A value is required for this action.");
        return "invalid";
    }

    if (
        [
            "create",
            "update",
            "delete",
            "edit",
            "del",
            "make",
            "claim",
            "info",
            "raw",
        ].includes(tag)
    ) {
        message.channel.send(
            `\`${tag}\` is a special keyword for this command. It cannot be used.`
        );
        return "invalid";
    }

    switch (action) {
        case "make":
        case "create": {
            const data = guildTags.tags.find((t) => t.name === tag);

            if (data) {
                message.channel.send(`That tag already exists.`);
                return "invalid";
            }

            if (!payload) {
                message.channel.send("A value is required to create a tag.");
                return "invalid";
            }

            guildTags.tags.push({
                owner: message.author.id,
                name: tag,
                content: payload,
                uses: 0,
                createdAt: Date.now(),
            });

            break;
        }

        case "edit":
        case "update": {
            if (!payload) {
                message.channel.send("A value is required to update a tag.");
                return "invalid";
            }

            const index = guildTags.tags.findIndex((t) => t.name === tag);

            if (guildTags.tags[index].owner !== message.author.id) {
                message.channel.send("You don't own this tag.");
                return "invalid";
            }

            guildTags.tags[index].content = payload;

            break;
        }

        case "del":
        case "delete": {
            const index = guildTags.tags.findIndex((t) => t.name === tag);

            if (
                guildTags.tags[index].owner !== message.author.id &&
                !message.member?.hasPermission("ADMINISTRATOR")
            ) {
                message.channel.send("You do not own this tag.");
                return "invalid";
            }

            guildTags.tags = guildTags.tags.filter((_, i) => i !== index);

            break;
        }

        case "info": {
            const data = guildTags.tags.find((t) => t.name === tag);

            if (!data) {
                message.channel.send(`Tag \`${tag}\` not found.`);
                return "invalid";
            }

            return message.channel.send(
                new MessageEmbed()
                    .setTitle(`Info for tag ${tag}`)
                    .setDescription(data.content)
                    .addField("Owner", `<@!${data.owner}> (${data.owner})`)
                    .addField(
                        "Uses",
                        `${data.uses} use${data.uses === 1 ? "" : "s"}`
                    )
                    .setFooter(
                        `Tag created at ${new Date(
                            data.createdAt
                        ).toLocaleDateString()}`
                    )
            );
        }

        case "raw": {
            const data = guildTags.tags.find((t) => t.name === tag);

            if (!data) {
                message.channel.send(`Tag \`${tag}\` not found.`);
                return "invalid";
            }

            return message.channel.send(Util.escapeMarkdown(data.content));
        }

        case "claim": {
            if (!message.member?.hasPermission("ADMINISTRATOR")) {
                message.channel.send(`You aren't a server administrator.`);
                return "invalid";
            }

            const index = guildTags.tags.findIndex((t) => t.name === tag);

            if (guildTags.tags[index].owner === message.author.id) {
                message.channel.send(`You already own this tag.`);
                return "invalid";
            }

            guildTags.tags[index].owner = message.author.id;

            break;
        }
    }

    await guildTags.save();

    return message.channel.send(
        `Tag \`${tag}\` ${aliases[action as keyof typeof aliases] ?? action}d.`
    );
}
