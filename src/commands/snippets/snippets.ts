import { utils } from "@aeroware/aeroclient";
import { Command } from "@aeroware/aeroclient/dist/types";
import { MessageEmbed } from "discord.js";
import users from "../../models/user";
import { getCode, getLang } from "../../utils/codeblock";

export default {
    name: "snippets",
    aliases: ["snips"],
    category: "snippets",
    description: "",
    details: "",
    cooldown: 2,
    async callback({ message, args, text }) {
        const user = (await users
            .findById(message.author.id)
            .populate("snippets"))!;

        if (!args[0]) {
            if (!user.snippets.length)
                return message.channel.send(`You don't have any snippets!`);

            return utils.paginate(
                message,
                user.snippets.map(({ language, content, likes }, i) =>
                    new MessageEmbed()
                        .setDescription(`\`\`\`${language}\n${content}\n\`\`\``)
                        .addField("Likes", likes)
                        .setFooter(
                            `Snippet ${i + 1} out of ${user.snippets.length}`
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
            case "create": {
                const language = getLang(text);
                const content = getCode(text);

                if (!language || !content)
                    return message.channel.send(
                        `Please provide the language and code.`
                    );

                //! NEEDS WORK
                // const snippet = await snippets.create({
                //     author: message.author.id,
                //     language,
                //     content,
                // });

                // //@ts-ignore
                // user.snippets.push(snippet._id);

                await user.save();

                return message.channel.send(`Snippet created!`);
            }

            default: {
                message.channel.send(`Unrecognized action.`);
                return "invalid";
            }
        }
    },
} as Command;
