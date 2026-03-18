import { dataSources } from "../../utils/config.js";
import { LZString } from "../../utils/lz-string.js";
import { footerP } from "../../utils/utility.js";
import { gameData, trackers } from "../../utils/state.js";
import { parseAbilitiesInfo } from "./regexAbilities.js";

async function buildAbilitiesObj() {
    try {
        footerP("Fetching abilities");
        const raw = await fetch(dataSources.abilitiesInfo);
        const text = await raw.text();
        let abilities = parseAbilitiesInfo(text);

        // Remover abilities sem descricao (mesmo comportamento do original)
        Object.keys(abilities).forEach((ability) => {
            if (abilities[ability]["description"] === "") {
                delete abilities[ability];
            }
        });

        localStorage.setItem(
            "abilities",
            LZString.compressToUTF16(JSON.stringify(abilities))
        );
        return abilities;
    } catch (e) {
        console.error("Failed to build abilities data:", e.message, e.stack);
        footerP("Error fetching abilities data. Please refresh the page.");
        throw e;
    }
}

export async function fetchAbilitiesObj() {
    if (!localStorage.getItem("abilities")) {
        gameData.abilities = await buildAbilitiesObj();
    } else {
        gameData.abilities = await JSON.parse(
            LZString.decompressFromUTF16(localStorage.getItem("abilities"))
        );
    }

    trackers.abilities = [];
    for (let i = 0, j = Object.keys(gameData.abilities).length; i < j; i++) {
        trackers.abilities[i] = {};
        trackers.abilities[i]["key"] = Object.keys(gameData.abilities)[i];
        trackers.abilities[i]["filter"] = [];
    }
}
