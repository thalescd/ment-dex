// Parsers para o formato pokeemerald-expansion
import { repos } from "../../utils/config.js";

// Helpers para extrair strings entre aspas de macros C
function extractQuotedStrings(raw) {
    const parts = [];
    const re = /"([^"]*)"/g;
    let m;
    while ((m = re.exec(raw)) !== null) parts.push(m[1]);
    return parts.join("").replace(/\\n/g, " ");
}

// ========================================================================
// 1. parseSpeciesConstants — include/constants/species.h
//    #define SPECIES_BULBASAUR 1
// ========================================================================
export function parseSpeciesConstants(text) {
    const species = {};
    const re = /#define\s+(SPECIES_\w+)\s+(\d+)/g;
    let m;
    while ((m = re.exec(text)) !== null) {
        const name = m[1];
        const id = parseInt(m[2]);
        species[name] = { name, ID: id };
    }
    return species;
}

// ========================================================================
// 2. parseSpeciesInfo — species_info/gen_X_families.h
//    Retorna { data: { SPECIES_XXX: {...} }, families: { P_FAMILY_XXX: [...] } }
// ========================================================================
export function parseSpeciesInfo(text) {
    const data = {};
    const families = {};

    // Tracking de familias via #if P_FAMILY_XXX ... #endif
    let currentFamily = null;
    const lines = text.split("\n");
    const familyStartRe = /^#if\s+P_FAMILY_(\w+)/;
    const familyEndRe = /^#endif\s*\/\/\s*P_FAMILY_/;

    // Primeiro: identificar ranges de linhas por familia
    const familyRanges = [];
    let rangeStart = -1;
    let familyName = null;

    for (let i = 0; i < lines.length; i++) {
        const startMatch = lines[i].match(familyStartRe);
        if (startMatch && rangeStart === -1) {
            rangeStart = i;
            familyName = `P_FAMILY_${startMatch[1]}`;
        }
        if (familyEndRe.test(lines[i]) && rangeStart !== -1) {
            familyRanges.push({
                family: familyName,
                start: rangeStart,
                end: i,
            });
            rangeStart = -1;
            familyName = null;
        }
    }

    // Regex para blocos de species — suporta 2 niveis de chaves aninhadas
    const blockRegex =
        /\[(SPECIES_\w+)\]\s*=\s*\{((?:[^{}]|\{(?:[^{}]|\{[^{}]*\})*\})*)\}/g;

    // Pre-parse de TODOS os #define do arquivo (macros de stats, etc)
    const defines = {};
    const defineRe = /#define\s+(\w+)\s+(.+)/g;
    let defMatch;
    while ((defMatch = defineRe.exec(text)) !== null) {
        // Manter apenas a primeira definicao (a versao "updated" antes do #else)
        if (!defines[defMatch[1]]) {
            defines[defMatch[1]] = defMatch[2].trim();
        }
    }

    // Processar cada familia
    for (const range of familyRanges) {
        const chunk = lines.slice(range.start, range.end + 1).join("\n");
        const familySpecies = [];
        let match;
        blockRegex.lastIndex = 0;

        while ((match = blockRegex.exec(chunk)) !== null) {
            const speciesKey = match[1];
            const body = match[2];
            familySpecies.push(speciesKey);

            data[speciesKey] = parseSpeciesBody(body, defines);
        }

        families[range.family] = familySpecies;
    }

    return { data, families };
}

function resolveIntValue(raw, defines) {
    const trimmed = raw.trim();
    // Caso 1: numero simples
    if (/^\d+$/.test(trimmed)) return parseInt(trimmed);
    // Caso 2: ternario inline — pegar o primeiro valor (branch "updated"/true)
    const ternaryMatch = trimmed.match(/\?\s*(\d+)/);
    if (ternaryMatch) return parseInt(ternaryMatch[1]);
    // Caso 3: referencia a macro — resolver no mapa de defines
    if (defines) {
        const macroVal = defines[trimmed];
        if (macroVal) {
            const macroTernary = macroVal.match(/\?\s*(\d+)/);
            if (macroTernary) return parseInt(macroTernary[1]);
            const macroNum = macroVal.match(/(\d+)/);
            if (macroNum) return parseInt(macroNum[1]);
        }
    }
    return 0;
}

