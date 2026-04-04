// Configuracoes do projeto - constantes puras, sem dependencias

const GITHUB_RAW = "https://raw.githubusercontent.com";

export const repos = {
    expansion: `${GITHUB_RAW}/thalescd/pokeemerald-expansion/master`,
};

// ---------------------------------------------------------------------------
// Mapa centralizado de TODOS os arquivos remotos usados pelo app.
//
// FORMATO ORIGINAL (CFRU/DPE) vs FORMATO EXPANSION:
// - species_info:  substitui baseStats, evolutionTable, formSpeciesTables,
//                  speciesConstants (parcial), frontPicTable, sprites
// - moves_info:    substitui battleMoves, attackDescriptions, attackNameTable
// - abilities:     substitui abilitiesH, abilityNameTable, abilityDescriptions
// - teachable:     substitui tmCompatibility + tutorCompatibility
// ---------------------------------------------------------------------------
export const dataSources = {
    // === SPECIES ===
    speciesConstants: `${repos.expansion}/include/constants/species.h`,
    // species_info contem: base stats, tipos, abilities, egg groups, evolutions,
    // formas, sprites, nomes — tudo num unico entry por species
    speciesInfo: [
        `${repos.expansion}/src/data/pokemon/species_info/gen_1_families.h`,
        `${repos.expansion}/src/data/pokemon/species_info/gen_2_families.h`,
        `${repos.expansion}/src/data/pokemon/species_info/gen_3_families.h`,
        `${repos.expansion}/src/data/pokemon/species_info/gen_4_families.h`,
        `${repos.expansion}/src/data/pokemon/species_info/gen_5_families.h`,
        `${repos.expansion}/src/data/pokemon/species_info/gen_6_families.h`,
        `${repos.expansion}/src/data/pokemon/species_info/gen_7_families.h`,
        `${repos.expansion}/src/data/pokemon/species_info/gen_8_families.h`,
        `${repos.expansion}/src/data/pokemon/species_info/gen_9_families.h`,
    ],
    levelUpLearnsets: `${repos.expansion}/src/data/pokemon/level_up_learnsets/gen_x.h`,
    teachableLearnsets: `${repos.expansion}/src/data/pokemon/teachable_learnsets.h`,
    eggMoves: `${repos.expansion}/src/data/pokemon/egg_moves.h`,
    tmsHms: `${repos.expansion}/include/constants/tms_hms.h`,
    // sprite paths: extraidos de pokemon.h, imagens em graphics/pokemon/{name}/
    pokemonGraphics: `${repos.expansion}/src/data/graphics/pokemon.h`,
    spriteBaseDir: `${repos.expansion}/graphics/pokemon`, // {dir}/{species_name}/front.png

    // === MOVES ===
    // moves_info contem: nome, descricao, tipo, power, accuracy, pp, flags — tudo junto
    movesInfo: `${repos.expansion}/src/data/moves_info.h`,

    // === ABILITIES ===
    // abilities contem: nome + descricao no mesmo entry
    abilitiesInfo: `${repos.expansion}/src/data/abilities.h`,

    // === LOCATIONS ===
    wildEncountersJson: `${repos.expansion}/src/data/wild_encounters.json`,

    // === TYPE CHART ===
    typeChart: "src/data/typeChart.json",
};
export const checkUpdate = "24 Unbound";
export const expansionApiRef = "https://api.github.com/repos/thalescd/pokeemerald-expansion/git/refs/heads/master";
export const regexSpChar = new RegExp("-|'|\u2019| |,|\\.|_|!|\\?", "g");
export const appTitle = "MENT Dex";
export const titleText = "MENT Dex";

// Lazy loading
export const LAZY_LOAD_BATCH_SIZE = 75;
export const TRAINER_BATCH_SIZE = 20;

// Filtros e input
export const MIN_FILTER_INPUT_LENGTH = 3;
export const TYPING_DEBOUNCE_MS = 300;

// Painel de espécies
export const MAX_PANEL_HISTORY = 12;
export const MOVE_NAME_MAX_WIDTH_PX = 90;

// Timeouts de UI (ms)
export const LONG_PRESS_DURATION_MS = 1500;
export const LOCK_SPECIES_TIMEOUT_MS = 750;
