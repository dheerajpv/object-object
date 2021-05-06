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
    {
        aliases: ["cpp"],
        compiler: "gcc-head",
    },
    {
        aliases: ["java"],
        compiler: "openjdk-head",
    },
    {
        aliases: ["c"],
        compiler: "gcc-head-c",
    },
    {
        aliases: ["py", "python"],
        compiler: "cpython-head",
    },
    {
        aliases: ["hs", "haskell"],
        compiler: "ghc-head",
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

    const res = await fetch("https://wandbox.org/api/compile.json", {
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
    });
    const output = await res.json();

    const info: {
        code: number;
        output: string;
        compiler: string;
        raw: {
            compiler_message?: string;
            compiler_output?: string;
            program_message?: string;
            program_output?: string;
            status?: string;
        };
    } = {
        code: parseInt(output.status),
        output: output.program_output,
        raw: output,
        compiler: output.compiler_output,
    };

    info.code = parseInt(output.status);
    info.output = output.program_output;
    info.compiler = output.compiler_output ?? "";

    return info;
}
