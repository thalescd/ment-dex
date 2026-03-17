import { sanitizeString, getSpeciesSpriteSrc, returnTargetSpeciesSprite, speciesCanLearnMove } from '../../utils/utility.js';

import { speciesTableTbody, changelogMode, panelSpecies } from '../../utils/domRefs.js';
import { createSpeciesPanel, speciesPanel } from '../../utils/speciesPanelUtility.js';
import { sortTableByLearnsets } from '../../utils/tableUtility.js';
import { gameData, uiState } from '../../utils/state.js';
import { getMoveMethodLabel } from '../../utils/domUtils.js';

uiState.speciesMoveFilter = null;

export function updateSpeciesMoveFilter(sortTable = false) {
    uiState.speciesMoveFilter = null;
    const moveFiltersContainer = window.speciesFilterContainer.getElementsByClassName(
        "speciesFilterMoveContainer"
    )[0];
    if (moveFiltersContainer) {
        const filters = moveFiltersContainer.getElementsByClassName("filter");
        if (filters.length === 1) {
            if (filters[0].parentNode.children[0].value !== "NOT") {
                uiState.speciesMoveFilter = filters[0].innerText
                    .replace(" ", "")
                    .split(":")[1];
                Object.keys(gameData.moves).forEach((moveName) => {
                    if (gameData.moves[moveName]["ingameName"] === uiState.speciesMoveFilter) {
                        uiState.speciesMoveFilter = moveName;
                        if (sortTable) {
                            sortTableByLearnsets(true);
                        }
                    }
                });
            }
        }
    }
}

