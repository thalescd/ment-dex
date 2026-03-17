import { gameData, trackers } from '../../utils/state.js';
import { repo1, repo2, repoDex } from '../../utils/config.js';
import { LZString } from '../../utils/lz-string.js';
import { setTracker } from '../../utils/domRefs.js';
import { footerP } from '../../utils/utility.js';
import {
    regexSpecies, regexBaseStats, regexLevelUpLearnsets, getLevelUpLearnsetsConversionTable,
    regexTMHMLearnsets, regexTutorLearnsets, regexEvolution, regexForms,
    regexEggMovesLearnsets, regexSprite, regexReplaceAbilities,
    regexAbilitiesArrayForChanges, regexChanges, altFormsLearnsets
} from './regexSpecies.js';

// --- FUNÇÕES DE FETCH ---

async function getSpecies(speciesObj) {
    footerP("Fetching species");
    const rawSpecies = await fetch(`https://raw.githubusercontent.com/${repo1}/include/constants/species.h`);
    const textSpecies = await rawSpecies.text();
    return regexSpecies(textSpecies, speciesObj);
}

async function getBaseStats(speciesObj) {
    const rawBaseStats = await fetch(`https://raw.githubusercontent.com/${repo2}/src/Base_Stats.c`);
    const textBaseStats = await rawBaseStats.text();
    return regexBaseStats(textBaseStats, speciesObj);
}

async function getLevelUpLearnsets(species) {
    const rawLevelUpLearnsets = await fetch(
        `https://raw.githubusercontent.com/${repo2}/src/Learnsets.c`
    );
    const textLevelUpLearnsets = await rawLevelUpLearnsets.text();

    const rawLevelUpLearnsetsPointers = await fetch(
        `https://raw.githubusercontent.com/${repo2}/src/Learnsets.c`
    );
    const textLevelUpLearnsetsPointers =
        await rawLevelUpLearnsetsPointers.text();

    const levelUpLearnsetsConversionTable = getLevelUpLearnsetsConversionTable(
        textLevelUpLearnsetsPointers
    );

    return regexLevelUpLearnsets(
        textLevelUpLearnsets,
        levelUpLearnsetsConversionTable,
        species
    );
}

async function getTMHMLearnsets(species) {
    const rawTMHMLearnsets = await fetch(
        `https://raw.githubusercontent.com/${repo2}/src/TM_Tutor_Tables.c`
    );
    const textTMHMLearnsets = await rawTMHMLearnsets.text();

    return regexTMHMLearnsets(
        textTMHMLearnsets,
        species,
        "gTMHMMoves",
        "gMoveTutorMoves"
    );
}

async function getTutorLearnsets(species) {
    const rawTutorLearnsets = await fetch(
        `https://raw.githubusercontent.com/${repo2}/src/TM_Tutor_Tables.c`
    );
    const textTutorLearnsets = await rawTutorLearnsets.text();

    return regexTutorLearnsets(
        textTutorLearnsets,
        species,
        "gMoveTutorMoves",
        "gTMHMMoves"
    );
}

async function getEvolution(species) {
    const rawEvolution = await fetch(
        `https://raw.githubusercontent.com/${repo2}/src/Evolution%20Table.c`
    );
    const textEvolution = await rawEvolution.text();

    return regexEvolution(textEvolution, species);
}

async function getForms(species) {
    const rawForms = await fetch(
        `https://raw.githubusercontent.com/${repo1}/src/data/pokemon/form_species_tables.h`
    );
    const textForms = await rawForms.text();

    return regexForms(textForms, species);
}

async function getEggMovesLearnsets(species) {
    const rawEggMoves = await fetch(
        `https://raw.githubusercontent.com/${repo2}/src/Egg_Moves.c`
    );
    const textEggMoves = await rawEggMoves.text();

    return regexEggMovesLearnsets(textEggMoves, species);
}

async function getSprite(species) {
    const rawSprite = await fetch(
        `https://raw.githubusercontent.com/${repo2}/src/Front_Pic_Table.c`
    );
    const textSprite = await rawSprite.text();

    return regexSprite(textSprite, species);
}

