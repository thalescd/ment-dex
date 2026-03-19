import {
    regexSpChar,
    LAZY_LOAD_BATCH_SIZE,
    TRAINER_BATCH_SIZE,
} from "./config.js";
import { clearChildren } from "./domUtils.js";
import { settings } from "./settings.js";
import {
    footerP,
    sanitizeString,
    speciesCanLearnMove,
    refreshURLParams,
} from "./utility.js";
import { passAllFilters } from "./tableFilters.js";
import {
    onlyShowStrategyPokemon,
    locationsButton,
    trainersButton,
    changelogMode,
    onlyShowChangedPokemon,
    itemsButton,
    tableFilter,
    table,
    utilityButton,
    body,
    speciesTable,
    tracker,
    setTracker,
    tableInput,
    tableButton,
    trainersFilterContainer,
} from "./domRefs.js";
import { gameData, trackers, uiState } from "./state.js";
import { displayFunctions } from "./displayRegistry.js";
import { setupItemsButtonFilters } from "../modules/scripts/displayItems.js";
import {
    checkTrainerDifficulty,
    showRematch,
} from "../modules/scripts/displayTrainers.js";

export async function displaySetup() {
    footerP("");

    if (Object.keys(gameData.strategies).length === 0) {
        onlyShowStrategyPokemon.classList.add("hide");
    }
    if (Object.keys(gameData.locations).length === 0) {
        locationsButton.classList.add("hide");
    }
    if (Object.keys(gameData.trainers).length === 0) {
        trainersButton.classList.add("hide");
    }
    const speciesKeyArray = Object.keys(gameData.species);
    for (let i = 0; i < speciesKeyArray.length; i++) {
        if (gameData.species[speciesKeyArray[i]]["changes"].length > 0) {
            changelogMode.classList.remove("hide");
            onlyShowChangedPokemon.classList.remove("hide");
            break;
        }
    }
    if (Object.keys(gameData.items).length === 0) {
        itemsButton.classList.add("hide");
    } else {
        await setupItemsButtonFilters();
    }
    if (typeof window.showShinyToggle !== "undefined") {
        document.getElementById("shinyContainer").classList.remove("hide");
    }

    lazyLoading(true);

    tableInput.classList.remove("hide");
    tableButton.classList.remove("hide");
    tableFilter.classList.remove("hide");
    table.classList.remove("hide");
    utilityButton.classList.remove("hide");
}

export function allAreEqual(array) {
    if (array.length > 0) {
        const result = array.every((element) => {
            if (element === array[0]) {
                return true;
            }
        });
        return result;
    }
    return false;
}

export function sortTableByClassName(
    tableEl,
    obj,
    key,
    classHeader,
    asc = true
) {
    const dirModifier = asc ? 1 : -1;

    tracker.sort((a, b) => {
        let stringA = "";
        let stringB = "";
        for (let i = 0; i < key.length; i++) {
            stringA += obj[a["key"]][key[i]];
            stringB += obj[b["key"]][key[i]];
        }
        if (!isNaN(stringA)) {
            stringA = parseInt(stringA);
        }
        if (!isNaN(stringB)) {
            stringB = parseInt(stringB);
        }

        return stringA > stringB ? 1 * dirModifier : -1 * dirModifier;
    });

    lazyLoading(true);

    // Remember how the column is currently sorted
    tableEl
        .querySelectorAll("th")
        .forEach((th) => th.classList.remove("th-sort-asc", "th-sort-desc"));
    tableEl
        .querySelector(`th.${classHeader}`)
        .classList.toggle("th-sort-asc", asc);
    tableEl
        .querySelector(`th.${classHeader}`)
        .classList.toggle("th-sort-desc", !asc);
}

export function sortTableByLearnsets(asc = true) {
    const dirModifier = asc ? 1 : -1;
    const sortOrder = [
        "levelUpLearnsets",
        "eggMovesLearnsets",
        "TMHMLearnsets",
        "tutorLearnsets",
        "false",
    ];

    trackers.species.sort((a, b) => {
        let stringA = `${speciesCanLearnMove(gameData.species[a["key"]], uiState.speciesMoveFilter)}`;
        let stringB = `${speciesCanLearnMove(gameData.species[b["key"]], uiState.speciesMoveFilter)}`;

        if (Number(stringA) && Number(stringB)) {
            return parseInt(stringA) > parseInt(stringB)
                ? 1 * dirModifier
                : -1 * dirModifier;
        }
        if (Number(stringA)) {
            stringA = "levelUpLearnsets";
        }
        if (Number(stringB)) {
            stringB = "levelUpLearnsets";
        }

        return sortOrder.indexOf(stringA) > sortOrder.indexOf(stringB)
            ? 1 * dirModifier
            : -1 * dirModifier;
    });

    lazyLoading(true);

    // Remember how the column is currently sorted
    speciesTable
        .querySelectorAll("th")
        .forEach((th) => th.classList.remove("th-sort-asc", "th-sort-desc"));
    speciesTable.querySelector(`th.ID`).classList.toggle("th-sort-asc", asc);
    speciesTable.querySelector(`th.ID`).classList.toggle("th-sort-desc", !asc);
}

