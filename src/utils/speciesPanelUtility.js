// --- ES Module Imports ---
import {
    sanitizeString,
    getSpeciesSpriteSrc,
    returnTargetSpeciesSprite,
    refreshURLParams,
    getPokemonResistanceValueAgainstType,
    getPokemonEffectivenessValueAgainstType,
} from "./utility.js";

import { isSameColor } from "./spriteUtils.js";

import {
    panelSpecies,
    setPanelSpecies,
    setTracker,
    speciesPanelMainContainer,
    speciesName as speciesNameEl,
    speciesID,
    speciesSprite,
    speciesType1,
    speciesType2,
    speciesPanelLocationsButton,
    speciesAbilities,
    speciesInnatesMainContainer,
    speciesInnates,
    speciesEvoTable,
    speciesFormes,
    speciesChanges,
    speciesChangesContainer,
    speciesDefensiveTypeChart,
    speciesOffensiveTypeChart,
    speciesStrategiesContainer,
    speciesStrategies,
    speciesPanelLevelUpFromPreviousEvoTable,
    speciesPanelLevelUpTable,
    speciesPanelTMHMTable,
    speciesPanelTutorTable,
    speciesPanelEggMovesTable,
    shinyToggle,
    body,
    overlay,
    overlaySpeciesPanel,
    graph,
    graphStats,
    statDisplays,
    speciesButton,
    table,
    utilityButton,
    popup,
} from "./domRefs.js";

import { tableButtonClick } from "./tableUtility.js";
import { deleteFiltersFromTable, createFilter } from "./tableFilters.js";
import { gameData, trackers } from "./state.js";
import { clearChildren } from "./domUtils.js";

// --- Extracted modules ---
import { manageSpeciesPanelHistory } from "./speciesPanelHistory.js";
import { createChange } from "./speciesPanelChanges.js";
import { createSpeciesStrategy } from "./speciesPanelStrategies.js";
import {
    buildSpeciesPanelLevelUpFromPreviousEvoTable,
    buildSpeciesPanelDoubleLearnsetsTable,
    buildSpeciesPanelSingleLearnsetsTable,
} from "./speciesPanelLearnsets.js";

// --- DOM elements not in domRefs (grabbed locally) ---
const speciesType3 = document.getElementById("speciesType3");
const speciesAbilitiesMainContainer = document.getElementById(
    "speciesAbilitiesMainContainer"
);
const speciesEvolutionsMainContainer = document.getElementById(
    "speciesEvolutionsMainContainer"
);
const speciesFormesContainer = document.getElementById(
    "speciesFormesContainer"
);

