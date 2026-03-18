import { repos } from '../../utils/config.js';
import { LZString } from '../../utils/lz-string.js';
import { footerP } from '../../utils/utility.js';
import { gameData, trackers } from '../../utils/state.js';
import {
    regexAbilities,
    regexVanillaAbilitiesDescription,
    regexAbilitiesIngameName,
    regexAbilitiesDescription,
    regexNewAbilities
} from './regexAbilities.js';

async function getAbilities(abilities) {
    footerP("Fetching abilities");
    const rawAbilities = await fetch(
        `${repos.cfru}/include/constants/abilities.h`
    );
    const textAbilities = await rawAbilities.text();

    return regexAbilities(textAbilities, abilities);
}

async function getVanillaAbilitiesDescription(abilities) {
    const rawVanillaAbilitiesDescription = await fetch(
        `${repos.decap}/src/data/text/abilities.h`
    );
    const textVanillaAbilitiesDescription =
        await rawVanillaAbilitiesDescription.text();

    return regexVanillaAbilitiesDescription(
        textVanillaAbilitiesDescription,
        abilities
    );
}

async function getAbilitiesIngameName(abilities) {
    footerP("Fetching abilities ingame name");
    const rawAbilitiesIngameName = await fetch(
        `${repos.cfru}/strings/ability_name_table.string`
    );
    const textAbilitiesIngameName = await rawAbilitiesIngameName.text();

    return regexAbilitiesIngameName(textAbilitiesIngameName, abilities);
}

async function getAbilitiesDescription(abilities) {
    footerP("Fetching abilities description");
    const rawAbilitiesDescription = await fetch(
        `${repos.cfru}/strings/ability_descriptions.string`
    );
    const textAbilitiesDescription = await rawAbilitiesDescription.text();

    return regexAbilitiesDescription(textAbilitiesDescription, abilities);
}

async function getNewAbilities(abilities) {
    const rawNewAbilities = await fetch(
        `${repos.dex}/src/abilities/duplicate_abilities.json`
    );
    const jsonNewAbilities = await rawNewAbilities.json();

    return regexNewAbilities(jsonNewAbilities, abilities);
}

async function buildAbilitiesObj() {
    try {
        let abilities = {};
        abilities = await getAbilities(abilities);

        abilities = await getVanillaAbilitiesDescription(abilities);
        await Promise.all([
            getAbilitiesIngameName(abilities),
            getAbilitiesDescription(abilities),
            getNewAbilities(abilities),
        ]);

        abilities["ABILITY_NEUTRALIZINGGAS"]["description"] =
            "All Abilities are nullified.";
        abilities["ABILITY_FULLMETALBODY"]["description"] =
            "Prevents ability reduction.";
        abilities["ABILITY_EVAPORATE"]["description"] =
            "Nullifies all water to up Sp. Atk.";
        abilities["ABILITY_GRASS_DASH"]["description"] =
            "Grass-type moves hit first.";
        abilities["ABILITY_SLIPPERY_TAIL"]["description"] = "Tail moves hit first.";
        abilities["ABILITY_DRILL_BEAK"]["description"] =
            "Drill moves land critical hits.";

        Object.keys(abilities).forEach((ability) => {
            if (abilities[ability]["description"] === "") {
                delete abilities[ability];
            }
        });

        localStorage.setItem(
            "abilities",
            LZString.compressToUTF16(JSON.stringify(abilities))
        );
        return abilities;
    } catch (e) {
        console.error("Failed to build abilities data:", e.message, e.stack);
        footerP("Error fetching abilities data. Please refresh the page.");
        throw e;
    }
}

export async function fetchAbilitiesObj() {
    if (!localStorage.getItem("abilities")) {
        gameData.abilities = await buildAbilitiesObj();
    } else {
        gameData.abilities = await JSON.parse(
            LZString.decompressFromUTF16(localStorage.getItem("abilities"))
        );
    }

    trackers.abilities = [];
    for (let i = 0, j = Object.keys(gameData.abilities).length; i < j; i++) {
        trackers.abilities[i] = {};
        trackers.abilities[i]["key"] = Object.keys(gameData.abilities)[i];
        trackers.abilities[i]["filter"] = [];
    }
}
