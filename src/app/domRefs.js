// Referencias de DOM usadas so pela camada app/ (registro de listeners e
// orquestracao da UI).

import { byId, bySelector } from "../core/dom.js";

export const settingsButton = byId("settings");
export const credits = byId("credits");
export const update = byId("update");
export const speciesPanelInputSpecies = byId("speciesPanelInputSpecies");
export const speciesPanelInputSpeciesDataList = byId(
    "speciesPanelInputSpeciesDataList"
);
export const speciesPanelInfoButton = byId("speciesPanelInfoButton");
export const speciesInput = byId("speciesInput");
export const abilitiesInput = byId("abilitiesInput");
export const abilitiesButton = byId("abilitiesButton");
export const abilitiesTable = byId("abilitiesTable");
export const locationsInput = byId("locationsInput");
export const movesInput = byId("movesInput");
export const movesTable = byId("movesTable");
export const itemsInput = byId("itemsInput");
export const abilitiesInputDataList = byId("abilitiesInputDataList");
export const headerAbilitiesName = bySelector(
    "#abilitiesTableThead th.ability"
);
export const headerAbilitiesDescription = bySelector(
    "#abilitiesTableThead th.description"
);
export const headerMovesMove = bySelector("#movesTableThead th.move");
export const headerMovesType = bySelector("#movesTableThead th.type");
export const headerMovesSplit = bySelector("#movesTableThead th.split");
export const headerMovesPower = bySelector("#movesTableThead th.power");
export const headerMovesAccuracy = bySelector("#movesTableThead th.accuracy");
export const headerMovesPP = bySelector("#movesTableThead th.PP");
export const headerMovesEffect = bySelector("#movesTableThead th.effect");
export const headerSpeciesID = bySelector("#speciesTableThead th.ID");
export const headerSpeciesSprite = bySelector("#speciesTableThead th.sprite");
export const headerSpeciesName = bySelector("#speciesTableThead th.species");
export const headerSpeciesTypes = bySelector("#speciesTableThead th.types");
export const headerSpeciesAbilities = bySelector(
    "#speciesTableThead th.abilities"
);
export const headerSpeciesHP = bySelector("#speciesTableThead th.baseHP");
export const headerSpeciesAtk = bySelector("#speciesTableThead th.baseAttack");
export const headerSpeciesDef = bySelector("#speciesTableThead th.baseDefense");
export const headerSpeciesSpA = bySelector(
    "#speciesTableThead th.baseSpAttack"
);
export const headerSpeciesSpD = bySelector(
    "#speciesTableThead th.baseSpDefense"
);
export const headerSpeciesSpe = bySelector("#speciesTableThead th.baseSpeed");
export const headerSpeciesBST = bySelector("#speciesTableThead th.BST");
