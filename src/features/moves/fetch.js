import { gameData, trackers, buildTracker } from "../../core/state.js";
import { dataSources } from "../../core/config.js";
import { statusMsg } from "../../core/status.js";
import { fetchText } from "../../core/http.js";
import { loadCached } from "../../core/cache.js";
import { parseMovesInfo } from "./parse.js";

async function buildMovesObj() {
    try {
        statusMsg("Fetching moves");
        const moves = parseMovesInfo(await fetchText(dataSources.movesInfo));

        // Adicionar flags de prioridade (mesmo comportamento do original)
        Object.keys(moves).forEach((move) => {
            const priority = moves[move]["priority"];
            if (priority > 0) {
                moves[move]["flags"].push(`FLAG_PRIORITY_PLUS_${priority}`);
            } else if (priority < 0) {
                moves[move]["flags"].push(
                    `FLAG_PRIORITY_MINUS_${Math.abs(priority)}`
                );
            }
        });

        return moves;
    } catch (e) {
        console.error("Failed to build moves data:", e.message, e.stack);
        statusMsg("Error fetching moves data. Please refresh the page.");
        throw e;
    }
}

export async function fetchMovesObj() {
    gameData.moves = await loadCached("moves", buildMovesObj);
    trackers.moves = buildTracker(gameData.moves);
}
