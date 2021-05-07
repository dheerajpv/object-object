const cbRegex = /```(\w*)(.+)```/ms;

/**
 * Searches a string for a codeblock and returns the language provided.
 * @param text text to search for
 * @returns language string given in a codeblock. Undefined if no valid block was found.
 */
export function getLang(text: string) {
    if (!cbRegex.test(text)) return;

    return text.match(cbRegex)?.[1].trim();
}

/**
 * Searches a string for a codeblock and returns the code inside.
 * @param text text to search through
 * @returns code in the code block. Undefined if no valid block was found.
 */
export function getCode(text: string) {
    if (!cbRegex.test(text)) return;

    return text.match(cbRegex)?.[2].trim();
}
