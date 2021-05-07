import AeroClient from "@aeroware/aeroclient";
import { EventHandler } from "@aeroware/aeroclient/dist/types";
import cheerio from "cheerio";
import { decode } from "html-entities";
import mongoose from "mongoose";
import fetch from "node-fetch";

export const lookup = {
    html: [] as { tag: string; href: string; text: string }[],
    css: [] as { property: string; href: string }[],
};

export default {
    name: "ready",
    once: true,
    async callback(this: AeroClient) {
        try {
            await mongoose.connect(
                process.env.MONGO_URI!,
                {
                    useNewUrlParser: true,
                    useUnifiedTopology: true,
                    useFindAndModify: false,
                    keepAlive: true,
                },
                (err) => {
                    if (err) return this.logger.error(err.stack || err.message);
                    this.logger.success("Connected to mongo.");
                }
            );

            mongoose.connection.on("connect", () => {
                this.logger.success("Mongoose is connected.");
            });

            mongoose.connection.on("error", (err) => {
                if (err) this.logger.error(err.stack || err.message);
            });

            mongoose.connection.on("disconnect", () => {
                this.logger.warn("Mongoose was disconnected.");
            });

            mongoose.connection.on("reconnect", () => {
                this.logger.info("Mongoose has reconnected.");
            });

            {
                const html = await (
                    await fetch(
                        "https://developer.mozilla.org/en-US/docs/Web/HTML/Element"
                    )
                ).text();

                const $ = cheerio.load(html);

                lookup.html = $(
                    ".main-page-content > div > .standard-table > tbody > tr > td"
                )
                    .toArray()
                    .map((td) => ({
                        tag: $(td.children[0]).contents().text(),
                        href: `https://developer.mozilla.org${
                            //@ts-ignore
                            td.children[0].attribs?.href ??
                            "/en-US/docs/Web/HTML/Element"
                        }`,
                        text: decode($(td.next!.next!).contents().toString())
                            .replace(/\<strong\>(.+?)\<\/strong\>/gis, "**$1**")
                            .replace(/\<em\>(.+?)\<\/em\>/gis, "*$1*")
                            .replace(/\<code\>(.+?)\<\/code\>/gis, "`$1`")
                            .replace(
                                /\<a\s+href="(.+?)"\>(.+?)\<\/a\>/gis,
                                "[$2]($1)"
                            ),
                    }))
                    .filter(({ tag }) => /^\<\w+\>$/.test(tag));

                this.logger.success(`Loaded HTML lookup!`);
            }

            {
                const html = await (
                    await fetch(
                        "https://developer.mozilla.org/en-US/docs/Web/CSS/Reference"
                    )
                ).text();

                const $ = cheerio.load(html);

                lookup.css = $(
                    ".main-page-content > #index + div .index > ul > li > a"
                )
                    .toArray()
                    .map((a) => ({
                        property: $(a).contents().text(),
                        href: `https://developer.mozilla.org${
                            //@ts-ignore
                            a.attribs.href ?? "/en-US/docs/Web/CSS/Reference"
                        }`,
                    }));

                this.logger.success(`Loaded CSS lookup!`);
            }
        } catch (e) {
            console.error(e);
            process.exit(1);
        }
    },
} as EventHandler;
