import { Command } from "@aeroware/aeroclient/dist/types";

export default {
    name: "ping",
    args: false,
    category: "dev",
    async callback({ message, client }) {
        const msg = await message.channel.send("Calculating ping");
        await msg.edit(
            `** Bot Ping:** ${
                msg.createdTimestamp - message.createdTimestamp
            }ms, **Discord API Ping:** ${client.ws.ping}ms`
        );
    },
} as Command;
