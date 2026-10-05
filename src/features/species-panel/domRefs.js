// Referencias de DOM do painel de especies.

import { byId } from "../../core/dom.js";

export const graph = byId("statsGraph");
export const graphStats = [...graph.children];
export const statDisplays = [...document.querySelectorAll(".statsGraphHeader")];
export const speciesName = byId("speciesName");
export const speciesID = byId("speciesID");
export const speciesSprite = byId("speciesSprite");
export const speciesType1 = byId("speciesType1");
export const speciesType2 = byId("speciesType2");
export const speciesAbilities = byId("speciesAbilities");
export const speciesEvoTable = byId("speciesEvoTable");
export const speciesFormes = byId("speciesFormes");
export const speciesChanges = byId("speciesChanges");
export const speciesChangesContainer = byId("speciesChangesContainer");
export const speciesDefensiveTypeChart = byId("speciesDefensiveTypeChart");
export const speciesPanelLevelUpFromPreviousEvoTable = byId(
    "speciesPanelLevelUpFromPreviousEvoTable"
);
export const speciesPanelLevelUpTable = byId("speciesPanelLevelUpTable");
export const speciesPanelTMHMTable = byId("speciesPanelTMHMTable");
export const speciesPanelTutorTable = byId("speciesPanelTutorTable");
export const speciesPanelEggMovesTable = byId("speciesPanelEggMovesTable");
