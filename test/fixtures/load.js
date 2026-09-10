import { readFileSync } from "node:fs";

/**
 * Le uma fixture como texto.
 * @param {string} name
 * @returns {string}
 */
export function fixture(name) {
    return readFileSync(new URL(name, import.meta.url), "utf8");
}

/**
 * Le uma fixture JSON.
 * @param {string} name
 */
export function fixtureJson(name) {
    return JSON.parse(fixture(name));
}