export function appendSpeciesToTable(speciesName) {
    if (gameData.species[speciesName]["baseSpeed"] <= 0) {
        return false;
    }
    let moveMethod = null;

    const tBody = speciesTableTbody;

    const row = document.createElement("tr");
    row.setAttribute("id", `${speciesName}`);
    tBody.append(row);

    let IDcontainer = document.createElement("td");
    let ID = document.createElement("div");
    IDcontainer.className = "ID";
    if (uiState.speciesMoveFilter) {
        moveMethod = speciesCanLearnMove(
            gameData.species[speciesName],
            uiState.speciesMoveFilter
        );
        let moveFilter = document.createElement("div");
        moveFilter.className = "bold";
        const label = getMoveMethodLabel(moveMethod);
        if (label) {
            moveFilter.innerText = label.text;
            moveFilter.classList.add(label.className);
        }
        IDcontainer.append(moveFilter);
    } else {
        ID.innerText = gameData.species[speciesName]["ID"];
    }
    IDcontainer.append(ID);
    row.append(IDcontainer);

    let spriteContainer = document.createElement("td");
    spriteContainer.className = "sprite";
    let sprite = document.createElement("img");
    sprite.setAttribute("width", 64);
    sprite.setAttribute("height", 64);
    sprite.className = `sprite${returnTargetSpeciesSprite(speciesName)}`;
    sprite.src = getSpeciesSpriteSrc(speciesName);
    spriteContainer.append(sprite);
    row.append(spriteContainer);

    let nameContainer = document.createElement("td");
    let name = document.createElement("div");
    let ingameName = document.createElement("div");
    nameContainer.className = "nameContainer";
    name.className = "key hide";
    name.innerText = gameData.species[speciesName]["name"];
    ingameName.className = "species";
    ingameName.innerText = sanitizeString(gameData.species[speciesName]["name"]);
    nameContainer.append(ingameName);
    nameContainer.append(name);
    row.append(nameContainer);

    let typesContainer = document.createElement("td");
    let types = document.createElement("div");
    let type1 = document.createElement("div");
    let type2 = document.createElement("div");
    let type3 = document.createElement("div");
    typesContainer.className = "types";
    type1.innerText = `${sanitizeString(gameData.species[speciesName]["type1"])} `;
    type2.innerText = `${sanitizeString(gameData.species[speciesName]["type2"])} `;
    type1.className = `${gameData.species[speciesName]["type1"]} background`;
    type2.className = `${gameData.species[speciesName]["type2"]} background`;

    for (let k = 0; k < gameData.species[speciesName]["changes"].length; k++) {
        if (gameData.species[speciesName]["changes"][k][0] === "type1") {
            if (
                gameData.species[speciesName]["type1"] !==
                    gameData.species[speciesName]["changes"][k][1] &&
                changelogMode.classList.contains("activeSetting")
            ) {
                type1.classList.add("typeChanged");
            }
        } else if (gameData.species[speciesName]["changes"][k][0] === "type2") {
            if (
                gameData.species[speciesName]["type2"] !==
                    gameData.species[speciesName]["changes"][k][1] &&
                changelogMode.classList.contains("activeSetting")
            ) {
                type2.classList.add("typeChanged");
            }
        }
    }

    types.append(type1);
    if (gameData.species[speciesName]["type1"] !== gameData.species[speciesName]["type2"]) {
        types.append(type2);
    }
    if (typeof gameData.species[speciesName]["type3"] !== "undefined") {
        if (
            gameData.species[speciesName]["type3"] !== gameData.species[speciesName]["type1"] &&
            gameData.species[speciesName]["type3"] !== gameData.species[speciesName]["type2"]
        ) {
            type3.innerText = `${sanitizeString(gameData.species[speciesName]["type3"])} `;
            type3.className = `${gameData.species[speciesName]["type3"]} background`;
            types.append(type3);
        }
    }
    typesContainer.append(types);
    row.append(typesContainer);

    let abilitiesContainer = document.createElement("td");
    abilitiesContainer.className = "abilities";
    for (let j = 0; j < gameData.species[speciesName]["abilities"].length; j++) {
        let ability = document.createElement("div");
        let abilityName = gameData.species[speciesName]["abilities"][j];
        if (j === 1 && abilityName === gameData.species[speciesName]["abilities"][0]) {
            continue;
        } else if (
            j === 2 &&
            (abilityName === gameData.species[speciesName]["abilities"][0] ||
                abilityName === "ABILITY_NONE") &&
            (abilityName === gameData.species[speciesName]["abilities"][1] ||
                abilityName === "ABILITY_NONE")
        ) {
            continue;
        }
        if (abilityName !== "ABILITY_NONE" && gameData.abilities[abilityName]) {
            ability.innerText = `${gameData.abilities[abilityName]["ingameName"]} `;
            if (j === 2) {
                ability.style.fontWeight = "bold";
            }

            for (let k = 0; k < gameData.species[speciesName]["changes"].length; k++) {
                if (gameData.species[speciesName]["changes"][k][0] === "abilities") {
                    if (
                        gameData.species[speciesName]["abilities"][j] !==
                            gameData.species[speciesName]["changes"][k][1][j] &&
                        changelogMode.classList.contains("activeSetting")
                    ) {
                        const changelogAbilities =
                            document.createElement("span");
                        changelogAbilities.className = "changelogAbilities";
                        changelogAbilities.innerText = "new";
                        ability.append(changelogAbilities);
                    }
                }
            }

            abilitiesContainer.append(ability);
        }
    }
    row.append(abilitiesContainer);

    if (typeof window.innatesDefined !== "undefined") {
        let innatesContainer = document.createElement("td");
        innatesContainer.className = "innates";
        for (let j = 0; j < gameData.species[speciesName]["innates"].length; j++) {
            let innates = document.createElement("div");
            let innatesName = gameData.species[speciesName]["innates"][j];

            if (innatesName !== "ABILITY_NONE") {
                innates.innerText = `${sanitizeString(innatesName)} `;

                innatesContainer.append(innates);
            }
        }
        row.append(innatesContainer);
    } else {
        row.classList.add("noInnates");
    }

    [
        ["HP", "baseHP"],
        ["Atk", "baseAttack"],
        ["Def", "baseDefense"],
        ["SpA", "baseSpAttack"],
        ["SpD", "baseSpDefense"],
        ["Spe", "baseSpeed"],
        ["BST", "BST"],
    ].forEach((statInfo) => {
        row.append(
            createBaseStatsContainer(
                statInfo[0],
                statInfo[1],
                gameData.species[speciesName]
            )
        );
    });

    row.addEventListener("click", async () => {
        if (panelSpecies === speciesName) {
            speciesPanel("show");
        } else {
            await createSpeciesPanel(speciesName);
            document
                .getElementById("speciesPanelMainContainer")
                .scrollIntoView(true);
        }
    });

    return true;
}

function createBaseStatsContainer(headerText, stats, speciesObj) {
    let baseStatsContainer = document.createElement("td");
    let baseStats = document.createElement("div");
    let baseStatsHeader = document.createElement("div");
    baseStatsHeader.className = "italic";

    baseStatsHeader.innerText = headerText;

    baseStats.className = `baseStatsBold ${stats}`;

    baseStats.innerText = speciesObj[stats];

    for (let k = 0; k < speciesObj["changes"].length; k++) {
        if (
            speciesObj["changes"][k][0] === stats &&
            changelogMode.classList.contains("activeSetting")
        ) {
            if (speciesObj[stats] > speciesObj["changes"][k][1]) {
                baseStats.classList.add("buff", "bold");
                baseStatsHeader.classList.add("buff", "bold");
            } else {
                baseStats.classList.add("nerf", "bold");
                baseStatsHeader.classList.add("nerf", "bold");
            }
        }
    }

    baseStatsContainer.append(baseStatsHeader);
    baseStatsContainer.append(baseStats);
    baseStatsContainer.className = `${stats}Container`;

    return baseStatsContainer;
}

// spriteRemoveBgReturnBase64, isSameColor, decodeSpriteDataString moved to ../../utils/spriteUtils.js

