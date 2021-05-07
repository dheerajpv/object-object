import { Command } from "@aeroware/aeroclient/dist/types";
import SourceBin from "sourcebin-api";
import { getCode } from "../utils/codeblock";

export default {
    name: "bin",
    category: "utility",
    description: "Upload code to SourceBin.",
    details: "",
    usage: "<code/id>",
    minArgs: 2,
    async callback({ message, args, text }) {
        const code = getCode(text);

        if (!code) {
            message.channel.send(`Please provide the code.`);
            return "invalid";
        }

        //@ts-ignore
        const res = await SourceBin.postBin({
            code,
            title: `Uploaded by ${message.author.tag}`,
        });

        return message.channel.send(`Uploaded to ${res}`);
    },
} as Command;
