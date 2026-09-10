// Referencias DOM e variaveis de estado compartilhadas

// Estas referencias sao resolvidas no momento do import (o <script type="module">
// e deferido, entao o DOM ja existe). Antes usavamos getElementById direto, que
// devolve null quando o elemento nao esta la: um id renomeado no HTML virava um
// null silencioso, e o estouro acontecia depois, longe da causa — ou nunca, com
// a feature simplesmente morta. Falhar aqui, dizendo qual seletor faltou, e mais
// barato de diagnosticar.

/**
 * @param {string} id
 * @returns {HTMLElement}
 */
function byId(id) {
    const element = document.getElementById(id);
    if (!element)
        throw new Error(`domRefs: nao existe elemento com id "${id}"`);
    return element;
}

/**
 * @param {string} selector
 * @returns {HTMLElement}
 */
function bySelector(selector) {
    const element = /** @type {HTMLElement|null} */ (
        document.querySelector(selector)
    );
    if (!element) {
        throw new Error(`domRefs: nenhum elemento casa com "${selector}"`);
    }
    return element;
}

// --- Variaveis de estado ---
export let tracker;
export let panelSpecies = "";
export const historyObj = [];

// Setters para estado mutavel (imports ES sao read-only para quem importa)
export function setTracker(value) {
    tracker = value;
}
export function setPanelSpecies(value) {
    panelSpecies = value;
}

// --- Elementos DOM gerais ---
export const tableFilter = byId("tableFilter");
export const body = byId("body");
export const settingsButton = byId("settings");
export const credits = byId("credits");
export const update = byId("update");
export const overlay = byId("overlay");
export const popup = byId("popup");
export const overlayAbilities = byId("overlayAbilities");
export const popupAbilities = byId("popupAbilities");
export const overlaySpeciesPanel = byId("overlaySpeciesPanel");

// --- Changelog / Filtros especiais ---
export const changelogMode = byId("changelogMode");
export const onlyShowChangedPokemon = byId("onlyShowChangedPokemon");

// --- Grafico de stats ---
export const graph = byId("statsGraph");
export const graphStats = [...graph.children];
export const statDisplays = [...document.querySelectorAll(".statsGraphHeader")];

// --- Species Panel ---
export const speciesPanelMainContainer = byId("speciesPanelMainContainer");
export const speciesPanelHistoryContainer = byId(
    "speciesPanelHistoryContainer"
);
export const speciesName = byId("speciesName");
export const speciesID = byId("speciesID");
export const speciesPanelInputSpecies = byId("speciesPanelInputSpecies");
export const speciesPanelInputSpeciesDataList = byId(
    "speciesPanelInputSpeciesDataList"
);
export const shinyToggle = byId("shinyToggle");
export const speciesSprite = byId("speciesSprite");
export const speciesType1 = byId("speciesType1");
export const speciesType2 = byId("speciesType2");
export const speciesPanelLocationsButton = byId("speciesPanelLocationsButton");
export const speciesPanelInfoButton = byId("speciesPanelInfoButton");
export const speciesAbilities = byId("speciesAbilities");
export const speciesInnatesMainContainer = byId("speciesInnatesMainContainer");
export const speciesInnates = byId("speciesInnates");
export const speciesEvoTable = byId("speciesEvoTable");
export const speciesFormes = byId("speciesFormes");
export const speciesChanges = byId("speciesChanges");
export const speciesChangesContainer = byId("speciesChangesContainer");
export const speciesDefensiveTypeChart = byId("speciesDefensiveTypeChart");
export const speciesOffensiveTypeChart = byId("speciesOffensiveTypeChart");
export const speciesPanelLevelUpFromPreviousEvoTable = byId(
    "speciesPanelLevelUpFromPreviousEvoTable"
);
export const speciesPanelLevelUpFromPreviousEvoTableTbody = byId(
    "speciesPanelLevelUpFromPreviousEvoTableTbody"
);
export const hideLevelUpFromPreviousEvolution = byId(
    "hideLevelUpFromPreviousEvolution"
);
export const speciesPanelLevelUpTable = byId("speciesPanelLevelUpTable");
export const speciesPanelLevelUpTableTbody = byId(
    "speciesPanelLevelUpTableTbody"
);
export const hideLevelUp = byId("hideLevelUp");
export const speciesPanelTMHMTable = byId("speciesPanelTMHMTable");
export const speciesPanelTMHMTableTbody = byId("speciesPanelTMHMTableTbody");
export const hideTMHM = byId("hideTMHM");
export const speciesPanelTutorTable = byId("speciesPanelTutorTable");
export const speciesPanelTutorTableTbody = byId("speciesPanelTutorTableTbody");
export const hideTutor = byId("hideTutor");
export const speciesPanelEggMovesTable = byId("speciesPanelEggMovesTable");
export const speciesPanelEggMovesTableTbody = byId(
    "speciesPanelEggMovesTableTbody"
);
export const hideEggMoves = byId("hideEggMoves");

