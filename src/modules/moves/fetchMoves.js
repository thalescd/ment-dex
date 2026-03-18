import { gameData, trackers } from "../../utils/state.js";
import { dataSources } from "../../utils/config.js";
import { LZString } from "../../utils/lz-string.js";
import { footerP } from "../../utils/utility.js";
import { parseMovesInfo } from "./regexMoves.js";

async function buildMovesObj() {
    try {
        footerP("Fetching moves");
        const raw = await fetch(dataSources.movesInfo);
        const text = await raw.text();
        let moves = parseMovesInfo(text);

        // Adicionar flags de prioridade (mesmo comportamento do original)
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
