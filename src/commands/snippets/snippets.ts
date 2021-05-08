import { utils } from "@aeroware/aeroclient";
import { Command } from "@aeroware/aeroclient/dist/types";
import { MessageEmbed } from "discord.js";
import { ObjectId } from "mongodb";
import snippets from "../../models/snippet";
import users from "../../models/user";
import { getCode, getLang } from "../../utils/codeblock";

export default {
    name: "snippets",
    aliases: ["snips"],
    category: "snippets",
    description: "",
    details: "",
    cooldown: 2,
    async callback({ client, message, args, text }) {
        const user = (await users
            .findById(message.author.id)
            .populate("snippets"))!;

        if (!args[0]) {
            if (!user.snippets.length)
                return message.channel.send(`You don't have any snippets!`);

            return utils.paginate(
                message,
                user.snippets.map(
                    ({ title, language, content, likes, _id }, i) =>
                        new MessageEmbed()
                            .setTitle(title)
                            .setDescription(
                                `\`\`\`${language}\n${content}\n\`\`\``
                            )
                            .addField("Likes", likes)
                            .addField("Snippet ID", _id)
                            .setFooter(
                                `Snippet ${i + 1} out of ${
                                    user.snippets.length
                                }`
                            )
                ),
                {
                    fastForwardAndRewind: {},
                    goTo: {},
                    time: 30000,
                }
            );
        }

        switch (args[0]) {
            case "del":
            case "delete": {
                if (!ObjectId.isValid(args[1])) {
                    message.channel.send(`That's not a valid ID!`);
                    return "invalid";
                }

                const snippet = await snippets.findById(args[1]);

                if (!snippet) {
                    message.channel.send(`That snippet doesn't exist!`);
                    return "invalid";
                }

                if (
                    snippet.author !== message.author.id &&
                    !client.clientOptions.staff!.includes(message.author.id)
                ) {
                    message.channel.send(`You don't own that snippet!`);
                    return "invalid";
                }

                await snippet.delete();

                return message.channel.send(`Snippet was deleted!`);
            }

            case "edit":
            case "update": {
                if (!ObjectId.isValid(args[1])) {
                    message.channel.send(`That's not a valid id!`);
                    return "invalid";
                }

                const snippet = await snippets.findById(args[1]);

                if (!snippet) {
                    message.channel.send(`That snippet doesn't exist!`);
                    return "invalid";
                }

                if (snippet.author !== message.author.id) {
                    message.channel.send(`You don't own that snippet!`);
                    return "invalid";
                }

                const language = getLang(text);
                const content = getCode(text);

                if (!language || !content)
                    return message.channel.send(
                        `Please provide the language and code.`
                    );

                snippet.language = language;
                snippet.content = content;

                await snippet.save();

                return message.channel.send(`Snippet was updated!`);
            }

            case "make":
            case "create": {
                const language = getLang(text);
                const content = getCode(text);

                if (!language || !content)
                    return message.channel.send(
                        `Please provide the language and code.`
                    );

                await message.channel.send(`What's the title of this snippet?`);

                const title = (
                    await utils.getReply(message, {
                        time: 15000,
                    })
                )?.content.trim();

                if (!title) return;

                await message.channel.send(
                    `Add any tags to this snippet if you want. Separate the tags with commas.`
                );

                const tags =
                    (
                        await utils.getReply(message, {
                            time: 15000,
                        })
                    )?.content
                        .trim()
                        .split(",") ?? [];

                const snippet = await snippets.create({
                    author: message.author.id,
                    title,
                    tags,
                    language,
                    content,
                });

                user.snippets.push(snippet);

                await user.save();

                return message.channel.send(`Snippet created!`);
            }

            case "view": {
                if (!ObjectId.isValid(args[1])) {
                    message.channel.send(`That's not a valid id!`);
                    return "invalid";
                }

                const snippet = await snippets.findById(args[1]);

                if (!snippet) {
                    message.channel.send(`That snippet doesn't exist!`);
                    return "invalid";
                }

                const author = await client.users.fetch(snippet.author);

                return message.channel.send(
                    new MessageEmbed()
                        .setAuthor(author.username, author.displayAvatarURL())
                        .setTitle(snippet.title)
                        .setDescription(
                            `\`\`\`${snippet.language}\n${snippet.content}\n\`\`\``
                        )
                        .setFooter(`${snippet.likes} likes`)
                );
            }

            default: {
                message.channel.send(`Unrecognized action.`);
                return "invalid";
            }
        }
    },
} as Command;