export async function createSpeciesPanel(name) {
    if (
        panelSpecies === name &&
        !speciesPanelMainContainer.classList.contains("hide")
    ) {
        return;
    }

    const isReopen = panelSpecies === name;

    setPanelSpecies(name);
    speciesPanel("show");
    refreshURLParams();
    await manageSpeciesPanelHistory(name);

    if (isReopen) {
        return;
    }

    speciesNameEl.innerText = sanitizeString(name);
    speciesID.innerText = `#${gameData.species[name]["ID"]}`;

    speciesSprite.className = `sprite${name}`;
    handleShiny();
    speciesSprite.src = getSpeciesSpriteSrc(name);

    speciesType1.innerText = sanitizeString(gameData.species[name]["type1"]);
    speciesType2.innerText = sanitizeString(gameData.species[name]["type2"]);
    speciesType1.className = `${gameData.species[name]["type1"]} background`;
    speciesType2.className = `${gameData.species[name]["type2"]} background`;

    if (speciesType1.innerText === speciesType2.innerText)
        speciesType2.classList.add("hide");
    else speciesType2.classList.remove("hide");

    if (typeof gameData.species[name]["type3"] !== "undefined") {
        if (
            gameData.species[name]["type3"] !==
                gameData.species[name]["type1"] &&
            gameData.species[name]["type3"] !== gameData.species[name]["type2"]
        ) {
            speciesType3.innerText = sanitizeString(
                gameData.species[name]["type3"]
            );
            speciesType3.className = `${gameData.species[name]["type3"]} background`;
            speciesType3.classList.remove("hide");
        }
    } else {
        speciesType3.classList.add("hide");
    }

    if (name in gameData.locationsByPokemon) {
        speciesPanelLocationsButton.classList.remove("hide");
    } else {
        speciesPanelLocationsButton.classList.add("hide");
    }

    clearChildren(speciesAbilities);

    for (let i = 0; i < gameData.species[name]["abilities"].length; i++) {
        const ability = gameData.species[name]["abilities"][i];
        if (i === 1 && ability === gameData.species[name]["abilities"][0]) {
            continue;
        } else if (
            i === 2 &&
            (ability === gameData.species[name]["abilities"][0] ||
                ability === "ABILITY_NONE") &&
            (ability === gameData.species[name]["abilities"][1] ||
                ability === "ABILITY_NONE")
        ) {
            continue;
        }
        if (ability !== "ABILITY_NONE" && gameData.abilities[ability]) {
            const abilityContainer = document.createElement("div");
            const abilityName = document.createElement("span");
            const abilityDescription = document.createElement("span");

            abilityName.innerText = gameData.abilities[ability]["ingameName"];
            abilityDescription.innerText =
                gameData.abilities[ability]["description"];

            if (i === 2) {
                abilityName.className = "bold";
            }

            abilityName.classList.add("hyperlink");

            abilityDescription.className =
                "speciesPanelAbilitiesDescriptionPadding";
            abilityContainer.className = "flex wrap";

            abilityName.addEventListener("click", async () => {
                if (!speciesButton.classList.contains("activeButton")) {
                    setTracker(trackers.species);
                    await tableButtonClick("species");
                }
                deleteFiltersFromTable();

                createFilter(
                    gameData.abilities[ability]["ingameName"],
                    "Ability"
                );
                speciesPanel("hide");
                window.scrollTo({ top: 0 });
            });

            abilityContainer.append(abilityName);
            abilityContainer.append(abilityDescription);
            speciesAbilities.append(abilityContainer);
        }
    }
    if (speciesAbilities.children.length > 0) {
        speciesAbilitiesMainContainer.classList.remove("hide");
    } else {
        speciesAbilitiesMainContainer.classList.add("hide");
    }



    let monStats = [
        gameData.species[name]["baseHP"],
        gameData.species[name]["baseAttack"],
        gameData.species[name]["baseDefense"],
        gameData.species[name]["baseSpAttack"],
        gameData.species[name]["baseSpDefense"],
        gameData.species[name]["baseSpeed"],
        gameData.species[name]["BST"],
    ];

    graphStats.forEach((stat, index) => {
        statDisplays[index].innerText = monStats[index];

        if (index !== 6) {
            stat.style.width = `${(monStats[index] / 255) * graph.offsetWidth}px`;
            stat.style.background = `hsl(${monStats[index] * 0.7},85%,45%)`;
        } else {
            stat.style.width = `${((monStats[index] / 255) * graph.offsetWidth) / 6}px`;
            stat.style.background = `hsl(${(monStats[index] * 1) / 6},85%,45%)`;
        }
    });

    clearChildren(speciesEvoTable);

    if (gameData.species[name]["evolutionLine"].length > 1) {
        let speciesArray = [gameData.species[name]["evolutionLine"][0]];
        let targetSpeciesArray = [];
        const rootContainer = document.createElement("td");
        rootContainer.append(
            createClickableImgAndName(
                gameData.species[name]["evolutionLine"][0],
                false,
                false,
                false
            )
        );
        speciesEvoTable.append(rootContainer);

        mainLoop: while (speciesArray.length > 0) {
            let speciesEvoTableContainer = document.createElement("td");

            for (let i = 0; i < speciesArray.length; i++) {
                const targetSpecies = speciesArray[i];
                for (
                    let j = 0;
                    j < gameData.species[targetSpecies]["evolution"].length;
                    j++
                ) {
                    if (
                        gameData.species[targetSpecies][
                            "evolutionLine"
                        ].indexOf(targetSpecies) >=
                        gameData.species[targetSpecies][
                            "evolutionLine"
                        ].indexOf(
                            gameData.species[targetSpecies]["evolution"][j][2]
                        )
                    ) {
                        // prevent infinite loop (dialga)
                        break mainLoop;
                    }
                    if (
                        gameData.species[
                            gameData.species[targetSpecies]["evolution"][j][2]
                        ]["baseSpeed"] > 0
                    ) {
                        speciesEvoTableContainer.append(
                            createClickableImgAndName(
                                gameData.species[targetSpecies]["evolution"][
                                    j
                                ][2],
                                gameData.species[targetSpecies]["evolution"][j],
                                false,
                                false
                            )
                        );
                        speciesEvoTable.append(speciesEvoTableContainer);

                        targetSpeciesArray.push(
                            gameData.species[targetSpecies]["evolution"][j][2]
                        );
                    }
                }
            }

            targetSpeciesArray = Array.from(new Set(targetSpeciesArray));

            speciesArray = targetSpeciesArray;
            targetSpeciesArray = [];
        }
    }
    if (speciesEvoTable.children.length <= 1) {
        speciesEvolutionsMainContainer.classList.add("hide");
    } else {
        speciesEvolutionsMainContainer.classList.remove("hide");
    }

    speciesEvoTable.removeAttribute("class");
    if (speciesEvoTable.children.length > 3) {
        speciesEvoTable.classList.add("evoLongLineLength");
    }

    clearChildren(speciesFormes);

    if (gameData.species[name]["forms"].length > 1) {
        for (let i = 0; i < gameData.species[name]["forms"].length; i++) {
            if (
                (!gameData.species[name]["evolutionLine"].includes(
                    gameData.species[name]["forms"][i]
                ) ||
                    gameData.species[name]["forms"][i] === name) &&
                gameData.species[gameData.species[name]["forms"][i]][
                    "baseSpeed"
                ] > 0
            ) {
                speciesFormes.append(
                    createClickableImgAndName(
                        gameData.species[name]["forms"][i]
                    )
                );
            }
        }
    }
    if (speciesFormes.children.length <= 1) {
        speciesFormesContainer.classList.add("hide");
    } else {
        speciesFormesContainer.classList.remove("hide");
    }

    clearChildren(speciesChanges);

    if (gameData.species[name]["changes"].length !== 0) {
        for (let i = 0; i < gameData.species[name]["changes"].length; i++) {
            const stat = gameData.species[name]["changes"][i][0];
            const oldStat = gameData.species[name]["changes"][i][1];
            const newStat = gameData.species[name][stat];
            createChange(stat, oldStat, newStat, speciesChanges);
        }
    }
    if (speciesChanges.firstChild)
        speciesChangesContainer.classList.remove("hide");
    else speciesChangesContainer.classList.add("hide");

    clearChildren(speciesDefensiveTypeChart);

    Object.keys(gameData.typeChart).forEach((type) => {
        const defensiveTypeEffectivenessContainer =
            document.createElement("span");
        const checkType = document.createElement("span");
        const defensiveTypeEffectivenessValue = document.createElement("span");
        defensiveTypeEffectivenessContainer.className =
            "flex flexCenter flexColumn speciesDefensiveTypeChartMarginTop";
        checkType.innerText = sanitizeString(type);
        if (checkType.innerText.length > 6) {
            checkType.innerText = checkType.innerText.substring(0, 6);
        }
        checkType.className = `backgroundSmall ${type}`;

        defensiveTypeEffectivenessValue.innerText =
            getPokemonResistanceValueAgainstType(gameData.species[name], type);

        defensiveTypeEffectivenessValue.className = `typeChartDefensive${defensiveTypeEffectivenessValue.innerText} backgroundSmall`;
        defensiveTypeEffectivenessContainer.append(checkType);
        defensiveTypeEffectivenessContainer.append(
            defensiveTypeEffectivenessValue
        );
        speciesDefensiveTypeChart.append(defensiveTypeEffectivenessContainer);
    });

    clearChildren(speciesOffensiveTypeChart);

    try {
        Object.keys(gameData.typeChart).forEach((type) => {
            const offensiveTypeEffectivenessContainer =
                document.createElement("span");
            const checkType = document.createElement("span");
            const offensiveTypeEffectivenessValue =
                document.createElement("span");
            offensiveTypeEffectivenessContainer.className =
                "flex flexCenter flexColumn speciesOffensiveTypeChartMarginTop";
            checkType.innerText = sanitizeString(type);
            if (checkType.innerText.length > 6) {
                checkType.innerText = checkType.innerText.substring(0, 6);
            }
            checkType.className = `backgroundSmall ${type}`;

            offensiveTypeEffectivenessValue.innerText =
                getPokemonEffectivenessValueAgainstType(
                    gameData.species[name],
                    type
                );

            offensiveTypeEffectivenessValue.className = `typeChartOffensive${offensiveTypeEffectivenessValue.innerText} backgroundSmall`;
            offensiveTypeEffectivenessContainer.append(checkType);
            offensiveTypeEffectivenessContainer.append(
                offensiveTypeEffectivenessValue
            );
            speciesOffensiveTypeChart.append(
                offensiveTypeEffectivenessContainer
            );
        });
    } catch {
        console.log(
            `Couldn't calc offensiveTypeEffectivenessValue for ${name}`
        );
    }

    if (gameData.strategies[name]) {
        speciesStrategiesContainer.classList.remove("hide");
        clearChildren(speciesStrategies);
        for (let i = 0; i < gameData.strategies[name].length; i++) {
            speciesStrategies.append(
                createSpeciesStrategy(gameData.strategies[name][i], name)
            );
        }
    } else {
        speciesStrategiesContainer.classList.add("hide");
    }

    // Tutor learnsets: WIP
    const tutorTbody = speciesPanelTutorTable.querySelector("tbody");
    clearChildren(tutorTbody);
    const wipRow = document.createElement("tr");
    const wipCell = document.createElement("td");
    wipCell.colSpan = 7;
    wipCell.style.textAlign = "center";
    wipCell.textContent = "WIP";
    wipRow.append(wipCell);
    tutorTbody.append(wipRow);
    speciesPanelTutorTable.classList.remove("hide");

    [
        [speciesPanelLevelUpTable, "levelUpLearnsets"],
        [speciesPanelTMHMTable, "TMHMLearnsets"],
        [speciesPanelEggMovesTable, "eggMovesLearnsets"],
    ].forEach((learnsets) => {
        try {
            if (typeof gameData.species[name][learnsets[1]][0] === "string") {
                buildSpeciesPanelSingleLearnsetsTable(learnsets[0], name, [
                    learnsets[1],
                ]);
            } else {
                buildSpeciesPanelDoubleLearnsetsTable(learnsets[0], name, [
                    learnsets[1],
                ]);
            }
        } catch {
            console.log(`Error building ${learnsets[1]} for ${name}`);
        }
    });
    buildSpeciesPanelLevelUpFromPreviousEvoTable(
        speciesPanelLevelUpFromPreviousEvoTable,
        name
    );
}

