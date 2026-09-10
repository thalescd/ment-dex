// Popula os <datalist> de autocomplete e os mapas de nome-exibido -> constante.
//
// Vive em app/ porque atravessa tres features (species, abilities, moves) e
// roda uma vez na inicializacao — nao pertence a nenhuma delas.

import { gameData, uiState } from "../core/state.js";
import { sanitizeString } from "../core/strings.js";
import {
    speciesPanelInputSpeciesDataList,
    abilitiesInputDataList,
} from "../core/domRefs.js";

export function setDataList() {
    uiState.speciesIngameNameArray = [];
    for (const name in gameData.species) {
        if (gameData.species[name]["baseSpeed"] <= 0) {
            continue;
        }
        const option = document.createElement("option");
        option.innerText = sanitizeString(name);
        uiState.speciesIngameNameArray.push(sanitizeString(name));
        speciesPanelInputSpeciesDataList.append(option);
    }

    uiState.abilitiesIngameNameArray = [];
    uiState.abilityIngameNameToKey = {};
    for (const abilityName in gameData.abilities) {
        if (
            !gameData.abilities[abilityName]["description"] ||
            !/[1-9aA-zZ]/.test(gameData.abilities[abilityName]["ingameName"])
        ) {
            continue;
        }
        const option = document.createElement("option");
        option.innerText = gameData.abilities[abilityName]["ingameName"];
        uiState.abilitiesIngameNameArray.push(
            gameData.abilities[abilityName]["ingameName"]
        );
        uiState.abilityIngameNameToKey[
            gameData.abilities[abilityName]["ingameName"]
        ] = abilityName;
        abilitiesInputDataList.append(option);
    }

    uiState.moveIngameNameToKey = {};
    for (const moveName in gameData.moves) {
        if (gameData.moves[moveName]["ingameName"]) {
            uiState.moveIngameNameToKey[
                gameData.moves[moveName]["ingameName"]
            ] = moveName;
        }
    }
}