async function getReplaceAbilities(species) {
    const rawReplaceAbilities = await fetch(
        `https://raw.githubusercontent.com/${repoDex}/main/src/abilities/duplicate_abilities.json`
    );
    const jsonReplaceAbilities = await rawReplaceAbilities.json();

    return regexReplaceAbilities(jsonReplaceAbilities, species);
}

async function getChanges(species, url) {
    const rawAbilitiesChanges = await fetch(
        "https://raw.githubusercontent.com/Skeli789/Complete-Fire-Red-Upgrade/master/include/constants/abilities.h"
    );
    const textAbilitiesForChanges = await rawAbilitiesChanges.text();

    const abilitiesArrayForChanges = await regexAbilitiesArrayForChanges(
        textAbilitiesForChanges
    );

    const rawChanges = await fetch(url);
    const textChanges = await rawChanges.text();

    return regexChanges(textChanges, species, abilitiesArrayForChanges);
}

async function fixFormAbilities(species) {
    Object.entries(species)
        .filter(
            ([name, pokemon]) =>
                species[name + "_F"] !== undefined && pokemon.forms.length === 2
        )
        .forEach(([name, male]) => {
            const female = species[name + "_F"];
            female.id = male.id;
            female.abilities = male.abilities.slice();
        });
    Object.entries(species)
        .filter(
            ([name, pokemon]) =>
                species[name + "_FEMALE"] !== undefined &&
                pokemon.forms.length === 2
        )
        .forEach(([name, male]) => {
            const female = species[name + "_FEMALE"];
            female.id = male.id;
            female.abilities = male.abilities.slice();
        });
    species["SPECIES_UNOWN"].forms.forEach(
        (form) =>
            (species[form].abilities =
                species["SPECIES_UNOWN"].abilities.slice())
    );
    return species;
}

async function cleanSpecies(species) {
    footerP("Cleaning up...");
    Object.keys(species).forEach((name) => {
        if (species[name]["baseSpeed"] <= 0) {
            for (let i = 0; i < species[name]["forms"].length; i++) {
                const targetSpecies = species[name]["forms"][i];
                for (
                    let j = 0;
                    j < species[targetSpecies]["forms"].length;
                    j++
                ) {
                    if (species[targetSpecies]["forms"][j] === name) {
                        species[targetSpecies]["forms"].splice(j, 1);
                    }
                }
            }
            for (let i = 0; i < species[name]["evolutionLine"].length; i++) {
                const targetSpecies = species[name]["evolutionLine"][i];
                for (
                    let j = 0;
                    j < species[targetSpecies]["evolutionLine"].length;
                    j++
                ) {
                    if (species[targetSpecies]["evolutionLine"][j] === name) {
                        species[targetSpecies]["evolutionLine"].splice(j, 1);
                    }
                }
            }
        } else if (
            name.match(/_GIGA$/i) &&
            species[name]["evolution"].toString().includes("EVO_MEGA")
        ) {
            const replaceName = name.replace(/_GIGA$/i, "_MEGA");
            species[name]["name"] = replaceName;
            species[name]["changes"] = [];
            species[name]["evolution"] = [];
            species[replaceName] = species[name];
            let arraySpeciesToClean = [];
            species[name]["forms"].forEach((targetSpecies) => {
                if (!arraySpeciesToClean.includes(targetSpecies)) {
                    arraySpeciesToClean.push(targetSpecies);
                }
            });
            species[name]["evolutionLine"].forEach((targetSpecies) => {
                if (!arraySpeciesToClean.includes(targetSpecies)) {
                    arraySpeciesToClean.push(targetSpecies);
                }
            });
            arraySpeciesToClean.forEach((speciesToClean) => {
                species[speciesToClean]["forms"] = JSON.parse(
                    JSON.stringify(species[speciesToClean]["forms"]).replaceAll(
                        name,
                        replaceName
                    )
                );
                species[speciesToClean]["evolution"] = JSON.parse(
                    JSON.stringify(
                        species[speciesToClean]["evolution"]
                    ).replaceAll(name, replaceName)
                );
                species[speciesToClean]["evolutionLine"] = JSON.parse(
                    JSON.stringify(
                        species[speciesToClean]["evolutionLine"]
                    ).replaceAll(name, replaceName)
                );
            });
            species[replaceName] = species[name];
            delete species[name];
        } else if (name.match(/_MEGA$|_MEGA_Y$|_MEGA_X$|_GIGA$/i)) {
            species[name]["evolution"] = [];
        }
    });

    return species;
}

