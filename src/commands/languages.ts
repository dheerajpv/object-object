import { Command } from "@aeroware/aeroclient/dist/types";
import { stripIndent } from "common-tags";
import { MessageEmbed, MessageReaction, User } from "discord.js";

const langs = {
    js: {
        name: "JavaScript",
        main: stripIndent`
            JavaScript is a language ususally used in browsers and servers.
            It has DOM manipulation tools in the browser for dynamic content and
            can use \`npm\` packages in a server environment.
        `,
        emoji: "<:js:839517421748617256>",
        extra: "info",
        learn: "info",
    },

    ts: {
        name: "TypeScript",
        main: stripIndent`
            TypeScript is a superset of JavaScript, which means it has
            more features than regular JS. Most importantly, it has a type system which
            makes developers' lives easier by enforcing types in your code. This bot was
            written in TypeScript, so we can vouch for its usefulness.
    
            [**JOIN THE TYPESCRIPT CULT**](https://discord.gg/2eQEuBmpKE)
        `,
        emoji: "<:ts:839517477963694111>",
        extra: "info",
        learn: "info",
    },

    py: {
        name: "Python",
        main: stripIndent`
            Python is a general-purpose scripting language capable of doing
            lots of different things. It has seen recent surges in use related to data
            science and machine learning. It has a really easy learning curve and easy
            to use libraries.
        `,
        emoji: "<:py:839517558071099402>",
        extra: "info",
        learn: "info",
    },

    java: {
        name: "Java",
        main: stripIndent`
            Java is a statically-typed language that was founded on the
            "write once, run anywhere" model. It uses a Java Virtual Machine (JVM) to
            as an interpreter to facilitate that model. Java was created at a time
            when code ran differently on different systems, as we will see below.
            Java is still the most popular language in the world.
        `,
        emoji: "<:java:839518426694418482>",
        extra: "info",
        learn: "info",
    },

    cpp: {
        name: "C++",
        main: stripIndent`
            C++ is a more modern version of C, a really old language.
            (even C++ is over 35 years old!) C++ is a language that compiles directly to
            machine code, so it may not run the same on every computer. Its headline feature
            is that it supports classes and OOP. Nowadays most languages do that. Usage for
            C++ these days is mostly about performance. It is used extensively in game engines.
        `,
        emoji: "<:cpp:839517643237228584>",
        extra: "info",
        learn: "info",
    },
};

export default {
    name: "languages",
    aliases: ["langs"],
    category: "learning",
    args: false,
    description: "Shows you information on many leading languages",
    cooldown: 5,
    async callback({ message }) {
        let mainEmbed = new MessageEmbed()
            .setTitle("Languages")
            .setDescription(
                "This embed will show you information on languages. Click its reaction to learn more."
            )
            .addFields(
                ...Object.keys(langs).map((k: string) => {
                    return {
                        name: langs[k as keyof typeof langs].name,
                        value: langs[k as keyof typeof langs].main,
                    };
                })
            )
            .setColor("RANDOM")
            .setFooter("Want to add another language? Ask the devs!");

        const emojis = Object.keys(langs).map(
            (k) => langs[k as keyof typeof langs].emoji
        );

        let sentEmbed = await message.channel.send(mainEmbed);
        emojis.forEach((e) => sentEmbed.react(e));

        let filter = (reaction: MessageReaction, user: User) =>
            emojis.includes(reaction.emoji.id!) &&
            !user.bot &&
            user.id === message.author.id;

        let reaction = await sentEmbed.awaitReactions(filter, {
            max: 1,
            time: 60000,
            errors: ["time"],
        });

        let emoteName = reaction.first()?.emoji.name! as keyof typeof langs;
        let langEmbed = new MessageEmbed()
            .setTitle(`Additional ${emoteName} help!`)
            .addField("Additional info", stripIndent`${langs[emoteName].extra}`)
            .addField(
                "Places where you can learn it",
                stripIndent`${langs[emoteName].learn}`
            )
            .setColor("RANDOM")
            .setTimestamp();

        await sentEmbed.reactions.removeAll();
        sentEmbed.edit(langEmbed);
    },
} as Command;