export function filterTableInput(input, obj, keyArray) {
    const sanitizedInput = input
        .trim()
        .replaceAll(regexSpChar, "")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");
    const regexInput = new RegExp(sanitizedInput, "i");

    for (let i = 0, j = Object.keys(tracker).length; i < j; i++) {
        tracker[i]["filter"].push("input");
        for (let k = 0; k < keyArray.length; k++) {
            if (
                regexInput.test(
                    sanitizeString(
                        "" + obj[tracker[i]["key"]][keyArray[k]]
                    ).replaceAll(regexSpChar, "")
                )
            ) {
                tracker[i]["filter"] = tracker[i]["filter"].filter(
                    (value) => value !== "input"
                );
                break;
            }
        }
    }

    lazyLoading(true);
}

export function filterLocationsTableInput(input, obj, keyArray) {
    const arraySanitizedInput = input
        .trim()
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .split(regexSpChar);

    mainLoop: for (let i = 0, j = Object.keys(tracker).length; i < j; i++) {
        const zone = tracker[i]["key"]
            .split("\\")[0]
            .replaceAll(regexSpChar, "")
            .toLowerCase();
        const method = tracker[i]["key"]
            .split("\\")[1]
            .replaceAll(regexSpChar, "")
            .toLowerCase();
        const name = tracker[i]["key"].split("\\")[2];
        let compareString = `${zone},${method},`
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "");
        if (name in gameData.species) {
            for (let k = 0; k < keyArray.length; k++) {
                compareString += (obj[name][keyArray[k]] + ",")
                    .replaceAll(regexSpChar, "")
                    .replace(/species/i, "")
                    .normalize("NFD")
                    .replace(/[\u0300-\u036f]/g, "")
                    .toLowerCase();
            }
            for (const splitInput of arraySanitizedInput) {
                if (!compareString.includes(splitInput)) {
                    tracker[i]["filter"].push("input");
                    continue mainLoop;
                }
            }
            tracker[i]["filter"] = tracker[i]["filter"].filter(
                (value) => value !== "input"
            );
        }
    }

    lazyLoading(true);
}

export function filterTrainersTableInput(input) {
    const arraySanitizedInput = input
        .trim()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .split(/ /g);

    mainLoop: for (let i = 0, j = trackers.trainers.length; i < j; i++) {
        delete trackers.trainers[i]["show"];
        tracker[i]["filter"] = tracker[i]["filter"].filter(
            (value) => value !== "input"
        );
        const zone = tracker[i]["key"].split("\\")[0];
        const trainer = tracker[i]["key"].split("\\")[1];
        const compareZone = zone.replaceAll(/ /g, "").toUpperCase();
        let compareArray = [
            compareZone,
            gameData.trainers[zone][trainer]["ingameName"].toUpperCase(),
        ];

        const trainerDifficulty = checkTrainerDifficulty(zone, trainer);
        for (
            let k = 0;
            k <
            gameData.trainers[zone][trainer]["party"][trainerDifficulty].length;
            k++
        ) {
            compareArray.push(
                gameData.trainers[zone][trainer]["party"][trainerDifficulty][k][
                    "name"
                ]
            );
        }
        for (let k = 0; k < arraySanitizedInput.length; k++) {
            if (
                !compareArray.some((compareValue) =>
                    compareValue
                        .normalize("NFD")
                        .replace(/[\u0300-\u036f]/g, "")
                        .includes(arraySanitizedInput[k].toUpperCase())
                )
            ) {
                delete gameData.trainers[zone][trainer]["match"];
                tracker[i]["filter"].push("input");
                continue mainLoop;
            }
            if (trackers.trainers[i]["filter"].length === 0) {
                gameData.trainers[zone][trainer]["match"] = true;
            }
        }
        if (
            input.trim().length === 0 &&
            trainersFilterContainer.children.length === 0
        ) {
            delete gameData.trainers[zone][trainer]["match"];
        }
    }
    showRematch();

    lazyLoading(true);
}

