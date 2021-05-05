import { Command } from "@aeroware/aeroclient/dist/types";
import prettier from "prettier";
import { getCode } from "../utils/codeblock";

const parsers = [
    {
        langs: ["js", "javascript"],
        parser: "babel",
    },
    {
        langs: ["ts", "typescript"],
        parser: "typescript",
    },
    {
        langs: ["css"],
        parser: "css",
    },
    {
        langs: ["scss"],
        parser: "scss",
    },
    {
        langs: ["less"],
        parser: "less",
    },
    {
        langs: ["json"],
        parser: "json",
    },
    {
        langs: ["md", "markdown"],
        parser: "markdown",
    },
    {
        langs: ["html"],
        parser: "html",
    },
    {
        langs: ["yaml"],
        parser: "yaml",
    },
];

export default {
    name: "format",
    aliases: ["fmt"],
    category: "utility",
    cooldown: 5,
    description: "Formats your spaghetti code.",
    details: "Provide a language to format your code.",
    usage: "<language> <code>",
    async callback({ message, text, args }) {
        const lang = args[0];

        if (!lang) return message.channel.send(`Please provide the language.`);

        if (!parsers.find(({ langs }) => langs.includes(lang))) return message.channel.send(`Unsupported language.`);

        const { parser } = parsers.find(({ langs }) => langs.includes(lang))!;

        const code = getCode(text);

        if (!code) return message.channel.send(`Please provide the code to format.`);

        const formatted = prettier.format(code, { parser });

        return message.channel.send(formatted, {
            code: lang,
        });
    },
} as Command;