function parseSpeciesBody(body, defines) {
    const intField = (name) => {
        const m = body.match(new RegExp(`\\.${name}\\s*=\\s*([^,\\n]+)`));
        return m ? resolveIntValue(m[1], defines) : 0;
    };

    // Types: MON_TYPES(TYPE_X, TYPE_Y) ou macro (CLEFAIRY_FAMILY_TYPES)
    let type1 = "",
        type2 = "";
    const typesMatch = body.match(/\.types\s*=\s*MON_TYPES\(([^)]+)\)/);
    if (typesMatch) {
        const types = typesMatch[1].match(/TYPE_\w+/g) || [];
        type1 = types[0] || "";
        type2 = types[1] || type1;
    } else {
        // Pode ser macro: .types = SOME_MACRO,
        const typesMacroMatch = body.match(/\.types\s*=\s*(\w+)/);
        if (typesMacroMatch && defines && defines[typesMacroMatch[1]]) {
            const resolved = defines[typesMacroMatch[1]];
            const types = resolved.match(/TYPE_\w+/g) || [];
            type1 = types[0] || "";
            type2 = types[1] || type1;
        }
    }

    // Abilities: { ABILITY_X, ABILITY_Y, ABILITY_Z } ou macro (GENGAR_ABILITIES)
    const abilities = [];
    const abilitiesMatch = body.match(/\.abilities\s*=\s*\{([^}]+)\}/);
    if (abilitiesMatch) {
        const abs = abilitiesMatch[1].match(/ABILITY_\w+/g) || [];
        abilities.push(...abs);
    } else {
        const abilitiesMacroMatch = body.match(/\.abilities\s*=\s*(\w+)/);
        if (abilitiesMacroMatch && defines && defines[abilitiesMacroMatch[1]]) {
            const resolved = defines[abilitiesMacroMatch[1]];
            const abs = resolved.match(/ABILITY_\w+/g) || [];
            abilities.push(...abs);
        }
    }

    // Egg groups: MON_EGG_GROUPS(EGG_GROUP_X, EGG_GROUP_Y)
    let eggGroup1 = "",
        eggGroup2 = "";
    const eggMatch = body.match(/\.eggGroups\s*=\s*MON_EGG_GROUPS\(([^)]+)\)/);
    if (eggMatch) {
        const groups = eggMatch[1].match(/EGG_GROUP_\w+/g) || [];
        eggGroup1 = groups[0] || "";
        eggGroup2 = groups[1] || eggGroup1;
    }

    // Items
    const itemCommonMatch = body.match(/\.itemCommon\s*=\s*(ITEM_\w+)/);
    const itemRareMatch = body.match(/\.itemRare\s*=\s*(ITEM_\w+)/);
    const item1 = itemCommonMatch ? itemCommonMatch[1] : "";
    const item2 = itemRareMatch ? itemRareMatch[1] : "";

    // Evolutions: EVOLUTION({METHOD, COND, TARGET}, {METHOD, COND, TARGET}, ...)
    // Algumas podem ter 4+ campos com CONDITIONS — pegar apenas os 3 primeiros
    const evolution = [];
    const evoMatch = body.match(
        /\.evolutions\s*=\s*EVOLUTION\(([\s\S]*?)\)(?:\s*,|\s*$)/
    );
    if (evoMatch) {
        const evoContent = evoMatch[1];
        // Cada evolucao esta dentro de { ... }
        const evoBlockRe = /\{(\w+)\s*,\s*(\w+)\s*,\s*(\w+)/g;
        let evoM;
        while ((evoM = evoBlockRe.exec(evoContent)) !== null) {
            // Ignorar blocos internos de CONDITIONS (que também têm {})
            // Verificar que o primeiro match é um EVO_ method
            if (evoM[1].startsWith("EVO_")) {
                evolution.push([evoM[1], evoM[2], evoM[3]]);
            }
        }
    }

    // Learnset references
    const levelUpRef = body.match(
        /\.levelUpLearnset\s*=\s*(s\w+LevelUpLearnset)/
    );
    const teachableRef = body.match(
        /\.teachableLearnset\s*=\s*(s\w+TeachableLearnset)/
    );
    const eggMoveRef = body.match(
        /\.eggMoveLearnset\s*=\s*(s\w+EggMoveLearnset)/
    );

    // Sprite reference
    const frontPicMatch = body.match(/\.frontPic\s*=\s*(gMonFrontPic_\w+)/);

    // Species display name
    const speciesNameMatch = body.match(
        /\.speciesName\s*=\s*_\(\s*"([^"]*)"\s*\)/
    );

    return {
        baseHP: intField("baseHP"),
        baseAttack: intField("baseAttack"),
        baseDefense: intField("baseDefense"),
        baseSpeed: intField("baseSpeed"),
        baseSpAttack: intField("baseSpAttack"),
        baseSpDefense: intField("baseSpDefense"),
        type1,
        type2,
        abilities,
        eggGroup1,
        eggGroup2,
        item1,
        item2,
        evolution,
        levelUpRef: levelUpRef ? levelUpRef[1] : null,
        teachableRef: teachableRef ? teachableRef[1] : null,
        eggMoveRef: eggMoveRef ? eggMoveRef[1] : null,
        frontPicRef: frontPicMatch ? frontPicMatch[1] : null,
        speciesName: speciesNameMatch ? speciesNameMatch[1] : "",
    };
}