export function filterItemsTableInput(input, keyArray) {
    const sanitizedInput = input
        .trim()
        .replaceAll(regexSpChar, "")
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");
    const regexInput = new RegExp(sanitizedInput, "i");

    for (let i = 0, j = Object.keys(tracker).length; i < j; i++) {
        tracker[i]["filter"].push("input");
        for (let k = 0; k < keyArray.length; k++) {
            if (
                regexInput.test(
                    sanitizeString(
                        "" + gameData.items[tracker[i]["key"]][keyArray[k]]
                    ).replaceAll(regexSpChar, "")
                )
            ) {
                tracker[i]["filter"] = tracker[i]["filter"].filter(
                    (value) => value !== "input"
                );
                break;
            }
        }
        Object.keys(gameData.items[tracker[i]["key"]]["locations"]).forEach(
            (method) => {
                if (
                    regexInput.test(
                        sanitizeString(
                            "" +
                                gameData.items[tracker[i]["key"]]["locations"][
                                    method
                                ]
                        ).replaceAll(regexSpChar, "")
                    )
                ) {
                    if (!settings.includes(method)) {
                        tracker[i]["filter"] = tracker[i]["filter"].filter(
                            (value) => value !== "input"
                        );
                    }
                }
            }
        );
    }

    lazyLoading(true);
}

export async function lazyLoading(reset = false) {
    const activeTable = document.querySelectorAll(".activeTable > tbody")[0];
    if (activeTable && typeof tracker !== "undefined") {
        if (reset) {
            clearChildren(activeTable);
            refreshURLParams();
        }
        let target = LAZY_LOAD_BATCH_SIZE;
        let counter = 0;

        const displayFunction = `append${sanitizeString(activeTable.id).replace("tabletbody", "ToTable")}`;
        if (displayFunction === "appendTrainersToTable") {
            target = TRAINER_BATCH_SIZE;
        }

        for (let i = 0, j = tracker.length; i < j; i++) {
            if (counter < target) {
                if (
                    displayFunction === "appendTrainersToTable" &&
                    (passAllFilters(tracker[i]["filter"]) ||
                        tracker[i]["show"]) &&
                    !document.getElementById(tracker[i]["key"])
                ) {
                    if (displayFunctions[displayFunction](tracker[i]["key"])) {
                        counter++;
                    }
                } else if (
                    passAllFilters(tracker[i]["filter"]) &&
                    !document.getElementById(tracker[i]["key"])
                ) {
                    if (displayFunctions[displayFunction](tracker[i]["key"])) {
                        counter++;
                    }
                }
            } else {
                if (displayFunction === "appendLocationsToTable") {
                    const map = tracker[i - 1]["key"].match(/.*?\\/)[0];
                    while (
                        i < j &&
                        tracker[i]["key"].match(/.*?\\/)[0] === map
                    ) {
                        if (
                            tracker[i]["filter"].length === 0 &&
                            !document.getElementById(tracker[i]["key"])
                        ) {
                            displayFunctions[displayFunction](
                                tracker[i]["key"]
                            );
                        }
                        i++;
                    }
                }
                break;
            }
        }
    }
}

export async function tableButtonClick(input, fromDisplayParams = false) {
    if (!fromDisplayParams) {
        body.classList.remove("fixed", "fixedPanel", "fixedAbilities");
    }
    const activeTable = document.querySelectorAll(".activeTable");
    const activeButton = document.querySelectorAll(".activeButton");
    const activeInput = document.querySelectorAll(".activeInput");
    const activeFilter = document.querySelectorAll(".activeFilter");

    activeTable.forEach((table) => {
        const tbody = table.querySelector("tbody");
        clearChildren(tbody);

        table.classList.remove("activeTable");
        table.classList.add("hide");
    });

    activeButton.forEach((button) => {
        button.classList.remove("activeButton");
    });

    activeInput.forEach((input) => {
        input.classList.remove("activeInput");
        input.classList.add("hide");
    });

    activeFilter.forEach((filter) => {
        filter.classList.remove("activeFilter");
        filter.classList.add("hide");
    });

    const targetTable = document.getElementById(`${input}Table`);
    const targetButton = document.getElementById(`${input}Button`);
    const targetInput = document.getElementById(`${input}Input`);
    const targetFilter = document.getElementById(`${input}Filter`);

    targetTable.classList.remove("hide");
    targetTable.classList.add("activeTable");

    targetButton.classList.add("activeButton");

    targetInput.classList.remove("hide");
    targetInput.classList.add("activeInput");

    targetFilter.classList.remove("hide");
    targetFilter.classList.add("activeFilter");

    setTracker(trackers[input]);

    await lazyLoading(true);
}
