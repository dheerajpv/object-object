import { Command } from "@aeroware/aeroclient/dist/types";

export default {
    name: "info",
    category: "misc",
    async callback({ message, client }) {
        return message.channel.send(`i am a bot`);
    },
} as Command;
