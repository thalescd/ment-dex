import { gameData, trackers } from "../../core/state.js";
import { dataSources } from "../../core/config.js";
import { setTracker } from "../../core/domRefs.js";
import { statusMsg } from "../../core/status.js";
import { fetchText, fetchJson } from "../../core/http.js";
import { loadCached, writeCache } from "../../core/cache.js";
import {
    parseSpeciesConstants,
    parseSpeciesInfo,
    parseLevelUpLearnsets,
    parseEggMoves,
    parseTmsHms,
    parseSpriteRefs,
    parseFormSpeciesTables,
    getEvolutionLine,
    altFormsLearnsets,
} from "./parse.js";

// --- FASE 1: FETCH PARALELO ---

async function fetchAllData() {
    statusMsg("Fetching species");

    const [
        constantsText,
        infoTexts,
        learnsetText,
        teachableData,
        eggMovesText,
        tmsHmsText,
        spritesText,
        formTablesText,
    ] = await Promise.all([
        fetchText(dataSources.speciesConstants),
        Promise.all(dataSources.speciesInfo.map(fetchText)),
        Array.isArray(dataSources.levelUpLearnsets)
            ? Promise.all(dataSources.levelUpLearnsets.map(fetchText)).then(
                  (texts) => texts.join("\n")
              )
            : fetchText(dataSources.levelUpLearnsets),
        fetchJson(dataSources.teachableLearnsets),
        fetchText(dataSources.eggMoves),
        fetchText(dataSources.tmsHms),
        fetchText(dataSources.pokemonGraphics),
        fetchText(dataSources.formSpeciesTables),
    ]);

    return {
        constantsText,
        infoTexts,
        learnsetText,
        teachableData,
        eggMovesText,
        tmsHmsText,
        spritesText,
        formTablesText,
    };
}

// --- FASE 2: PARSE ---

function parseAllData(raw) {
    statusMsg("Parsing species data");

    const constants = parseSpeciesConstants(raw.constantsText);

    // Merge speciesInfo de todos os 9 arquivos gen
    const allInfoData = {};
    const allFamilies = {};
    for (const text of raw.infoTexts) {
        const result = parseSpeciesInfo(text);
        Object.assign(allInfoData, result.data);
        Object.assign(allFamilies, result.families);
    }

    const levelUpLearnsets = parseLevelUpLearnsets(raw.learnsetText);
    const teachableLearnsets = raw.teachableData;
    const eggMoveLearnsets = parseEggMoves(raw.eggMovesText);
    const tmhmSet = parseTmsHms(raw.tmsHmsText);
    const spriteRefs = parseSpriteRefs(raw.spritesText);
    const formClassification = parseFormSpeciesTables(raw.formTablesText);

    assertPlausible(constants, allInfoData, levelUpLearnsets);

    return {
        constants,
        allInfoData,
        allFamilies,
        levelUpLearnsets,
        teachableLearnsets,
        eggMoveLearnsets,
        tmhmSet,
        spriteRefs,
        formClassification,
    };
}

// O upstream muda de formato sem aviso, e um parser que deixa de casar devolve
// um objeto vazio em vez de lançar. Sem esta guarda o resultado vazio era
// montado, cacheado e servido — a dex ficava vazia e nada avisava.
// Os limites sao deliberadamente baixos: detectam "o parser parou de casar",
// nao "faltam algumas especies".
const MIN_CONSTANTS = 500;
const MIN_SPECIES_INFO = 500;
const MIN_LEVEL_UP_LEARNSETS = 300;

function assertPlausible(constants, allInfoData, levelUpLearnsets) {
    /** @type {string[]} */
    const problems = [];
    const check = (label, actual, min) => {
        if (actual < min) {
            problems.push(`${label}: ${actual} (esperado no minimo ${min})`);
        }
    };

    check("species constants", Object.keys(constants).length, MIN_CONSTANTS);
    check("species_info", Object.keys(allInfoData).length, MIN_SPECIES_INFO);
    check(
        "level-up learnsets",
        Object.keys(levelUpLearnsets).length,
        MIN_LEVEL_UP_LEARNSETS
    );

    if (problems.length > 0) {
        throw new Error(
            `Parse de species rendeu muito pouco — o formato upstream provavelmente mudou. ${problems.join("; ")}`
        );
    }
}

// --- FASE 3: MONTAR SPECIES ---

