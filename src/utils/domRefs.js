// Referencias DOM e variaveis de estado compartilhadas

// --- Variaveis de estado ---
export let tracker;
export let panelSpecies = "";
export let historyObj = [];

// Setters para estado mutavel (imports ES sao read-only para quem importa)
export function setTracker(value) {
    tracker = value;
    window.tracker = value;
}
export function setPanelSpecies(value) {
    panelSpecies = value;
    window.panelSpecies = value;
}
export function setHistoryObj(value) {
    historyObj = value;
    window.historyObj = value;
}

// Compatibilidade temporaria
window.tracker = tracker;
window.panelSpecies = panelSpecies;
window.historyObj = historyObj;

// --- Elementos DOM gerais ---
export const tableFilter = document.getElementById("tableFilter");
export const body = document.getElementById("body");
export const settingsButton = document.getElementById("settings");
export const credits = document.getElementById("credits");
export const modal = document.getElementById("modal");
export const update = document.getElementById("update");
export const overlay = document.getElementById("overlay");
export const popup = document.getElementById("popup");
export const overlayAbilities = document.getElementById("overlayAbilities");
export const popupAbilities = document.getElementById("popupAbilities");
export const overlaySpeciesPanel = document.getElementById(
    "overlaySpeciesPanel"
);

// --- Changelog / Filtros especiais ---
export const changelogMode = document.getElementById("changelogMode");
export const onlyShowChangedPokemon = document.getElementById(
    "onlyShowChangedPokemon"
);
export const onlyShowStrategyPokemon = document.getElementById(
    "onlyShowStrategyPokemon"
);

// --- Grafico de stats ---
export const graph = document.getElementById("statsGraph");
export const graphStats = [...graph.children];
export const statDisplays = [...document.querySelectorAll(".statsGraphHeader")];

// --- Species Panel ---
export const speciesPanelMainContainer = document.getElementById(
    "speciesPanelMainContainer"
);
export const speciesPanelHistoryContainer = document.getElementById(
    "speciesPanelHistoryContainer"
);
export const speciesName = document.getElementById("speciesName");
export const speciesID = document.getElementById("speciesID");
export const speciesPanelInputSpecies = document.getElementById(
    "speciesPanelInputSpecies"
);
export const speciesPanelInputSpeciesDataList = document.getElementById(
    "speciesPanelInputSpeciesDataList"
);
export const shinyToggle = document.getElementById("shinyToggle");
export const speciesSprite = document.getElementById("speciesSprite");
export const speciesType1 = document.getElementById("speciesType1");
export const speciesType2 = document.getElementById("speciesType2");
export const speciesPanelLocationsButton = document.getElementById(
    "speciesPanelLocationsButton"
);
export const speciesPanelInfoButton = document.getElementById(
    "speciesPanelInfoButton"
);
export const speciesAbilities = document.getElementById("speciesAbilities");
export const speciesInnatesMainContainer = document.getElementById(
    "speciesInnatesMainContainer"
);
export const speciesInnates = document.getElementById("speciesInnates");
export const speciesBaseStatsGraph = document.getElementById(
    "speciesBaseStatsGraph"
);
export const speciesEvolutionsText = document.getElementById(
    "speciesEvolutionsText"
);
export const speciesEvoTable = document.getElementById("speciesEvoTable");
export const speciesFormes = document.getElementById("speciesFormes");
export const speciesFormesText = document.getElementById("speciesFormesText");
export const speciesChanges = document.getElementById("speciesChanges");
export const speciesChangesContainer = document.getElementById(
    "speciesChangesContainer"
);
export const speciesDefensiveTypeChart = document.getElementById(
    "speciesDefensiveTypeChart"
);
export const speciesOffensiveTypeChart = document.getElementById(
    "speciesOffensiveTypeChart"
);
export const speciesStrategiesContainer = document.getElementById(
    "speciesStrategiesContainer"
);
export const speciesStrategies = document.getElementById("speciesStrategies");
export const speciesPanelLevelUpFromPreviousEvoTable = document.getElementById(
    "speciesPanelLevelUpFromPreviousEvoTable"
);
export const speciesPanelLevelUpFromPreviousEvoTableTbody =
    document.getElementById("speciesPanelLevelUpFromPreviousEvoTableTbody");
export const hideLevelUpFromPreviousEvolution = document.getElementById(
    "hideLevelUpFromPreviousEvolution"
);
export const speciesPanelLevelUpTable = document.getElementById(
    "speciesPanelLevelUpTable"
);
export const speciesPanelLevelUpTableTbody = document.getElementById(
    "speciesPanelLevelUpTableTbody"
);
export const hideLevelUp = document.getElementById("hideLevelUp");
export const speciesPanelTMHMTable = document.getElementById(
    "speciesPanelTMHMTable"
);
export const speciesPanelTMHMTableTbody = document.getElementById(
    "speciesPanelTMHMTableTbody"
);
export const hideTMHM = document.getElementById("hideTMHM");
export const speciesPanelTutorTable = document.getElementById(
    "speciesPanelTutorTable"
);
export const speciesPanelTutorTableTbody = document.getElementById(
    "speciesPanelTutorTableTbody"
);
export const hideTutor = document.getElementById("hideTutor");
export const speciesPanelEggMovesTable = document.getElementById(
    "speciesPanelEggMovesTable"
);
export const speciesPanelEggMovesTableTbody = document.getElementById(
    "speciesPanelEggMovesTableTbody"
);
export const hideEggMoves = document.getElementById("hideEggMoves");