function createClickableImgAndName(
    speciesName,
    evoConditions = false,
    showName = true,
    miniSprite = true
) {
    const container = document.createElement("div");
    const sprite = document.createElement("img");
    const name = document.createElement("span");

    container.className = "flexCenter flex flexRow hyperlink";

    sprite.src = getSpeciesSpriteSrc(speciesName);
    sprite.className = `sprite${returnTargetSpeciesSprite(speciesName)}`;
    if (miniSprite) {
        sprite.classList.add("miniSprite");
    } else {
        sprite.classList.add("miniSprite3");
    }

    if (evoConditions) {
        const evoCondition = document.createElement("span");
        if (evoConditions[0].includes("EVO_MEGA")) {
            evoCondition.innerText = `Mega`;
        } else if (evoConditions[0].includes("EVO_GIGA")) {
            evoCondition.innerText = `Giga`;
        } else if (evoConditions[0].includes("MAPSEC")) {
            evoCondition.innerText = `Level Up (${sanitizeString(evoConditions[1]).replace(/Mapsec */i, "")})`;
        } else {
            evoCondition.innerText = `${sanitizeString(evoConditions[0])}`;
            if (evoConditions[1]) {
                evoCondition.innerText += ` (${sanitizeString(evoConditions[1])})`;
            }
        }
        evoCondition.className = "evoMethod";
        container.append(evoCondition);
    }
    if (showName) {
        name.innerText = sanitizeString(gameData.species[speciesName]["name"]);
        name.className = "underline";
    }

    container.append(sprite);
    container.append(name);

    container.addEventListener("click", async () => {
        await createSpeciesPanel(speciesName);
    });

    return container;
}

