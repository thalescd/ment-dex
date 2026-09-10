import { gameData, trackers, buildTracker } from "../../utils/state.js";
import { dataSources } from "../../utils/config.js";
import { statusMsg } from "../../utils/utility.js";
import { fetchText } from "../../utils/http.js";
import { loadCached } from "../../utils/cache.js";
import { parseAbilitiesInfo } from "./regexAbilities.js";

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