// --- Tabela Species ---
export const speciesInput = document.getElementById("speciesInput");
export const speciesButton = document.getElementById("speciesButton");
export const speciesTable = document.getElementById("speciesTable");
export const speciesTableThead = document.getElementById("speciesTableThead");
export const speciesTableTbody = document.getElementById("speciesTableTbody");

// --- Tabela Abilities ---
export const abilitiesInput = document.getElementById("abilitiesInput");
export const abilitiesButton = document.getElementById("abilitiesButton");
export const abilitiesTable = document.getElementById("abilitiesTable");
export const abilitiesTableThead = document.getElementById(
    "abilitiesTableThead"
);
export const abilitiesTableTbody = document.getElementById(
    "abilitiesTableTbody"
);

// --- Tabela Locations ---
export const locationsInput = document.getElementById("locationsInput");
export const locationsButton = document.getElementById("locationsButton");
export const locationsTable = document.getElementById("locationsTable");
export const locationsTableTbody = document.getElementById(
    "locationsTableTbody"
);
export const locationsFilterContainer = document.getElementById(
    "locationsFilterContainer"
);

// --- Tabela Moves ---
export const movesInput = document.getElementById("movesInput");
export const movesButton = document.getElementById("movesButton");
export const movesTable = document.getElementById("movesTable");
export const movesTableThead = document.getElementById("movesTableThead");
export const movesTableTbody = document.getElementById("movesTableTbody");

// --- Tabela Trainers ---
export const trainersInput = document.getElementById("trainersInput");
export const trainersButton = document.getElementById("trainersButton");
export const trainersTable = document.getElementById("trainersTable");
export const difficultyButtonContainer = document.getElementById(
    "difficultyButtonContainer"
);
export const trainersTableTbody = document.getElementById("trainersTableTbody");
export const trainersFilter = document.getElementById("trainersFilter");

// --- Tabela Items ---
export const itemsInput = document.getElementById("itemsInput");
export const itemsButton = document.getElementById("itemsButton");
export const itemsTable = document.getElementById("itemsTable");
export const itemsTableTbody = document.getElementById("itemsTableTbody");
export const itemsFilter = document.getElementById("itemsFilter");

// --- DataLists ---
export const abilitiesInputDataList = document.getElementById(
    "abilitiesInputDataList"
);
export const speciesInputDataList = document.getElementById(
    "speciesInputDataList"
);
export const movesInputDataList = document.getElementById("movesInputDataList");

// --- Tabela principal ---
export const table = document.querySelector("#table");

// --- Headers Abilities ---
export const headerAbilitiesName = document.querySelector(
    "#abilitiesTableThead th.ability"
);
export const headerAbilitiesDescription = document.querySelector(
    "#abilitiesTableThead th.description"
);

// --- Headers Moves ---
export const headerMovesMove = document.querySelector(
    "#movesTableThead th.move"
);
export const headerMovesType = document.querySelector(
    "#movesTableThead th.type"
);
export const headerMovesSplit = document.querySelector(
    "#movesTableThead th.split"
);
export const headerMovesPower = document.querySelector(
    "#movesTableThead th.power"
);
export const headerMovesAccuracy = document.querySelector(
    "#movesTableThead th.accuracy"
);
export const headerMovesPP = document.querySelector("#movesTableThead th.PP");
export const headerMovesEffect = document.querySelector(
    "#movesTableThead th.effect"
);

// --- Headers Species ---
export const headerSpeciesID = document.querySelector(
    "#speciesTableThead th.ID"
);
export const headerSpeciesSprite = document.querySelector(
    "#speciesTableThead th.sprite"
);
export const headerSpeciesName = document.querySelector(
    "#speciesTableThead th.species"
);
export const headerSpeciesTypes = document.querySelector(
    "#speciesTableThead th.types"
);
export const headerSpeciesAbilities = document.querySelector(
    "#speciesTableThead th.abilities"
);
export const headerSpeciesInnates = document.querySelector(
    "#speciesTableThead th.innates"
);
export const headerSpeciesHP = document.querySelector(
    "#speciesTableThead th.baseHP"
);
export const headerSpeciesAtk = document.querySelector(
    "#speciesTableThead th.baseAttack"
);
export const headerSpeciesDef = document.querySelector(
    "#speciesTableThead th.baseDefense"
);
export const headerSpeciesSpA = document.querySelector(
    "#speciesTableThead th.baseSpAttack"
);
export const headerSpeciesSpD = document.querySelector(
    "#speciesTableThead th.baseSpDefense"
);
export const headerSpeciesSpe = document.querySelector(
    "#speciesTableThead th.baseSpeed"
);
export const headerSpeciesBST = document.querySelector(
    "#speciesTableThead th.BST"
);

// --- Headers Locations ---
export const headerLocationsSprite = document.querySelector(
    "#locationsTableThead th.sprite"
);
export const headerLocationsSpecies = document.querySelector(
    "#locationsTableThead th.species"
);
export const headerLocationsRarity = document.querySelector(
    "#locationsTableThead th.rarity"
);
export const headerLocationsZone = document.querySelector(
    "#locationsTableThead th.zone"
);

// --- Botao utilitario ---
export const utilityButton = document.querySelector(".utilityButton");