export function fetchShinySprite(clicked = false) {
    const targetSpecies = returnTargetSpeciesSprite(panelSpecies);
    if (clicked) {
        shinyToggle.classList.toggle("toggled");
    }
    if (!shinyToggle.classList.contains("toggled")) {
        speciesSprite.src = gameData.sprites[targetSpecies];
    } else {
        applyShinyVar(targetSpecies);
    }
}

function handleShiny() {
    if (shinyToggle.classList.contains("toggled")) {
        fetchShinySprite();
    }
}

async function applyShinyVar(speciesName) {
    let sprite = new Image();
    let canvas = document.createElement("canvas");

    sprite.src = gameData.sprites[speciesName];

    canvas.width = sprite.width;
    canvas.height = sprite.height;

    const normalColors = await fetchSpeciesPal(speciesName, "normal");

    const shinyColors = await fetchSpeciesPal(speciesName, "shiny");

    const context = canvas.getContext("2d");

    context.clearRect(0, 0, canvas.width, canvas.height);
    context.drawImage(sprite, 0, 0);

    const imageData = context.getImageData(0, 0, canvas.width, canvas.height);

    for (let i = 0; i < imageData.data.length; i += 4) {
        const r = imageData.data[i];
        const g = imageData.data[i + 1];
        const b = imageData.data[i + 2];

        for (let p = 0; p < normalColors.length; p++) {
            const [nr, ng, nb] = normalColors[p];

            if (isSameColor(r, g, b, nr, ng, nb, 1)) {
                const [sr, sg, sb] = shinyColors[p];

                imageData.data[i] = sr;
                imageData.data[i + 1] = sg;
                imageData.data[i + 2] = sb;

                break;
            }
        }
    }

    context.putImageData(imageData, 0, 0);
    speciesSprite.src = canvas.toDataURL();
}

