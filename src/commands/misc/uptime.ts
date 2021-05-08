import { Command } from "@aeroware/aeroclient/dist/types";
import ms from "ms";

export default {
    name: "uptime",
    category: "misc",
    async callback({ message, client }) {
        return message.channel.send(
            ms(process.uptime() * 1000, { long: true })
        );
    },
} as Command;
