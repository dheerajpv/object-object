import { Command } from "@aeroware/aeroclient/dist/types";
import * as jq from "node-jq";
import { getCode } from "../utils/codeblock";

export default {
    name: "jq",
    category: "utility",
    cooldown: 2,
    description: "Manipulates JSON data with `node-jq`.",
    details: "Outputs filtered JSON data.",
    usage: "<filter> <json>",
    async callback({ message, args, text }) {
        const filter = args
            .slice(
                0,
                args.findIndex((a) => a.startsWith(`\`\`\``))
            )
            .join(" ");

        if (!filter) return message.channel.send(`Please provide a filter.`);

        const raw = getCode(text);

        if (!raw) return message.channel.send(`Please provide the JSON.`);

        try {
            const json = JSON.parse(raw);

            try {
                const out = await jq.run(filter, json, {
                    input: "json",
                });

                return message.channel.send(out, {
                    code: "json",
                });
            } catch (e) {
                console.log(e);

                return message.channel.send(`Error in parsing filter.`);
            }
        } catch {
            return message.channel.send(`Malformed JSON.`);
        }
    },
} as Command;