async function fetchSpeciesPal(speciesName, type = "normal") {
    let rawPal = await fetch(
        `${gameData.species[speciesName]["sprite"].replace(/\w+\.png/, `${type}.pal`)}`
    );
    if (rawPal.status === 404) {
        if (gameData.species[speciesName]["forms"].length > 1) {
            rawPal = await fetch(
                `${gameData.species[gameData.species[speciesName]["forms"][0]]["sprite"].replace(/\w+\.png/, `${type}.pal`)}`
            );
        }
    }
    if (!rawPal.ok) {
        return [];
    }
    const textPal = await rawPal.text();

    let pal = textPal
        .replaceAll("\r", "")
        .split("\n")
        .toSpliced(0, 3)
        .map((line) => {
            const [r, g, b] = line.split(" ").map(Number);
            if (isNaN(r) || isNaN(g) || isNaN(b)) {
                return [256, 256, 256];
            }
            return [r, g, b];
        });

    for (let i = pal.length - 1; i >= 0; i--) {
        if (pal[i][0] > 255) {
            pal.splice(i, 1);
        }
    }

    return pal;
}

export function createPopupForLocations() {
    clearChildren(popup);

    const pokemonName = document.createElement("div");
    pokemonName.classList.add("bold");
    pokemonName.innerText = sanitizeString(panelSpecies);
    pokemonName.style.minWidth = "200px";
    pokemonName.style.fontSize = "35px";
    popup.append(pokemonName);

    Object.keys(gameData.locationsByPokemon[panelSpecies]).forEach(
        (location) => {
            const locationName = document.createElement("div");
            locationName.classList.add("bold");
            locationName.innerText = location;
            locationName.style.padding = "25px 0px 10px 0px";
            locationName.style.fontSize = "25px";
            popup.append(locationName);
            gameData.locationsByPokemon[panelSpecies][location].forEach(
                (method) => {
                    const locationContainer = document.createElement("div");
                    locationContainer.style.fontSize = "20px";
                    const locationMethod = document.createElement("span");
                    locationMethod.innerText = `${method} `;
                    const locationRarity = document.createElement("span");
                    locationRarity.innerText = `${gameData.locations[location][method][panelSpecies]}%`;
                    locationRarity.style.color = `hsl(${gameData.locations[location][method][panelSpecies] * 2},85%,45%)`;
                    locationContainer.append(locationMethod);
                    locationContainer.append(locationRarity);
                    popup.append(locationContainer);
                }
            );
        }
    );
}

