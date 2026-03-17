import { sanitizeString } from './utility.js';
import { gameData } from './state.js';

function replaceStatString(stat) {
    const replaceStringObject = {
        type1: "Type 1",
        type2: "Type 2",
        eggGroup1: "Egg Group 1",
        eggGroup2: "Egg Group 2",
        abilities: "Ability",
        abilities0: "Ability 1",
        abilities1: "Ability 2",
        abilities2: "HA",
        baseHP: "HP",
        baseAttack: "Atk",
        baseDefense: "Def",
        baseSpAttack: "SpA",
        baseSpDefense: "SpD",
        baseSpeed: "Spe",
    };
    if (stat in replaceStringObject) {
        return replaceStringObject[stat];
    } else {
        return stat;
    }
}

function appendChangesToObj(
    changeMainContainer,
    statContainer,
    changeContainer,
    oldStatContainer,
    newStatContainer,
    obj
) {
    changeMainContainer.className = "flex flexAlign";
    changeContainer.classList.add("textAlign");
    changeContainer.classList.add("changeTextAlignFlex");
    statContainer.classList.add("speciesPanelStatPadding");
    statContainer.classList.add("bold");
    oldStatContainer.classList.add("reduceOpacity");
    newStatContainer.classList.add("bold");

    const changeContainerTransition = document.createElement("span");
    changeContainerTransition.innerText = " ➝ ";

    changeContainer.append(
        oldStatContainer,
        changeContainerTransition,
        newStatContainer
    );

    changeMainContainer.append(statContainer, changeContainer);
    obj.append(changeMainContainer);
}

export function createChange(stat, oldStat = [""], newStat = [""], obj) {
    if (typeof newStat === "object") {
        for (let i = 0; i < newStat.length; i++) {
            const changeMainContainer = document.createElement("div");
            const changeContainer = document.createElement("span");
            const statContainer = document.createElement("span");

            const oldStatContainer = document.createElement("span");
            const newStatContainer = document.createElement("span");

            statContainer.innerText = replaceStatString(`${stat}${i}`);

            if (newStat[i] !== oldStat[i]) {
                if (oldStat[i] in gameData.abilities) {
                    oldStatContainer.innerText =
                        gameData.abilities[oldStat[i]]["ingameName"];
                } else {
                    oldStatContainer.innerText = `${sanitizeString(oldStat[i])}`;
                }
                if (newStat[i] in gameData.abilities) {
                    newStatContainer.innerText =
                        gameData.abilities[newStat[i]]["ingameName"];
                } else {
                    newStatContainer.innerText = `${sanitizeString(newStat[i])}`;
                }
                appendChangesToObj(
                    changeMainContainer,
                    statContainer,
                    changeContainer,
                    oldStatContainer,
                    newStatContainer,
                    obj
                );
            }
        }
    } else if (newStat !== oldStat) {
        const changeMainContainer = document.createElement("div");
        const changeContainer = document.createElement("span");
        const statContainer = document.createElement("span");

        const oldStatContainer = document.createElement("span");
        const newStatContainer = document.createElement("span");

        statContainer.innerText = replaceStatString(stat);

        oldStatContainer.innerText = `${sanitizeString(oldStat)}`;
        newStatContainer.innerText = `${sanitizeString(newStat)}`;
        if (!isNaN(newStat)) {
            if (newStat > oldStat) {
                changeContainer.classList.add("buff");
            } else {
                changeContainer.classList.add("nerf");
            }
        } else if (stat === "type1" || stat === "type2") {
            oldStatContainer.className = `${oldStat} background`;
            newStatContainer.className = `${newStat} background`;
        }
        appendChangesToObj(
            changeMainContainer,
            statContainer,
            changeContainer,
            oldStatContainer,
            newStatContainer,
            obj
        );
    }
}
