import { Command } from "@aeroware/aeroclient/dist/types";
import { Octokit } from "@octokit/core";
import { MessageEmbed } from "discord.js";

const octokit = new Octokit({
    auth: process.env.GITHUB_TOKEN,
});

export default {
    name: "gh",
    aliases: ["github"],
    category: "misc",
    description: "Fetches a GitHub user.",
    usage: "<username>",
    async callback({ message, args }) {
        const username = args[0];

        try {
            const data = await octokit.request("GET /users/{username}", {
                username,
            });

            return message.channel.send(
                new MessageEmbed()
                    .setTitle(data.data.login)
                    .setURL(data.data.html_url)
                    .setDescription(data.data.bio)
                    .addField("Repositories", data.data.public_repos)
                    .addField("Gists", data.data.public_gists)
                    .setThumbnail(data.data.avatar_url)
                    .setTimestamp(new Date(data.data.created_at))
            );
        } catch (e) {
            return message.channel.send(`Repo could not be found.`);
        }
    },
} as Command;
