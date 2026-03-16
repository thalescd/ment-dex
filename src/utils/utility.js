import { checkUpdate } from './config.js';
import { LZString } from './lz-string.js';
import {
    speciesPanelMainContainer,
    speciesPanelInputSpeciesDataList,
    abilitiesInputDataList,
    panelSpecies,
    historyObj,
} from './domRefs.js';

export function sanitizeString(string, removeSpecial = true) {
    const regex =
        /^SPECIES_|^TYPE_|^ABILITY_|^MOVE_TARGET_|^MOVE_|^SPLIT_|FLAG_|^EFFECT_|^Z_EFFECT_|^ITEM_|^EGG_GROUP_|^EVO_|^NATURE_|^POCKET_/gi;

    let unsanitizedString = string
        .toString()
        .replace(regex, "")
        .replaceAll(/_+/g, "_")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");
    let matchArray = unsanitizedString;
    if (removeSpecial) {
        matchArray = unsanitizedString.match(/\w+/g);
    } else {
        matchArray = unsanitizedString.match(/\S+/g);
    }
    if (matchArray) {
        for (let i = 0; i < matchArray.length; i++) {
            matchArray[i] = matchArray[i].split("_");
            for (let j = 0; j < matchArray[i].length; j++) {
                matchArray[i][j] =
                    matchArray[i][j][0].toUpperCase() +
                    matchArray[i][j].slice(1).toLowerCase();
            }
            matchArray[i] = matchArray[i].join(" ");
        }
        return matchArray.join(" ");
    } else return unsanitizedString;
}

// fetchData, fetchTypeChart, getLocationsByPokemon, displayParams,
// displayHistoryObj, exportData foram movidos para app.js

export async function forceUpdate() {
    if (localStorage.getItem("update") != `${checkUpdate}`) {
        await clearLocalStorage();
        await localStorage.setItem("update", `${checkUpdate}`);
        await footerP("Fetching data please wait... this is only run once");
    }
}

export async function clearLocalStorage() {
    Object.keys(localStorage).forEach((key) => {
        if (
            key != "speciesPanelHistory" &&
            key != "itemsLocations" &&
            !/settings/i.test(key)
        ) {
            localStorage.removeItem(key);
        }
    });
}

export function footerP(input) {
    if (input === "")
        document
            .querySelectorAll("#footer > p")
            .forEach((paragraph) => paragraph.remove());

    const paragraph = document.createElement("p");
    const footer = document.getElementById("footer");
    paragraph.innerText = input;
    footer.append(paragraph);
}

export function copyToClipboard(text) {
    var dummy = document.createElement("textarea");
    document.body.appendChild(dummy);
    dummy.value = text;
    dummy.select();
    document.execCommand("copy");
    document.body.removeChild(dummy);
}

export function getTextWidth(text) {
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");

    context.font = getComputedStyle(document.body).font;

    return context.measureText(text).width;
}

export async function setDataList() {
    window.speciesIngameNameArray = [];
    for (const name in window.species) {
        if (window.species[name]["baseSpeed"] <= 0) {
            continue;
        }
        const option = document.createElement("option");
        option.innerText = sanitizeString(name);
        window.speciesIngameNameArray.push(sanitizeString(name));
        speciesPanelInputSpeciesDataList.append(option);
    }

    window.abilitiesIngameNameArray = [];
    for (const abilityName in window.abilities) {
        if (
            !window.abilities[abilityName]["description"] ||
            !/[1-9aA-zZ]/.test(window.abilities[abilityName]["ingameName"])
        ) {
            continue;
        }
        const option = document.createElement("option");
        option.innerText = window.abilities[abilityName]["ingameName"];
        window.abilitiesIngameNameArray.push(window.abilities[abilityName]["ingameName"]);
        abilitiesInputDataList.append(option);
    }
}

export function getSpeciesSpriteSrc(speciesName) {
    speciesName = returnTargetSpeciesSprite(speciesName);

    if (localStorage.getItem(speciesName)) {
        if (speciesName in window.sprites) {
            if (window.sprites[speciesName].length < 500) {
                localStorage.removeItem(speciesName);
                window.spriteRemoveBgReturnBase64(speciesName, window.species);
                return window.species[speciesName]["sprite"];
            } else {
                return window.sprites[speciesName];
            }
        } else {
            window.sprites[speciesName] = window.decodeSpriteDataString(
                LZString.decompressFromUTF16(localStorage.getItem(speciesName))
            );
            return window.sprites[speciesName];
        }
    } else {
        window.spriteRemoveBgReturnBase64(speciesName, window.species);
        return window.species[speciesName]["sprite"];
    }
}

export function returnTargetSpeciesSprite(speciesName) {
    if (
        window.species[speciesName]["forms"].length > 1 &&
        window.species[speciesName]["sprite"] ==
            window.species[window.species[speciesName]["forms"][0]]["sprite"]
    ) {
        return window.species[speciesName]["forms"][0];
    }
    return speciesName;
}

