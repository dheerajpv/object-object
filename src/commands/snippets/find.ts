import { Command } from "@aeroware/aeroclient/dist/types";
import { Message, MessageEmbed, MessageReaction, User } from "discord.js";
import leven from "leven";
import snippets from "../../models/snippet";

export default {
    name: "find",
    aliases: ["query", "q"],
    category: "snippets",
    description: "",
    details: "",
    cooldown: 2,
    async callback({ message, args }) {
        const query = args.join(" ").toLowerCase();

        const all = await snippets.find();

        const filtered = all
            .filter((snippet) => {
                if (snippet.title.toLowerCase().includes(query)) return true;

                if (
                    snippet.tags.some((tag) => {
                        if (tag.toLowerCase().includes(query)) return true;

                        const dist = leven(tag, query);

                        if (dist < Math.ceil(tag.length / 2)) return true;

                        return false;
                    })
                )
                    return true;

                const dist = leven(snippet.title, query);

                if (dist < Math.ceil(snippet.title.length / 2)) return true;

                return false;
            })
            .sort((a, b) => b.likes.length - a.likes.length);

        const pages = filtered.map(
            ({ title, language, content, likes, _id }, i) =>
                new MessageEmbed()
                    .setTitle(title)
                    .setDescription(`\`\`\`${language}\n${content}\n\`\`\``)
                    .addField("Likes", likes.length)
                    .addField("Snippet ID", _id)
                    .setFooter(`Snippet ${i + 1} out of ${filtered.length}`)
        );

        let pageNumber = 0;

        let page = pages[pageNumber];

        const pagination = await message.channel.send(page);

        const emojis = ["⭐️", "⏪", "◀️", "⏹", "▶️", "⏩", "🔢"];

        if (pagination.deleted) return;

        if (pages.length > 1)
            Promise.all(emojis.map((e) => pagination.react(e)));

        pagination.react(emojis[2]);

        const collector = pagination.createReactionCollector(
            (reaction: MessageReaction, user: User) =>
                emojis.includes(reaction.emoji.name) &&
                user.id === message.author.id,
            {
                dispose: true,
                time: 30000,
            }
        );

        const handleReaction = async (reaction: MessageReaction) => {
            if (pagination.deleted) return;

            switch (reaction.emoji.name) {
                case "⭐️": {
                    const snippet = await snippets.findById(
                        filtered[pageNumber]
                    );

                    if (!snippet)
                        return message.channel.send(
                            `Snippet doesn't exist anymore!`
                        );

                    if (snippet.likes.includes(message.author.id))
                        snippet.likes = snippet.likes.filter(
                            (l) => l !== message.author.id
                        );
                    else snippet.likes.push(message.author.id);

                    snippet.markModified("likes");

                    await snippet.save();

                    pages[pageNumber] = new MessageEmbed()
                        .setTitle(snippet.title)
                        .setDescription(
                            `\`\`\`${snippet.language}\n${snippet.content}\n\`\`\``
                        )
                        .addField("Likes", snippet.likes.length)
                        .addField("Snippet ID", snippet._id)
                        .setFooter(
                            `Snippet ${pageNumber + 1} out of ${
                                filtered.length
                            }`
                        );

                    return await pagination.edit(pages[pageNumber]);
                }

                case "⏪":
                    const rwp = await message.channel.send(
                        "How many pages would you like to go back?"
                    );
                    const rw = parseInt(
                        (
                            await message.channel.awaitMessages(
                                (msg: Message) => {
                                    if (msg.author.id === message.author.id)
                                        msg.delete();
                                    return msg.author.id === message.author.id;
                                },
                                {
                                    max: 1,
                                    time: 10000,
                                }
                            )
                        ).first()?.content || ""
                    );

                    if (rw) {
                        pageNumber -= rw;
                        if (pageNumber < 0) pageNumber = 0;
                    }

                    rwp.delete();

                    return await pagination.edit(pages[pageNumber]);
                case "◀️":
                    pageNumber--;

                    if (pageNumber < 0) {
                        pageNumber = 0;
                        return;
                    }

                    return await pagination.edit(pages[pageNumber]);
                case "⏹":
                    return collector.stop();
                case "▶️":
                    pageNumber++;

                    if (pageNumber > pages.length - 1) {
                        pageNumber = pages.length - 1;
                        return;
                    }

                    return await pagination.edit(pages[pageNumber]);
                case "⏩":
                    const ffp = await message.channel.send(
                        "How many pages would you like to go forward?"
                    );

                    const ff = parseInt(
                        (
                            await message.channel.awaitMessages(
                                (msg: Message) => {
                                    if (msg.author.id === message.author.id)
                                        msg.delete();
                                    return msg.author.id === message.author.id;
                                },
                                {
                                    max: 1,
                                    time: 10000,
                                }
                            )
                        ).first()?.content || ""
                    );

                    if (ff) {
                        pageNumber += ff;
                        if (pageNumber > pages.length - 1)
                            pageNumber = pages.length - 1;
                    }

                    ffp.delete();

                    return await pagination.edit(pages[pageNumber]);
                case "🔢":
                    const gtp = await message.channel.send(
                        "Which page would you like to go to?"
                    );

                    const gt = parseInt(
                        (
                            await message.channel.awaitMessages(
                                (msg: Message) => {
                                    if (msg.author.id === message.author.id)
                                        msg.delete();
                                    return msg.author.id === message.author.id;
                                },
                                {
                                    max: 1,
                                    time: 10000,
                                }
                            )
                        ).first()?.content || ""
                    );

                    if (gt) {
                        pageNumber = gt - 1;
                        if (pageNumber > pages.length - 1)
                            pageNumber = pages.length - 1;
                        if (pageNumber < 0) pageNumber = 0;
                    }

                    gtp.delete();

                    return await pagination.edit(pages[pageNumber]);
            }
        };

        collector.on("collect", handleReaction);
        collector.on("remove", handleReaction);

        collector.on("end", () => pagination.delete());
    },
} as Command;
