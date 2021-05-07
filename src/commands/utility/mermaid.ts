import { Command } from "@aeroware/aeroclient/dist/types";
import { MessageAttachment } from "discord.js";
import fs from "fs/promises";
import cp from "child_process";
import { getCode } from "../../utils/codeblock";

export default {
    name: "mermaid",
    description: "Makes cool flowcharts from mermaid syntax",
    details: "write mermaid code in a plain text code block",
    category: "utility",
    usage: "<code>",
    async callback({ message, text }) {
        const code = getCode(text);

        if (!code) {
            message.channel.send("There has to be code to generate a diagram.");
            return;
        }

        await fs.writeFile(`./tmp/temp-${message.author.id}.mmd`, code);

        cp.execSync(
            `mmdc -i ./tmp/temp-${message.author.id}.mmd -o ./tmp/out-${message.author.id}.png`
        );

        const buf = await fs.readFile(`./tmp/out-${message.author.id}.png`);

        await message.channel.send(new MessageAttachment(buf, "diagram.png"));

        await fs.unlink(`./tmp/temp-${message.author.id}.mmd`);
        await fs.unlink(`./tmp/out-${message.author.id}.png`);
    },
} as Command;
