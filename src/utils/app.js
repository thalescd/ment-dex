// Orquestrador principal - funcoes que coordenam multiplos modulos
// Separado de utility.js para evitar dependencias circulares

import { gameData } from "./state.js";
import { update } from "./domRefs.js";
import { applySettings } from "./settings.js";
import {
    statusMsg,
    setDataList,
    refreshURLParams,
    checkForUpdates,
} from "./utility.js";
import {
    setFilters,
    createFilter,
    deleteFiltersFromTable,
} from "./tableFilters.js";
import { displaySetup, tableButtonClick } from "./tableUtility.js";
import { createSpeciesPanel, speciesPanel } from "./speciesPanelUtility.js";
import { fetchSpeciesObj } from "../modules/species/fetchSpecies.js";
import { fetchMovesObj } from "../modules/moves/fetchMoves.js";
import { fetchAbilitiesObj } from "../modules/abilities/fetchAbilities.js";
import { fetchLocationsObj } from "../modules/locations/fetchLocations.js";
import { fetchScripts } from "../modules/scripts/fetchScripts.js";
import { setupItemsButtonFilters } from "../modules/scripts/displayItems.js";
import { appendSpeciesToTable } from "../modules/species/displaySpecies.js";
import { appendMovesToTable } from "../modules/moves/displayMoves.js";
import { appendAbilitiesToTable } from "../modules/abilities/displayAbilities.js";
import { appendLocationsToTable } from "../modules/locations/displayLocations.js";
import { appendTrainersToTable } from "../modules/scripts/displayTrainers.js";
import { appendItemsToTable } from "../modules/scripts/displayItems.js";
import { registerTable } from "./displayRegistry.js";
import { TRAINER_BATCH_SIZE } from "./config.js";

// Ligacao feature -> infra de tabela. Fica aqui, no orquestrador, porque
// displayRegistry.js e tableUtility.js nao devem conhecer as features.
registerTable("species", { append: appendSpeciesToTable });
registerTable("moves", { append: appendMovesToTable });
registerTable("abilities", { append: appendAbilitiesToTable });
registerTable("locations", {
    append: appendLocationsToTable,
    groupByMap: true,
});
registerTable("trainers", {
    append: appendTrainersToTable,
    batchSize: TRAINER_BATCH_SIZE,
    useShowFlag: true,
});
registerTable("items", { append: appendItemsToTable });

export async function fetchData(urlParams) {
    try {
        await fetchMovesObj();
        await fetchAbilitiesObj();
        await fetchSpeciesObj();
        await fetchLocationsObj();
        await fetchScripts();

        await fetchTypeChart();
        getLocationsByPokemon();

        setDataList();
        await setFilters();
        applySettings();
        await displaySetup();
        // Setup de filtros especifico de items: a infra de tabela nao precisa
        // conhecer a feature, entao a orquestracao fica aqui.
        if (Object.keys(gameData.items).length > 0) {
            await setupItemsButtonFilters();
        }
        await displayParams(urlParams);

        window.scrollTo(0, 0);
        checkForUpdates(update);
    } catch (e) {
        console.error("Failed to load application data:", e.message, e.stack);
        statusMsg(
            "Error loading data. Please clear cache and refresh the page."
        );
    }
}

export async function fetchTypeChart() {
    statusMsg("Fetching type chart");
    gameData.typeChart = {};
    try {
        let typeChartUrl = "src/data/typeChart.json";
        if (typeof window.repoTypeChartUrl !== "undefined") {
            typeChartUrl = window.repoTypeChartUrl;
        }
        let rawTypeChart = await fetch(typeChartUrl);
        gameData.typeChart = await rawTypeChart.json();
    } catch (e) {
        console.error("Failed to fetch type chart:", e.message, e.stack);
    }
}

export function getLocationsByPokemon() {
    gameData.locationsByPokemon = {};

    Object.keys(gameData.locations).forEach((location) => {
        Object.keys(gameData.locations[location]).forEach((method) => {
            Object.keys(gameData.locations[location][method]).forEach(
                (name) => {
                    if (!(name in gameData.locationsByPokemon)) {
                        gameData.locationsByPokemon[name] = {};
                    }
                    if (!(location in gameData.locationsByPokemon[name])) {
                        gameData.locationsByPokemon[name][location] = [];
                    }
                    gameData.locationsByPokemon[name][location].push(method);
                }
            );
        });
    });
}

export async function displayParams(urlParams) {
    if (urlParams.get("species")) {
        const scrollToSpecies = urlParams.get("species");
        if (gameData.species[scrollToSpecies]) {
            await createSpeciesPanel(scrollToSpecies);
        }
    } else {
        speciesPanel("hide");
    }
    if (urlParams.get("table")) {
        const tableEl = document.getElementById(urlParams.get("table"));
        if (tableEl) {
            await tableButtonClick(
                tableEl.id.replace("Table", ""),
                urlParams.get("species")
            );
        }
    }
    if (urlParams.get("filter")) {
        urlParams
            .get("filter")
            .split(",")
            .forEach((filter) => {
                createFilter(
                    filter.split(":")[1],
                    filter.split(":")[0],
                    filter.split(":")[2]
                );
            });
    }
    if (urlParams.get("input")) {
        document.getElementsByClassName("activeInput")[0].value =
            urlParams.get("input");
        document
            .getElementsByClassName("activeInput")[0]
            .dispatchEvent(new Event("input"));
    }

    refreshURLParams();
}

export async function displayHistoryObj(historyStateObj) {
    deleteFiltersFromTable();
    if (historyStateObj) {
        if ("species" in historyStateObj) {
            let scrollToSpecies = historyStateObj["species"];
            await createSpeciesPanel(scrollToSpecies);
            window.scrollTo(0, 0);
        } else {
            speciesPanel("hide");
        }
        if ("table" in historyStateObj) {
            await tableButtonClick(
                historyStateObj["table"].replace("Table", "")
            );

            deleteFiltersFromTable();
            if ("filter" in historyStateObj) {
                Object.keys(historyStateObj["filter"]).forEach((key) => {
                    if (key === historyStateObj["table"].replace("Table", "")) {
                        for (const filter of historyStateObj["filter"][key]) {
                            if (!/>|<|=/.test(filter)) {
                                createFilter(
                                    filter.split(":")[1].trim(),
                                    filter.split(":")[0],
                                    filter.split(":")[2]
                                );
                            }
                        }
                    }
                });
            }
        }
    }
}

export function exportData() {
    console.log(
        `let backupData = [${JSON.stringify(gameData.moves)}, ${JSON.stringify(gameData.abilities)}, ${JSON.stringify(gameData.species)}, ${JSON.stringify(gameData.locations)}, ${JSON.stringify(gameData.trainers)}, ${JSON.stringify(gameData.items)}, ${JSON.stringify(gameData.typeChart)}]`
    );
}
