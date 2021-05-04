import { Command } from "@aeroware/aeroclient/dist/types";
import { URL } from "url";

export default {
    name: "ghraw",
    aliases: [],
    category: "utility",
    cooldown: 2,
    description: "Generates the raw github user content link for a file on github.",
    usage: "<url>",
    async callback({ message, args, client }) {
        if (!args[0]) return message.channel.send(`Please provide the file URL.`);

        const url = new URL(args[0]);

        if (url.hostname !== "github.com") return message.channel.send(`Please provide a GitHub URL.`);

        const [, username, repo, , branch, ...path] = url.pathname.split("/");

        if (!username || !repo || !branch || !path.length) return message.channel.send(`Invalid GitHub file URL.`);

        return message.channel.send(`https://raw.githubusercontent.com/${username}/${repo}/${branch}/${path.join("/")}`);
    },
} as Command;
