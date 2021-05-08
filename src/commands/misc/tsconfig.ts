import { utils } from "@aeroware/aeroclient";
import { Command } from "@aeroware/aeroclient/dist/types";
import { lookup } from "../../events/ready";

export default {
    name: "tsconfig",
    aliases: ["tsconf"],
    category: "misc",
    usage: "<preset>",
    description: "Sends a tsconfig.json preset.",
    details: "Supports many many presets for everyone.",
    cooldown: 2,
    async callback({ message, args }) {
        const preset = args[0];

        if (!preset) {
            message.channel.send(
                `Supported presets are ${utils.formatList(
                    lookup.configs.map(({ name }) => `\`${name}\``)
                )}.`
            );
            return "invalid";
        }

        if (!lookup.configs.find(({ name }) => name === preset)) {
            message.channel.send(`That's not a preset.`);
            return "invalid";
        }

        return message.channel.send(
            lookup.configs.find(({ name }) => name === preset)!.config,
            {
                code: "json",
            }
        );
    },
} as Command;
