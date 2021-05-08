import { Command } from "@aeroware/aeroclient/dist/types";
import { MessageAttachment } from "discord.js";
import fetch from "node-fetch";
import { get as getBin } from "sourcebin";
import { getCode } from "../../utils/codeblock";

const srcbinRegex = /https:\/\/(?:sourceb\.in)|(?:srcb\.in)\/(\w+)/;

export default {
    name: "carbon",
    description: "Makes your code look amazing using carbon",
    details: "send code in a codeblock or a sourcebin URL",
    category: "snippets",
    usage: "<code/sourcebin>",
    async callback({ message, text, args }) {
        let code: string;

        if (srcbinRegex.test(args[0])) {
            const link = args[0];
            const res = await getBin(link);
            code = res.files[0].content;
        } else code = getCode(text) ?? "";

        if (!code) {
            message.channel.send("There needs to be code to send to carbon.");
            return;
        }

        const res = await fetch("https://carbonnowsh.herokuapp.com/", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                code: encodeURIComponent(code),
                exportSize: "5x",
                fontSize: "16px",
            }),
        });

        const img = await res.buffer();

        message.channel.send(new MessageAttachment(img, "code.png"));
    },
} as Command;