function assembleSpecies(parsed) {
    statusMsg("Building species objects");
    const species = {};
    const {
        constants,
        allInfoData,
        levelUpLearnsets,
        teachableLearnsets,
        eggMoveLearnsets,
        tmhmSet,
        spriteRefs,
        formClassification,
    } = parsed;

    // Para cada species definida em constants, montar o objeto
    for (const [name, constData] of Object.entries(constants)) {
        const info = allInfoData[name];
        if (!info) continue; // species sem dados no speciesInfo (placeholder)

        const baseHP = info.baseHP;
        const baseAttack = info.baseAttack;
        const baseDefense = info.baseDefense;
        const baseSpeed = info.baseSpeed;
        const baseSpAttack = info.baseSpAttack;
        const baseSpDefense = info.baseSpDefense;
        const BST =
            baseHP +
            baseAttack +
            baseDefense +
            baseSpAttack +
            baseSpDefense +
            baseSpeed;

        // Resolver learnsets por referencia
        const levelUp = info.levelUpRef
            ? levelUpLearnsets[info.levelUpRef] || []
            : [];

        const teachable =
            teachableLearnsets[name.replace(/^SPECIES_/, "")] || [];

        // Separar teachable em TMHM e tutor
        const TMHMLearnsets = [];
        const tutorLearnsets = [];
        for (const move of teachable) {
            if (tmhmSet.has(move)) {
                TMHMLearnsets.push(move);
            } else {
                tutorLearnsets.push(move);
            }
        }

        const eggMoves = info.eggMoveRef
            ? eggMoveLearnsets[info.eggMoveRef] || []
            : [];

        // Resolver sprite
        let sprite = "";
        if (info.frontPicRef && spriteRefs[info.frontPicRef]) {
            sprite = spriteRefs[info.frontPicRef];
        }

        species[name] = {
            name: name,
            ID: constData.ID,
            baseHP,
            baseAttack,
            baseDefense,
            baseSpeed,
            baseSpAttack,
            baseSpDefense,
            BST,
            type1: info.type1,
            type2: info.type2,
            abilities: info.abilities.slice(),
            item1: info.item1,
            item2: info.item2,
            eggGroup1: info.eggGroup1,
            eggGroup2: info.eggGroup2,
            evolution: info.evolution.map((e) => [...e]),
            evolutionLine: [name],
            forms: [],
            levelUpLearnsets: levelUp,
            TMHMLearnsets,
            tutorLearnsets,
            eggMovesLearnsets: eggMoves,
            sprite,
            changes: [],
            formType: formClassification[name] || "base",
        };
    }

    return species;
}

// --- FASE 4: FORMS (familias) ---

function resolveForms(species, allFamilies) {
    statusMsg("Resolving forms");

    for (const familyMembers of Object.values(allFamilies)) {
        // Filtrar apenas species que existem no objeto final
        const validMembers = familyMembers.filter((name) => species[name]);
        for (const name of validMembers) {
            species[name]["forms"] = validMembers;
        }
    }

    return species;
}

// --- FASE 5: CLEANUP ---

function cleanSpecies(species) {
    statusMsg("Cleaning up...");

    Object.keys(species).forEach((name) => {
        if (species[name]["baseSpeed"] <= 0) {
            // Remover species de forms e evolutionLines de outros
            for (const targetName of species[name]["forms"]) {
                if (species[targetName]) {
                    species[targetName]["forms"] = species[targetName][
                        "forms"
                    ].filter((f) => f !== name);
                }
            }
            for (const targetName of species[name]["evolutionLine"]) {
                if (species[targetName]) {
                    species[targetName]["evolutionLine"] = species[targetName][
                        "evolutionLine"
                    ].filter((f) => f !== name);
                }
            }
            delete species[name];
        }
    });

    // Limpar evolution de megas (nao evoluem mais)
    Object.keys(species).forEach((name) => {
        if (/_MEGA$|_MEGA_Y$|_MEGA_X$/i.test(name)) {
            species[name]["evolution"] = [];
        }
    });

    return species;
}

// --- CONSTRUCAO DO OBJETO ---

async function buildSpeciesObj() {
    try {
        // Fase 1: fetch
        const raw = await fetchAllData();

        // Fase 2: parse
        const parsed = parseAllData(raw);

        // Fase 3: montar
        let species = assembleSpecies(parsed);

        // Fase 4: forms
        species = resolveForms(species, parsed.allFamilies);

        // Fase 5: evolution lines
        species = getEvolutionLine(species);

        // Fase 6: propagar learnsets para alt forms
        species = altFormsLearnsets(species, "forms", "tutorLearnsets");
        species = altFormsLearnsets(species, "forms", "TMHMLearnsets");
        species = altFormsLearnsets(
            species,
            "evolutionLine",
            "eggMovesLearnsets"
        );

        // Fase 7: cleanup
        species = cleanSpecies(species);

        // Draco Meteor para tipos dragao
        Object.keys(species).forEach((name) => {
            if (
                (species[name]["type1"] === "TYPE_DRAGON" ||
                    species[name]["type2"] === "TYPE_DRAGON") &&
                !species[name]["tutorLearnsets"].includes("MOVE_DRACOMETEOR")
            ) {
                species[name]["tutorLearnsets"].push("MOVE_DRACOMETEOR");
            }
        });

        // O pipeline de species anota gameData.moves, entao regrava o cache dele
        writeCache("moves", gameData.moves);
        return species;
    } catch (e) {
        console.error("Failed to build species data:", e.message, e.stack);
        statusMsg("Error fetching species data. Please refresh the page.");
        throw e;
    }
}

// --- FUNCAO PRINCIPAL CHAMADA PELO APP ---

export async function fetchSpeciesObj() {
    gameData.species = await loadCached("species", buildSpeciesObj);

    gameData.sprites = {};
    trackers.species = [];

    const speciesMap = /** @type {Record<string, any>} */ (gameData.species);
    const speciesList = /** @type {any[]} */ (trackers.species);
    for (const name of Object.keys(speciesMap)) {
        const ft = speciesMap[name].formType;
        if (ft === "base" || ft === "regional") {
            speciesList.push({ key: name, filter: [] });
        }
    }

    setTracker(trackers.species);
}