// ========================================================================
// 3. parseLevelUpLearnsets — level_up_learnsets/gen_x.h
//    LEVEL_UP_MOVE(level, MOVE_XXX)
// ========================================================================
export function parseLevelUpLearnsets(text) {
    const learnsets = {};
    const blockRe =
        /\b(s\w+LevelUpLearnset)\s*\[\]\s*=\s*\{([\s\S]*?)LEVEL_UP_END/g;
    let match;

    while ((match = blockRe.exec(text)) !== null) {
        const name = match[1];
        const body = match[2];
        const moves = [];
        const moveRe = /LEVEL_UP_MOVE\(\s*(\d+)\s*,\s*(MOVE_\w+)\s*\)/g;
        let m;
        while ((m = moveRe.exec(body)) !== null) {
            moves.push([m[2], parseInt(m[1])]);
        }
        learnsets[name] = moves;
    }

    return learnsets;
}

// ========================================================================
// 4. parseTeachableLearnsets — teachable_learnsets.h
//    Listas de MOVE_XXX terminadas por MOVE_UNAVAILABLE
// ========================================================================
export function parseTeachableLearnsets(text) {
    const learnsets = {};
    const blockRe =
        /\b(s\w+TeachableLearnset)\s*\[\]\s*=\s*\{([\s\S]*?)MOVE_UNAVAILABLE/g;
    let match;

    while ((match = blockRe.exec(text)) !== null) {
        const name = match[1];
        const body = match[2];
        const moves = [];
        const moveRe = /\b(MOVE_\w+)\b/g;
        let m;
        while ((m = moveRe.exec(body)) !== null) {
            if (m[1] !== "MOVE_UNAVAILABLE") moves.push(m[1]);
        }
        learnsets[name] = moves;
    }

    return learnsets;
}

// ========================================================================
// 5. parseEggMoves — egg_moves.h
//    Mesmo padrao do teachable
// ========================================================================
export function parseEggMoves(text) {
    const learnsets = {};
    const blockRe =
        /\b(s\w+EggMoveLearnset)\s*\[\]\s*=\s*\{([\s\S]*?)MOVE_UNAVAILABLE/g;
    let match;

    while ((match = blockRe.exec(text)) !== null) {
        const name = match[1];
        const body = match[2];
        const moves = [];
        const moveRe = /\b(MOVE_\w+)\b/g;
        let m;
        while ((m = moveRe.exec(body)) !== null) {
            if (m[1] !== "MOVE_UNAVAILABLE") moves.push(m[1]);
        }
        learnsets[name] = moves;
    }

    return learnsets;
}

// ========================================================================
// 6. parseTmsHms — include/constants/tms_hms.h
//    FOREACH_TM(F) / FOREACH_HM(F) → Set de MOVE_XXX
// ========================================================================
export function parseTmsHms(text) {
    const tmhmMoves = new Set();

    // Capturar corpo do FOREACH_TM e FOREACH_HM
    const macroRe =
        /FOREACH_(?:TM|HM)\s*\(\s*F\s*\)([\s\S]*?)(?=FOREACH_|#define\s+FOREACH_TMHM|#endif)/g;
    let match;
    while ((match = macroRe.exec(text)) !== null) {
        const body = match[1];
        // F(MOVE_NAME) — o nome do move esta sem MOVE_ prefix, é só o sufixo
        const moveRe = /F\((\w+)\)/g;
        let m;
        while ((m = moveRe.exec(body)) !== null) {
            tmhmMoves.add(`MOVE_${m[1]}`);
        }
    }

    return tmhmMoves;
}

// ========================================================================
// 7. parseSpriteRefs — src/data/graphics/pokemon.h
//    gMonFrontPic_Xxx → path para sprite
// ========================================================================
export function parseSpriteRefs(text) {
    const refs = {};
    const re = /\b(gMonFrontPic_\w+)\b[^"]*INCBIN_U32\(\s*"([^"]+)"/g;
    let match;

    while ((match = re.exec(text)) !== null) {
        const refName = match[1];
        // Manter apenas a primeira ocorrencia (sprite novo, antes do #else GBA)
        if (refs[refName]) continue;
        const rawPath = match[2];
        // Trocar extensao .4bpp.smol por .png para obter a imagem
        const pngPath = rawPath.replace(/\.4bpp\.smol$/, ".png");
        refs[refName] = `${repos.expansion}/${pngPath}`;
    }

    return refs;
}

// ========================================================================
// Funcoes utilitarias reutilizadas do original
// ========================================================================

export function getEvolutionLine(species) {
    for (const name of Object.keys(species)) {
        const evolutionLine = [name];

        for (let i = 0; i < evolutionLine.length; i++) {
            const current = evolutionLine[i];
            if (!species[current]) continue;
            for (let j = 0; j < species[current]["evolution"].length; j++) {
                const target = species[current]["evolution"][j][2];
                if (!evolutionLine.includes(target) && species[target]) {
                    evolutionLine.push(target);
                }
            }
        }

        for (let i = 0; i < evolutionLine.length; i++) {
            const target = evolutionLine[i];
            if (
                species[target] &&
                evolutionLine.length > species[target]["evolutionLine"].length
            ) {
                species[target]["evolutionLine"] = evolutionLine;
            }
        }
    }

    for (const name of Object.keys(species)) {
        species[name]["evolutionLine"] = Array.from(
            new Set(species[name]["evolutionLine"])
        );
    }

    return species;
}

export function altFormsLearnsets(species, input, output) {
    for (const name of Object.keys(species)) {
        if (species[name][input].length >= 2) {
            for (let j = 0; j < species[name][input].length; j++) {
                const targetSpecies = species[name][input][j];
                if (
                    species[targetSpecies] &&
                    species[targetSpecies][output].length <= 0
                ) {
                    species[targetSpecies][output] = species[name][output];
                }
            }
        }
    }
    return species;
}
