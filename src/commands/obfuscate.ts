import { Command } from "@aeroware/aeroclient/dist/types";
import IWillScrambleYourCodeToShit from "javascript-obfuscator";
import SourceBin from "sourcebin-api";
import { getCode } from "../utils/codeblock";

export default {
    name: "obfuscate",
    category: "utility",
    description: "Obfuscates your code.",
    details: "Makes your code virtually unreadable.",
    usage: "<code>",
    minArgs: 1,
    async callback({ message, text }) {
        const code = getCode(text);

        if (!code) return message.channel.send(`Please provide the code.`);

        const obfuscated = IWillScrambleYourCodeToShit.obfuscate(
            code
        ).getObfuscatedCode();

        //@ts-ignore
        const res = await SourceBin.postBin({
            code: obfuscated,
            title: "Obfuscated code",
        });

        return message.channel.send(`Obfuscated code: ${res}`);
    },
} as Command;
