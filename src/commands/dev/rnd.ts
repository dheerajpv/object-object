import { Command } from "@aeroware/aeroclient/dist/types";

export default {
    name: "rnd",
    aliases: ["rng"],
    category: "dev",
    usage: "[min] [max] [ints]",
    async callback({ message, args }) {
        const [min = 0, max = 255] = args.map(parseFloat);

        const rnd = Math.random() * (max - min) + min;

        return message.channel.send(
            ["true", "yes", "y", "ints"].includes(args[2])
                ? Math.floor(rnd)
                : rnd
        );
    },
} as Command;