export function createPopupForInfo() {
    clearChildren(popup);

    const pokemonName = document.createElement("div");
    pokemonName.classList.add("bold");
    pokemonName.innerText = sanitizeString(panelSpecies);
    pokemonName.style.minWidth = "200px";
    pokemonName.style.fontSize = "35px";
    popup.append(pokemonName);

    const eggGroupHeader = document.createElement("div");
    eggGroupHeader.innerText = "Egg Groups:";
    eggGroupHeader.classList.add("bold");
    eggGroupHeader.style.padding = "20px 0px 0px 0px";
    eggGroupHeader.style.fontSize = "20px";
    eggGroupHeader.style.color = "var(--theme-color)";
    popup.append(eggGroupHeader);
    const eggGroup1 = document.createElement("div");
    eggGroup1.innerText = sanitizeString(
        gameData.species[panelSpecies]["eggGroup1"]
    );
    popup.append(eggGroup1);
    if (
        gameData.species[panelSpecies]["eggGroup1"] !==
        gameData.species[panelSpecies]["eggGroup2"]
    ) {
        const eggGroup2 = document.createElement("div");
        eggGroup2.innerText = sanitizeString(
            gameData.species[panelSpecies]["eggGroup2"]
        );
        popup.append(eggGroup2);
    }

    if (
        (gameData.species[panelSpecies]["item1"] &&
            gameData.species[panelSpecies]["item1"] !== "ITEM_NONE") ||
        (gameData.species[panelSpecies]["item2"] &&
            gameData.species[panelSpecies]["item2"] !== "ITEM_NONE")
    ) {
        const heldItemHeader = document.createElement("div");
        heldItemHeader.innerText = "Held Items:";
        heldItemHeader.classList.add("bold");
        heldItemHeader.style.padding = "20px 0px 0px 0px";
        heldItemHeader.style.fontSize = "20px";
        heldItemHeader.style.color = "var(--theme-color)";
        popup.append(heldItemHeader);

        if (
            gameData.species[panelSpecies]["item1"] &&
            gameData.species[panelSpecies]["item1"] !== "ITEM_NONE"
        ) {
            const heldItem1 = document.createElement("div");
            heldItem1.innerText = `50% ${sanitizeString(gameData.species[panelSpecies]["item1"])}`;
            popup.append(heldItem1);
        }
        if (
            gameData.species[panelSpecies]["item2"] &&
            gameData.species[panelSpecies]["item2"] !== "ITEM_NONE"
        ) {
            const heldItem2 = document.createElement("div");
            heldItem2.innerText = `5% ${sanitizeString(gameData.species[panelSpecies]["item2"])}`;
            popup.append(heldItem2);
        }
    }
}

export async function speciesPanel(param) {
    if (typeof speciesPanelMainContainer !== "undefined") {
        if (
            param === "hide" ||
            gameData.species[panelSpecies]["baseSpeed"] <= 0
        ) {
            body.classList.remove("fixedPanel");
            overlaySpeciesPanel.style.display = "none";
            speciesPanelMainContainer.classList.add("hide");
            refreshURLParams();
            if (table.getBoundingClientRect().top < 0) {
                utilityButton.innerText = "\u2191";
            } else {
                utilityButton.innerText = "\u2630";
            }
        } else if (param === "show") {
            utilityButton.innerText = "X";
            body.classList.add("fixedPanel");
            overlaySpeciesPanel.style.display = "block";
            speciesPanelMainContainer.classList.remove("hide");
        } else {
            speciesPanelMainContainer.classList.toggle("hide");
            if (speciesPanelMainContainer.classList.contains("hide")) {
                overlaySpeciesPanel.style.display = "none";
                body.classList.remove("fixedPanel");
                refreshURLParams();
                if (table.getBoundingClientRect().top < 0) {
                    utilityButton.innerText = "\u2191";
                } else {
                    utilityButton.innerText = "\u2630";
                }
            } else {
                utilityButton.innerText = "X";
                overlaySpeciesPanel.style.display = "block";
                body.classList.add("fixedPanel");
            }
        }
    }
}
