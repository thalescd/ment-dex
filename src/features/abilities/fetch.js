import { gameData, trackers, buildTracker } from "../../core/state.js";
import { dataSources } from "../../core/config.js";
import { statusMsg } from "../../core/status.js";
import { fetchText } from "../../core/http.js";
import { loadCached } from "../../core/cache.js";
import { parseAbilitiesInfo } from "./parse.js";

async function buildAbilitiesObj() {
    try {
        statusMsg("Fetching abilities");
        const abilities = parseAbilitiesInfo(
            await fetchText(dataSources.abilitiesInfo)
        );

        // Remover abilities sem descricao (mesmo comportamento do original)
        Object.keys(abilities).forEach((ability) => {
            if (abilities[ability]["description"] === "") {
                delete abilities[ability];
            }
        });

        return abilities;
    } catch (e) {
        console.error("Failed to build abilities data:", e.message, e.stack);
        statusMsg("Error fetching abilities data. Please refresh the page.");
        throw e;
    }
}

export async function fetchAbilitiesObj() {
    gameData.abilities = await loadCached("abilities", buildAbilitiesObj);
    trackers.abilities = buildTracker(gameData.abilities);
}
