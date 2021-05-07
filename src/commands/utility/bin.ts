import { Command } from "@aeroware/aeroclient/dist/types";
import { create as postBin } from "sourcebin";
import linguist from "@sourcebin/linguist/dist/linguist.json";
import { getCode, getLang } from "../../utils/codeblock";

export default {
    name: "bin",
    category: "utility",
    description: "Upload code to SourceBin.",
    details: "",
    usage: "<code/id>",
    minArgs: 2,
    async callback({ message, args, text }) {
        const lang = getLang(text) || "plain";
        const code = getCode(text);

        if (!code) {
            message.channel.send(`Please provide the code.`);
            return "invalid";
        }

        const langId =
            lang === "plain"
                ? undefined
                : parseInt(
                      Object.keys(linguist).find(
                          (k) =>
                              // @ts-ignore
                              linguist[k as keyof typeof linguist].extension ===
                                  lang ||
                              linguist[
                                  k as keyof typeof linguist
                                  // @ts-ignore
                              ].aliases?.includes(lang)
                      )!
                  ) || undefined;

        //@ts-ignore
        const { short: url } = await postBin([
            {
                name: `Uploaded by ${message.author.tag}`,
                content: code,
                language: langId,
            },
        ]);

        return message.channel.send(`Uploaded to ${url}`);
    },
} as Command;
