import { Command } from "@aeroware/aeroclient/dist/types";
import cheerio from "cheerio";
import { MessageEmbed } from "discord.js";
import puppeteer from "puppeteer";

const cache = new Map<
    string,
    {
        timestamp: number;
        embed: MessageEmbed;
    }
>();

export default {
    name: "google",
    aliases: [],
    category: "information",
    cooldown: 2,
    description: "Searches google.",
    usage: "<query>",
    async callback({ message, args }) {
        const query = args.join(" ").toLowerCase();

        if (!query) return message.channel.send(`Please provide a query.`);

        if (cache.get(query) && cache.get(query)!.timestamp + 1000 * 60 * 60 * 24 > Date.now()) return message.channel.send(cache.get(query)!.embed);

        const browser = await puppeteer.launch();

        const page = await browser.newPage();

        await page.goto(`https://www.google.com/search?q=${encodeURIComponent(query)}`);

        const html = await page.content();

        const $ = cheerio.load(html);

        const embed = new MessageEmbed()
            .setColor("RANDOM")
            .setTitle("Google [Full results]")
            .setDescription(
                $("#rso > div.g > div > div > div > a")
                    .toArray()
                    .slice(0, 5)
                    .map(
                        (a) =>
                            `[${
                                $(a.childNodes[1])
                                    .contents()
                                    .toArray()
                                    //@ts-ignore
                                    .find((el) => el.type === "text")?.data ?? "No title found."
                            }](${a.attribs.href})`
                    )
                    .join("\n\n")
            );

        cache.set(query, { timestamp: Date.now(), embed });

        return message.channel.send(embed);
    },
} as Command;
