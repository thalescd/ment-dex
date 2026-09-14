// Referencias de DOM usadas por mais de uma parte do app.
//
// O que e usado por uma unica feature mora no domRefs.js dela; assim core/ nao
// precisa conhecer todo elemento da interface.

import { byId, bySelector } from "./dom.js";

export const body = byId("body");
export const overlay = byId("overlay");
export const popup = byId("popup");
export const overlayAbilities = byId("overlayAbilities");
export const overlaySpeciesPanel = byId("overlaySpeciesPanel");
export const changelogMode = byId("changelogMode");
export const onlyShowChangedPokemon = byId("onlyShowChangedPokemon");
export const speciesPanelMainContainer = byId("speciesPanelMainContainer");
export const speciesPanelHistoryContainer = byId(
    "speciesPanelHistoryContainer"
);
export const shinyToggle = byId("shinyToggle");
export const speciesPanelLocationsButton = byId("speciesPanelLocationsButton");
export const speciesPanelLevelUpFromPreviousEvoTableTbody = byId(
    "speciesPanelLevelUpFromPreviousEvoTableTbody"
);
export const hideLevelUpFromPreviousEvolution = byId(
    "hideLevelUpFromPreviousEvolution"
);
export const speciesPanelLevelUpTableTbody = byId(
    "speciesPanelLevelUpTableTbody"
);
export const hideLevelUp = byId("hideLevelUp");
export const speciesPanelTMHMTableTbody = byId("speciesPanelTMHMTableTbody");
export const hideTMHM = byId("hideTMHM");
export const speciesPanelTutorTableTbody = byId("speciesPanelTutorTableTbody");
export const hideTutor = byId("hideTutor");
export const speciesPanelEggMovesTableTbody = byId(
    "speciesPanelEggMovesTableTbody"
);
export const hideEggMoves = byId("hideEggMoves");
export const speciesButton = byId("speciesButton");
export const speciesTable = byId("speciesTable");
export const locationsButton = byId("locationsButton");
export const movesButton = byId("movesButton");
export const trainersInput = byId("trainersInput");
export const trainersButton = byId("trainersButton");
export const itemsButton = byId("itemsButton");
export const table = bySelector("#table");
export const utilityButton = bySelector(".utilityButton");
