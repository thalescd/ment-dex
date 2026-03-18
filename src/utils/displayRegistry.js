// Registry de funções de display — substitui window[functionName]() para dispatch dinâmico
// Cada display module registra suas funções aqui ao ser importado

import { appendSpeciesToTable } from "../modules/species/displaySpecies.js";
import { appendMovesToTable } from "../modules/moves/displayMoves.js";
import { appendAbilitiesToTable } from "../modules/abilities/displayAbilities.js";
import { appendLocationsToTable } from "../modules/locations/displayLocations.js";
import { appendTrainersToTable } from "../modules/scripts/displayTrainers.js";
import { appendItemsToTable } from "../modules/scripts/displayItems.js";

export const displayFunctions = {
    appendSpeciesToTable,
    appendMovesToTable,
    appendAbilitiesToTable,
    appendLocationsToTable,
    appendTrainersToTable,
    appendItemsToTable,
};
