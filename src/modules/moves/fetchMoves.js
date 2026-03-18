import { gameData, trackers } from "../../utils/state.js";
import { repos } from "../../utils/config.js";
import { LZString } from "../../utils/lz-string.js";
import { footerP } from "../../utils/utility.js";
import {
    regexMoves,
    regexMovesDescription,
    regexMovesIngameName,
    regexVanillaMovesDescription,
    regexMovesFlags,
} from "./regexMoves.js";

async function getMoves(moves) {
    footerP("Fetching moves");
    const rawMoves = await fetch(`${repos.cfru}/src/Tables/battle_moves.c`);
    const textMoves = await rawMoves.text();

    return regexMoves(textMoves, moves);
}

async function getMovesDescription(moves) {
    const rawMovesDescription = await fetch(
        `${repos.cfru}/strings/attack_descriptions.string`
    );
    const textMovesDescription = await rawMovesDescription.text();

    return regexMovesDescription(textMovesDescription, moves);
}

async function getMovesIngameName(moves) {
    const rawMovesIngameName = await fetch(
        `${repos.cfru}/strings/attack_name_table.string`
    );
    const textMovesIngameName = await rawMovesIngameName.text();

    return regexMovesIngameName(textMovesIngameName, moves);
}

async function getVanillaMovesDescription(moves) {
    const rawVanillaMovesDescription = await fetch(
        `${repos.decap}/src/move_descriptions.c`
    );
    const textVanillaMovesDescription = await rawVanillaMovesDescription.text();

    return regexVanillaMovesDescription(textVanillaMovesDescription, moves);
}

async function getMovesFlags(moves) {
    const rawMovesFlags = await fetch(
        `${repos.cfru}/assembly/data/move_tables.json`
    );
    const jsonMovesFlags = await rawMovesFlags.json();

    const rawTutorFlags = await fetch(
        `${repos.dex}/src/moves/tutor_flags.json`
    );
    const jsonTutorFlags = await rawTutorFlags.json();

    return regexMovesFlags(jsonMovesFlags, jsonTutorFlags, moves);
}

async function buildMovesObj() {
    try {
        let moves = {};
        moves = await getMoves(moves);
        //moves = await getFlags(moves) // file missing for unbound
        await Promise.all([
            getVanillaMovesDescription(moves),
            getMovesDescription(moves),
            getMovesIngameName(moves),
            getMovesFlags(moves),
        ]);

        Object.keys(moves).forEach((move) => {
            if (moves[move]["priority"] > 0) {
                moves[move]["flags"].push(
                    `FLAG_PRIORITY_PLUS_${moves[move]["priority"]}`
                );
            } else if (moves[move]["priority"] < 0) {
                moves[move]["flags"].push(
                    `FLAG_PRIORITY_MINUS_${Math.abs(moves[move]["priority"])}`
                );
            }
        });

        localStorage.setItem(
            "moves",
            LZString.compressToUTF16(JSON.stringify(moves))
        );
        return moves;
    } catch (e) {
        console.error("Failed to build moves data:", e.message, e.stack);
        footerP("Error fetching moves data. Please refresh the page.");
        throw e;
    }
}

export async function fetchMovesObj() {
    if (!localStorage.getItem("moves")) {
        gameData.moves = await buildMovesObj();
    } else {
        gameData.moves = await JSON.parse(
            LZString.decompressFromUTF16(localStorage.getItem("moves"))
        );
    }

    trackers.moves = [];
    for (let i = 0, j = Object.keys(gameData.moves).length; i < j; i++) {
        trackers.moves[i] = {};
        trackers.moves[i]["key"] = Object.keys(gameData.moves)[i];
        trackers.moves[i]["filter"] = [];
    }
}
