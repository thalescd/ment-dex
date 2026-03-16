// Orquestrador principal - funcoes que coordenam multiplos modulos
// Separado de utility.js para evitar dependencias circulares

import { checkUpdate } from './config.js';
import { panelSpecies, historyObj } from './domRefs.js';
import { applySettings } from './settings.js';
import { footerP, sanitizeString, forceUpdate, clearLocalStorage, setDataList, refreshURLParams, getHistoryState } from './utility.js';
import { setFilters, createFilter, deleteFiltersFromTable } from './tableFilters.js';
import { displaySetup, tableButtonClick } from './tableUtility.js';
import { createSpeciesPanel, speciesPanel } from './speciesPanelUtility.js';
import { fetchSpeciesObj } from '../modules/species/fetchSpecies.js';
import { fetchMovesObj } from '../modules/moves/fetchMoves.js';
import { fetchAbilitiesObj } from '../modules/abilities/fetchAbilities.js';
import { fetchLocationsObj } from '../modules/locations/fetchLocations.js';
import { fetchScripts } from '../modules/scripts/fetchScripts.js';
import { fetchStrategiesObj } from '../modules/strategies/fetchStrategies.js';

export async function fetchData(urlParams = "") {
    if (urlParams == "") {
        history.pushState(null, null, location.href);
        const queryString = window.location.search;
        urlParams = new URLSearchParams(queryString);
    }
    await forceUpdate();

    await fetchMovesObj();
    await fetchAbilitiesObj();
    await fetchSpeciesObj();
    await fetchLocationsObj();
    await fetchScripts();
    await fetchStrategiesObj();

    await fetchTypeChart();
    await getLocationsByPokemon();

    await setDataList();
    await setFilters();
    await applySettings();
    await displaySetup();
    await displayParams(urlParams);

    await window.scrollTo(0, 0);
}

export async function fetchTypeChart() {
    footerP("Fetching type chart");
    window.typeChart = {};
    try {
        let typeChartUrl = "src/typeChart.json";
        if (typeof window.repoTypeChartUrl !== "undefined") {
            typeChartUrl = window.repoTypeChartUrl;
        }
        let rawTypeChart = await fetch(typeChartUrl);
        window.typeChart = await rawTypeChart.json();
    } catch (e) {
        console.log(e.message);
        console.log(e.stack);
    }
}

export async function getLocationsByPokemon() {
    window.locationsByPokemon = {};

    Object.keys(window.locations).forEach((location) => {
        Object.keys(window.locations[location]).forEach((method) => {
            Object.keys(window.locations[location][method]).forEach((name) => {
                if (!(name in window.locationsByPokemon)) {
                    window.locationsByPokemon[name] = {};
                }
                if (!(location in window.locationsByPokemon[name])) {
                    window.locationsByPokemon[name][location] = [];
                }
                window.locationsByPokemon[name][location].push(method);
            });
        });
    });
}

export async function displayParams(urlParams) {
    if (urlParams.get("species")) {
        let scrollToSpecies = urlParams.get("species");
        await createSpeciesPanel(scrollToSpecies);
    } else {
        speciesPanel("hide");
    }
    if (urlParams.get("table")) {
        await tableButtonClick(
            document
                .getElementById(urlParams.get("table"))
                .id.replace("Table", ""),
            urlParams.get("species")
        );
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

    await refreshURLParams();
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
        `let backupData = [${JSON.stringify(window.moves)}, ${JSON.stringify(window.abilities)}, ${JSON.stringify(window.species)}, ${JSON.stringify(window.locations)}, ${JSON.stringify(window.trainers)}, ${JSON.stringify(window.items)}, ${JSON.stringify(window.strategies)}, ${JSON.stringify(window.typeChart)}]`
    );
}

