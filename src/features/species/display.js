import { speciesCanLearnMove } from "../../core/speciesRules.js";
import { sanitizeString } from "../../core/strings.js";
import { getSpeciesSpriteSrc, returnTargetSpeciesSprite } from "./spriteSrc.js";

import {
    speciesTableTbody,
    changelogMode,
    panelSpecies,
} from "../../core/domRefs.js";
import { createSpeciesPanel } from "../species-panel/panel.js";
import { speciesPanel } from "../species-panel/visibility.js";
import { gameData, uiState } from "../../core/state.js";
import { getMoveMethodLabel } from "../../core/dom.js";

export function appendSpeciesToTable(speciesName) {
    if (gameData.species[speciesName].baseSpeed <= 0) {
        return false;
    }
    let moveMethod;

    const tBody = speciesTableTbody;

    const row = document.createElement("tr");
    row.setAttribute("id", `${speciesName}`);
    tBody.append(row);

    const IDcontainer = document.createElement("td");
    const ID = document.createElement("div");
    IDcontainer.className = "ID";
    if (uiState.speciesMoveFilter) {
        moveMethod = speciesCanLearnMove(
            gameData.species[speciesName],
            uiState.speciesMoveFilter
        );
        const moveFilter = document.createElement("div");
        moveFilter.className = "bold";
        const label = getMoveMethodLabel(moveMethod);
        if (label) {
            moveFilter.innerText = label.text;
            moveFilter.classList.add(label.className);
        }
        IDcontainer.append(moveFilter);
    } else {
        ID.innerText = gameData.species[speciesName].ID;
    }
    IDcontainer.append(ID);
    row.append(IDcontainer);

    const spriteContainer = document.createElement("td");
    spriteContainer.className = "sprite";
    const sprite = document.createElement("img");
    sprite.setAttribute("width", 64);
    sprite.setAttribute("height", 64);
    sprite.className = `sprite${returnTargetSpeciesSprite(speciesName)}`;
    sprite.src = getSpeciesSpriteSrc(speciesName);
    spriteContainer.append(sprite);
    row.append(spriteContainer);

    const nameContainer = document.createElement("td");
    const name = document.createElement("div");
    const ingameName = document.createElement("div");
    nameContainer.className = "nameContainer";
    name.className = "key hide";
    name.innerText = gameData.species[speciesName].name;
    ingameName.className = "species";
    ingameName.innerText = sanitizeString(gameData.species[speciesName].name);
    nameContainer.append(ingameName);
    nameContainer.append(name);
    row.append(nameContainer);

    const typesContainer = document.createElement("td");
    const types = document.createElement("div");
    const type1 = document.createElement("div");
    const type2 = document.createElement("div");
    const type3 = document.createElement("div");
    typesContainer.className = "types";
    type1.innerText = `${sanitizeString(gameData.species[speciesName].type1)} `;
    type2.innerText = `${sanitizeString(gameData.species[speciesName].type2)} `;
    type1.className = `${gameData.species[speciesName].type1} background`;
    type2.className = `${gameData.species[speciesName].type2} background`;

    for (let k = 0; k < gameData.species[speciesName].changes.length; k++) {
        if (gameData.species[speciesName].changes[k][0] === "type1") {
            if (
                gameData.species[speciesName].type1 !==
                    gameData.species[speciesName].changes[k][1] &&
                changelogMode.classList.contains("activeSetting")
            ) {
                type1.classList.add("typeChanged");
            }
        } else if (gameData.species[speciesName].changes[k][0] === "type2") {
            if (
                gameData.species[speciesName].type2 !==
                    gameData.species[speciesName].changes[k][1] &&
                changelogMode.classList.contains("activeSetting")
            ) {
                type2.classList.add("typeChanged");
            }
        }
    }

    types.append(type1);
    if (
        gameData.species[speciesName].type1 !==
        gameData.species[speciesName].type2
    ) {
        types.append(type2);
    }
    if (typeof gameData.species[speciesName].type3 !== "undefined") {
        if (
            gameData.species[speciesName].type3 !==
                gameData.species[speciesName].type1 &&
            gameData.species[speciesName].type3 !==
                gameData.species[speciesName].type2
        ) {
            type3.innerText = `${sanitizeString(gameData.species[speciesName].type3)} `;
            type3.className = `${gameData.species[speciesName].type3} background`;
            types.append(type3);
        }
    }
    typesContainer.append(types);
    row.append(typesContainer);

    const abilitiesContainer = document.createElement("td");
    abilitiesContainer.className = "abilities";
    for (let j = 0; j < gameData.species[speciesName].abilities.length; j++) {
        const ability = document.createElement("div");
        const abilityName = gameData.species[speciesName].abilities[j];
        if (
            j === 1 &&
            abilityName === gameData.species[speciesName].abilities[0]
        ) {
            continue;
        } else if (
            j === 2 &&
            (abilityName === gameData.species[speciesName].abilities[0] ||
                abilityName === "ABILITY_NONE") &&
            (abilityName === gameData.species[speciesName].abilities[1] ||
                abilityName === "ABILITY_NONE")
        ) {
            continue;
        }
        if (abilityName !== "ABILITY_NONE" && gameData.abilities[abilityName]) {
            ability.innerText = `${gameData.abilities[abilityName].ingameName} `;
            if (j === 2) {
                ability.style.fontWeight = "bold";
            }

            for (
                let k = 0;
                k < gameData.species[speciesName].changes.length;
                k++
            ) {
                if (
                    gameData.species[speciesName].changes[k][0] === "abilities"
                ) {
                    if (
                        gameData.species[speciesName].abilities[j] !==
                            gameData.species[speciesName].changes[k][1][j] &&
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

    row.classList.add("noInnates");

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
    const baseStatsContainer = document.createElement("td");
    const baseStats = document.createElement("div");
    const baseStatsHeader = document.createElement("div");
    baseStatsHeader.className = "italic";

    baseStatsHeader.innerText = headerText;

    baseStats.className = `baseStatsBold ${stats}`;

    baseStats.innerText = speciesObj[stats];

    for (let k = 0; k < speciesObj.changes.length; k++) {
        if (
            speciesObj.changes[k][0] === stats &&
            changelogMode.classList.contains("activeSetting")
        ) {
            if (speciesObj[stats] > speciesObj.changes[k][1]) {
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