// --- CONSTRUÇÃO DO OBJETO ---

async function buildSpeciesObj() {
    try {
        let species = {};
        species = await getSpecies(species);

        species = await initializeSpeciesObj(species);
        species = await getEvolution(species);
        //species = await getForms(species) // should be called in that order until here    // done in getLevelUpLearnsets for CFRU
        await Promise.all([
            getBaseStats(species),
            getLevelUpLearnsets(species),
            getTMHMLearnsets(species),
            getEggMovesLearnsets(species),
            getTutorLearnsets(species),
            getSprite(species),
        ]);
        species = await getReplaceAbilities(species);
        species = await altFormsLearnsets(species, "forms", "tutorLearnsets");
        species = await altFormsLearnsets(species, "forms", "TMHMLearnsets");
        ((species = await getChanges(
            species,
            "https://raw.githubusercontent.com/Skeli789/Dynamic-Pokemon-Expansion/master/src/Base_Stats.c"
        )),
            (species = await cleanSpecies(species)));

        Object.keys(species).forEach((name) => {
            if (
                (species[name]["type1"] === "TYPE_DRAGON" ||
                    species[name]["type2"] === "TYPE_DRAGON") &&
                !species[name]["tutorLearnsets"].includes("MOVE_DRACOMETEOR")
            ) {
                species[name]["tutorLearnsets"].push("MOVE_DRACOMETEOR");
            }
        });

        species = await fixFormAbilities(species);
        localStorage.setItem(
            "species",
            LZString.compressToUTF16(JSON.stringify(species))
        );
        localStorage.setItem(
            "moves",
            LZString.compressToUTF16(JSON.stringify(gameData.moves))
        );
        return species;
    } catch (e) {
        console.error("Failed to build species data:", e.message, e.stack);
        footerP("Error fetching species data. Please refresh the page.");
        throw e;
    }
}

function initializeSpeciesObj(species) {
    footerP("Initializing species");
    for (const name of Object.keys(species)) {
        species[name]["baseHP"] = 0;
        species[name]["baseAttack"] = 0;
        species[name]["baseDefense"] = 0;
        species[name]["baseSpAttack"] = 0;
        species[name]["baseSpDefense"] = 0;
        species[name]["baseSpeed"] = 0;
        species[name]["BST"] = 0;
        species[name]["abilities"] = [];
        species[name]["type1"] = "";
        species[name]["type2"] = "";
        species[name]["item1"] = "";
        species[name]["item2"] = "";
        species[name]["eggGroup1"] = "";
        species[name]["eggGroup2"] = "";
        species[name]["changes"] = [];
        species[name]["levelUpLearnsets"] = [];
        species[name]["TMHMLearnsets"] = [];
        species[name]["eggMovesLearnsets"] = [];
        species[name]["tutorLearnsets"] = [];
        species[name]["evolution"] = [];
        species[name]["evolutionLine"] = [name];
        species[name]["forms"] = [];
        species[name]["sprite"] = "";
    }
    return species;
}

// --- FUNÇÃO PRINCIPAL CHAMADA PELO APP ---

export async function fetchSpeciesObj() {
    if (!localStorage.getItem("species"))
        gameData.species = await buildSpeciesObj();
    else
        gameData.species = await JSON.parse(
            LZString.decompressFromUTF16(localStorage.getItem("species"))
        );

    gameData.sprites = {};
    trackers.species = [];

    for (let i = 0, j = Object.keys(gameData.species).length; i < j; i++) {
        trackers.species[i] = {};
        trackers.species[i]["key"] = Object.keys(gameData.species)[i];
        trackers.species[i]["filter"] = [];
    }

    setTracker(trackers.species);
}