export async function refreshURLParams() {
    const url = document.location.href.split("?")[0] + "?";
    let params = "";

    if (!speciesPanelMainContainer.classList.contains("hide")) {
        params += `species=${panelSpecies}&`;
    } else if (document.getElementsByClassName("activeTable").length > 0) {
        const activeTable =
            document.getElementsByClassName("activeTable")[0].id;
        if (activeTable != "speciesTable") {
            params += `table=${document.getElementsByClassName("activeTable")[0].id}&`;
        }
        if (
            document
                .getElementsByClassName("activeFilter")[0]
                .getElementsByClassName("filter").length > 0
        ) {
            params += "filter=";
            const filters = document
                .getElementsByClassName("activeFilter")[0]
                .getElementsByClassName("filter");
            for (let i = 0, j = filters.length; i < j; i++) {
                if (!/>|<|=/.test(filters[i].innerText)) {
                    let param = filters[i].innerText.split(":");
                    params += `${param[0]}:${param[1].trim()}:`;
                    params += filters[i].parentNode.children[0].value;
                    if (i !== j - 1) {
                        params += ",";
                    }
                }
            }
            params += "&";
        }
        if (document.getElementsByClassName("activeInput")[0].value !== "") {
            params += `input=${document.getElementsByClassName("activeInput")[0].value}&`;
        }
    }

    await getHistoryState();
    window.history.replaceState(`${url}${params}`, null, `${url}${params}`);
    return (`${url}${params}`, null, `${url}${params}`);
}

export async function getHistoryState() {
    let historyStateObj = {};
    if (!speciesPanelMainContainer.classList.contains("hide")) {
        historyStateObj["species"] = panelSpecies;
    }
    if (document.getElementsByClassName("activeTable").length > 0) {
        historyStateObj["table"] =
            document.getElementsByClassName("activeTable")[0].id;
    }
    if (document.getElementsByClassName("filter").length > 0) {
        historyStateObj["filter"] = {};
        const filters = document.getElementsByClassName("filter");
        for (let i = 0, j = filters.length; i < j; i++) {
            const table = filters[i].parentElement.id.replace(
                "FilterContainer",
                ""
            );
            if (!(table in historyStateObj["filter"])) {
                historyStateObj["filter"][table] = [];
            }
            historyStateObj["filter"][table].push(filters[i].innerText);
        }
    }

    if (
        JSON.stringify(historyObj.slice(-1)[0]) !==
        JSON.stringify(historyStateObj)
    ) {
        historyObj.push(historyStateObj);
    }
}

export function speciesCanLearnMove(speciesObj, moveName) {
    const index = [
        "levelUpLearnsets",
        "eggMovesLearnsets",
        "TMHMLearnsets",
        "tutorLearnsets",
    ];
    for (let i = 0; i < index.length; i++) {
        if (index[i] in speciesObj) {
            for (let j = 0; j < speciesObj[index[i]].length; j++) {
                if (typeof speciesObj[index[i]][j] == "object") {
                    if (speciesObj[index[i]][j][0] == moveName) {
                        if (index[i] === "levelUpLearnsets") {
                            return speciesObj[index[i]][j][1];
                        }
                        return index[i];
                    }
                } else if (typeof (speciesObj[index[i]][j] == "string")) {
                    if (speciesObj[index[i]][j] == moveName) {
                        return index[i];
                    }
                }
            }
        }
    }

    return false;
}

export function getPokemonResistanceValueAgainstType(speciesObj, type) {
    if (speciesObj["type1"] !== speciesObj["type2"]) {
        if (typeof speciesObj["type3"] !== "undefined") {
            if (
                speciesObj["type3"] !== speciesObj["type1"] &&
                speciesObj["type3"] !== speciesObj["type2"]
            ) {
                return (
                    window.typeChart[type][speciesObj["type1"]] *
                    window.typeChart[type][speciesObj["type2"]] *
                    window.typeChart[type][speciesObj["type3"]]
                );
            }
        } else {
            return (
                window.typeChart[type][speciesObj["type1"]] *
                window.typeChart[type][speciesObj["type2"]]
            );
        }
    } else {
        if (typeof speciesObj["type3"] !== "undefined") {
            if (
                speciesObj["type3"] !== speciesObj["type1"] &&
                speciesObj["type3"] !== speciesObj["type2"]
            ) {
                return (
                    window.typeChart[type][speciesObj["type1"]] *
                    window.typeChart[type][speciesObj["type3"]]
                );
            }
        } else {
            return window.typeChart[type][speciesObj["type1"]];
        }
    }
}

export function getPokemonEffectivenessValueAgainstType(speciesObj, type) {
    let offensiveValue = window.typeChart[speciesObj["type1"]][type];
    if (
        window.typeChart[speciesObj["type2"]][type] >
        window.typeChart[speciesObj["type1"]][type]
    ) {
        offensiveValue = window.typeChart[speciesObj["type2"]][type];
    }
    if (typeof speciesObj["type3"] !== "undefined") {
        if (
            window.typeChart[speciesObj["type3"]][type] >
                window.typeChart[speciesObj["type1"]][type] &&
            window.typeChart[speciesObj["type3"]][type] >
                window.typeChart[speciesObj["type2"]][type]
        ) {
            offensiveValue = window.typeChart[speciesObj["type3"]][type];
        }
    }

    return offensiveValue;
}

