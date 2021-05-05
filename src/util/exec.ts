import fetch from "node-fetch";

const langs = [
    {
        aliases: ["js", "javascript"],
        compiler: "nodejs-14.0.0",
    },
    {
        aliases: ["ts", "typescript"],
        compiler: "typescript-3.9.5",
    },
];

/**
 * An error that gets thrown when the given language is not supported.
 */
class LanguageUnsupportedError implements Error {
    public name = "LanguageNotFoundError";

    constructor(public message: string) {}
}

/**
 * Runs code and returns output.
 *
 * @param code code string to execute
 * @param lang language to execute as
 * @param runtimeOptions a string of runtime options to pass to the program. Defaults to "".
 * @returns Output from API
 * @throws LanguageUnsupportedError when language is not supported.
 * @see [Wandbox](https://github.com/melpon/wandbox/blob/master/kennel2/API.rs), The API used to run the code.
 */
export default async function exec(
    code: string,
    lang: string,
    runtimeOptions = ""
) {
    if (!langs.find(({ aliases }) => aliases.includes(lang)))
        throw new LanguageUnsupportedError(`Language '${lang}' not supported.`);

    const { compiler } = langs.find(({ aliases }) => aliases.includes(lang))!;

    const output = await (
        await fetch("https://wandbox.org/compile", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                compiler,
                code,
                codes: [],
                stdin: "",
                options: "",
                "runtime-option-raw": runtimeOptions,
            }),
        })
    ).text();

    const info = {
        code: 0,
        output: [] as string[],
        isOutput: false,
        isError: false,
    };

    const raw = output.split("\n\n\r").map((l) => l.trim());

    raw.forEach((line) => {
        const payload = line.split("\r\n").slice(1).join("\r\n");

        if (payload) {
            payload.split("\n").forEach((load) => {
                if (info.isError)
                    return info.output.push(load.slice("data: ".length));

                const stuff = load.slice("data: ".length).split(":");

                const header = stuff[0];
                const data = stuff.slice(1).join(":");

                if (!data) {
                    if (info.isOutput) info.output.push(header);

                    return;
                }

                switch (header) {
                    case "SyntaxError":
                    case "TypeError":
                    case "ReferenceError":
                    case "RangeError":
                    case "EvalError":
                    case "URIError":
                    case "AggregateError":
                    case "InternalError":
                    case "Error": {
                        info.isError = true;
                        info.output.push(load.slice("data: ".length));
                        break;
                    }

                    case "StdErr":
                    case "StdOut": {
                        info.isOutput = true;
                        info.output.push(data);
                        break;
                    }

                    case "ExitCode": {
                        info.code = parseInt(data);
                        break;
                    }
                }

                return;
            });

            info.isError = false;
            info.isOutput = false;
        }
    });

    return info;
}
