import { Command } from "@aeroware/aeroclient/dist/types";
import fetch from "node-fetch";

export default {
    name: "vote",
    category: "misc",
    async callback({ message }) {
        const teamId = "[object Object]";

        const url = `https://wornoffkeys.com/api/competition/voting?userId=${message.author.id}&teamId=${teamId}`;

        const toEdit = await message.channel.send("Voting. Please wait...");

        try {
            const res = await fetch(url, { method: "POST" });
            const json = await res.json();

            if (json.success) {
                await toEdit.edit(json.message);
            }
        } catch (err) {
            if (err.response.data) {
                const { message: text } = err.response.data;
                console.error(text);
                await toEdit.edit(text);
                return;
            }

            console.error(err);
        }
    },
} as Command;