// --- Tabela Species ---
export const speciesInput = byId("speciesInput");
export const speciesButton = byId("speciesButton");
export const speciesTable = byId("speciesTable");
export const speciesTableTbody = byId("speciesTableTbody");

// --- Tabela Abilities ---
export const abilitiesInput = byId("abilitiesInput");
export const abilitiesButton = byId("abilitiesButton");
export const abilitiesTable = byId("abilitiesTable");
export const abilitiesTableTbody = byId("abilitiesTableTbody");

// --- Tabela Locations ---
export const locationsInput = byId("locationsInput");
export const locationsButton = byId("locationsButton");
export const locationsTableTbody = byId("locationsTableTbody");
export const locationsFilterContainer = byId("locationsFilterContainer");

// --- Tabela Moves ---
export const movesInput = byId("movesInput");
export const movesButton = byId("movesButton");
export const movesTable = byId("movesTable");
export const movesTableTbody = byId("movesTableTbody");

// --- Tabela Trainers ---
export const trainersInput = byId("trainersInput");
export const trainersButton = byId("trainersButton");
export const difficultyButtonContainer = byId("difficultyButtonContainer");
export const trainersTableTbody = byId("trainersTableTbody");
export const trainersFilter = byId("trainersFilter");

// --- Tabela Items ---
export const itemsInput = byId("itemsInput");
export const itemsButton = byId("itemsButton");
export const itemsTableTbody = byId("itemsTableTbody");

// --- DataLists ---
export const abilitiesInputDataList = byId("abilitiesInputDataList");

// --- Tabela principal ---
export const table = bySelector("#table");

// --- Headers Abilities ---
export const headerAbilitiesName = bySelector(
    "#abilitiesTableThead th.ability"
);
export const headerAbilitiesDescription = bySelector(
    "#abilitiesTableThead th.description"
);

// --- Headers Moves ---
export const headerMovesMove = bySelector("#movesTableThead th.move");
export const headerMovesType = bySelector("#movesTableThead th.type");
export const headerMovesSplit = bySelector("#movesTableThead th.split");
export const headerMovesPower = bySelector("#movesTableThead th.power");
export const headerMovesAccuracy = bySelector("#movesTableThead th.accuracy");
export const headerMovesPP = bySelector("#movesTableThead th.PP");
export const headerMovesEffect = bySelector("#movesTableThead th.effect");

// --- Headers Species ---
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

// --- Headers Locations ---

// --- Botao utilitario ---
export const utilityButton = bySelector(".utilityButton");

// --- Containers de input/botao da tabela ---
export const tableInput = byId("tableInput");
export const tableButton = byId("tableButton");

// --- Containers de filtro ---
export const speciesFilterContainer = byId("speciesFilterContainer");
export const trainersFilterContainer = byId("trainersFilterContainer");

// --- Listas de filtros por tabela ---
export const speciesFilterList = byId("speciesFilterList");
export const locationsFilterList = byId("locationsFilterList");
export const movesFilterList = byId("movesFilterList");
export const trainersFilterList = byId("trainersFilterList");
