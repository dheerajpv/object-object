import { Command } from "@aeroware/aeroclient/dist/types";
import { Octokit } from "@octokit/core";
import { MessageEmbed } from "discord.js";

const octokit = new Octokit({
    auth: process.env.GITHUB_TOKEN,
});

export default {
    name: "repo",
    category: "information",
    description: "Fetches a GitHub repository.",
    details: "Uses a repo name and repo owner to find a repository.",
    usage: "<owner> [repo]",
    async callback({ message, args }) {
        let [owner, repo] = args;

        if (!owner)
            return message.channel.send(`Please provide the repo owner.`);

        if (!repo) {
            [owner, repo] = owner.split("/");

            if (!repo)
                return message.channel.send(`Please provide the repo name.`);
        }

        try {
            const data = await octokit.request("GET /repos/{owner}/{repo}", {
                owner,
                repo,
            });

            const embed = new MessageEmbed()
                .setTitle(`${owner}/${repo}`)
                .setURL(data.data.html_url)
                .setDescription(data.data.description)
                .setFooter(
                    `${data.data.watchers_count} watcher${
                        data.data.watchers_count === 1 ? "" : "s"
                    } | ${data.data.stargazers_count} star${
                        data.data.stargazers_count === 1 ? "" : "s"
                    } | ${data.data.forks_count} fork${
                        data.data.forks_count === 1 ? "" : "s"
                    }`
                )
                .setImage(
                    `https://opengraph.githubassets.com/eedfd46b5076b8b37f1e230f05dcdc39b89b2f256d4d8c6df5bc2f4afe251ead/${owner}/${repo}`
                );

            if (data.data.owner)
                embed.setAuthor(
                    data.data.owner.login,
                    data.data.owner.avatar_url,
                    data.data.html_url
                );

            return message.channel.send(embed);
        } catch (e) {
            return message.channel.send(`Repo could not be found.`);
        }
    },
} as Command;
