import { Command } from "@aeroware/aeroclient/dist/types";
import { MessageEmbed } from "discord.js";
import { stripIndent } from "common-tags";

export default {
    name: "languages",
    aliases: ["langs"],
    category: "learning",
    args: false,
    description: "Shows you information on many leading languages",
    cooldown: 5,
    async callback({ message }) {
        const mainEmbed = new MessageEmbed()
            .setTitle("Languages")
            .setDescription(
                "This embed will show you information on languages. Click its reaction to learn more."
            )
            .addFields(
                // TODO: add emojis and make them be real emojis.
                {
                    name: ":js: JavaScript",
                    value: stripIndent`JavaScript is a language ususally used in browsers and servers.
                        It has DOM manipulation tools in the browser for dynamic content and
                        can use \`npm\` packages in a server environment.`,
                },
                {
                    name: ":ts: TypeScript",
                    value: stripIndent`TypeScript is a superset of JavaScript, which means it has
                            more features than regular JS. Most importantly, it has a type system which
                            makes developers' lives easier by enforcing types in your code. This bot was
                            written in TypeScript, so we can vouch for its usefulness.
                    
                            **JOIN THE TYPESCRIPT CULT**`,
                },
                {
                    name: ":py: Python",
                    value: stripIndent`Python is a general-purpose scripting language capable of doing
                            lots of different things. It has seen recent surges in use related to data
                            science and machine learning. It has a really easy learning curve and easy
                            to use libraries.`,
                },
                {
                    name: ":java: Java",
                    value: stripIndent`Java is a statically-typed language that was founded on the
                            "write once, run anywhere" model. It uses a Java Virtual Machine (JVM) to
                            as an interpreter to facilitate that model. Java was created at a time
                            when code ran differently on different systems, as we will see below.
                            Java is still the most popular language in the world.`,
                },
                {
                    name: ":cpp: C++",
                    value: stripIndent`C++ is a more modern version of C, a really old language.
                    (even C++ is over 35 years old!) C++ is a language that compiles directly to
                    machine code, so it may not run the same on every computer. Its headline feature
                    is that it supports classes and OOP. Nowadays most languages do that. Usage for
                    C++ these days is mostly about performance. It is used extensively in game engines.`,
                }
            )
            .setColor("RANDOM")
            .setFooter("Want to add another language? Ask the devs!");

        message.channel.send(mainEmbed);
    },
} as Command;
