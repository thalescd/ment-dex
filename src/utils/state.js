// Estado centralizado do app — substitui window.* para dados e estado UI
// Importar este módulo dá acesso mutável a todos os dados do jogo

// ---------------------------------------------------------------------------
// Formas dos dados.
//
// jsconfig.json liga "checkJs", entao estes @typedef nao sao decoracao: eles
// sao o que faz o editor e `npm run typecheck` reclamarem de um campo escrito
// errado. Sem eles, `species.tyep1` e `undefined` silencioso.
//
// Acesse os campos com ponto (species.type1), nao com bracket
// (species["type1"]): os dois sao iguais em runtime, mas so o primeiro e
// verificado.
// ---------------------------------------------------------------------------

/**
 * Uma especie montada por fetchSpecies.js.
 * @typedef {Object} Species
 * @property {string} name chave da constante, ex. "SPECIES_BULBASAUR"
 * @property {number} ID valor numerico do enum Species
 * @property {number} baseHP
 * @property {number} baseAttack
 * @property {number} baseDefense
 * @property {number} baseSpeed
 * @property {number} baseSpAttack
 * @property {number} baseSpDefense
 * @property {number} BST soma dos seis base stats
 * @property {string} type1 ex. "TYPE_GRASS"
 * @property {string} type2 igual a type1 quando a especie tem um tipo so
 * @property {string} [type3] terceiro tipo do CFRU; nada popula isso hoje
 * @property {string[]} abilities pode conter "ABILITY_NONE" no meio
 * @property {string} item1
 * @property {string} item2
 * @property {string} eggGroup1
 * @property {string} eggGroup2
 * @property {any[][]} evolution entradas [metodo, condicao, alvo], com uma
 *   lista de CONDITIONS opcional no fim
 * @property {string[]} evolutionLine todas as especies da linha, incluindo esta
 * @property {string[]} forms todas as formas da familia, incluindo esta
 * @property {Array<[string, number]>} levelUpLearnsets pares [move, nivel]
 * @property {string[]} TMHMLearnsets
 * @property {string[]} tutorLearnsets
 * @property {string[]} eggMovesLearnsets
 * @property {string} sprite URL do front sprite
 * @property {any[]} changes
 * @property {"base"|"regional"|"functional"|"cosmetic"} formType so base e
 *   regional aparecem na listagem principal
 */

/**
 * Um move montado por parseMovesInfo.
 * @typedef {Object} Move
 * @property {string} name chave da constante, ex. "MOVE_POUND"
 * @property {number} id
 * @property {string} ingameName nome exibido, ex. "Pound"
 * @property {string[]} description
 * @property {number} power
 * @property {number} PP
 * @property {string} type
 * @property {number} accuracy
 * @property {string} split "SPLIT_PHYSICAL" | "SPLIT_SPECIAL" | "SPLIT_STATUS"
 * @property {string} effect
 * @property {number} chance
 * @property {string} target
 * @property {number} priority
 * @property {string[]} flags inclui as FLAG_PRIORITY_* derivadas
 * @property {number} Zpower
 * @property {string} Zeffect
 * @property {string} maxPower
 * @property {any[]} changes
 */

/**
 * @typedef {Object} Ability
 * @property {string} name chave da constante, ex. "ABILITY_STENCH"
 * @property {string} ingameName
 * @property {string} description
 * @property {number} id
 */

/**
 * Uma entrada de tracker: uma linha candidata de tabela.
 * `filter` acumula os motivos pelos quais a linha esta escondida — vazio
 * significa visivel.
 * @typedef {Object} TrackerEntry
 * @property {string} key identifica a linha; para locations e trainers e uma
 *   chave composta separada por "\\"
 * @property {string[]} filter
 * @property {boolean} [show]
 */

/** zona -> metodo -> especie -> taxa de encontro @typedef {Record<string, Record<string, Record<string, number>>>} Locations */
/** especie -> zona -> metodos @typedef {Record<string, Record<string, string[]>>} LocationsByPokemon */
/** tipo atacante -> tipo defensor -> multiplicador @typedef {Record<string, Record<string, number>>} TypeChart */

// --- Dados do jogo (populados pelos fetch modules) ---
export const gameData = {
    /** @type {Record<string, Species>} */
    species: {},
    /** @type {Record<string, Move>} */
    moves: {},
    /** @type {Record<string, Ability>} */
    abilities: {},
    /** @type {Locations} */
    locations: {},
    /** @type {LocationsByPokemon} */
    locationsByPokemon: {},
    /** @type {TypeChart} */
    typeChart: {},
    /** chave -> imagem em base64 @type {Record<string, string>} */
    sprites: {},

    // Trainers e items: parados. Os parsers ainda visam o formato antigo do
    // CFRU e serao reescritos para o pokeemerald-expansion; a forma final
    // ainda nao esta definida, entao nao ha typedef para eles.
    /** @type {Record<string, any>} */
    trainers: {},
    /** @type {Record<string, any>} */
    items: {},
};

// --- Trackers para lazy loading das tabelas ---
export const trackers = {
    /** @type {TrackerEntry[]} */
    species: [],
    /** @type {TrackerEntry[]} */
    moves: [],
    /** @type {TrackerEntry[]} */
    abilities: [],
    /** @type {TrackerEntry[]} */
    locations: [],
    /** @type {TrackerEntry[]} */
    trainers: [],
    /** @type {TrackerEntry[]} */
    items: [],
};

// --- Estado UI ---
export const uiState = {
    /** @type {string|null} */
    speciesMoveFilter: null,
    /** @type {string|null} */
    locationsMoveFilter: null,
    /** @type {string[]} */
    speciesIngameNameArray: [],
    /** @type {string[]} */
    abilitiesIngameNameArray: [],
    /** @type {any[]} */
    speciesPanelHistory: [],
    trainersDifficulty: "Normal",
    /** nome exibido -> chave da constante @type {Record<string, string>} */
    abilityIngameNameToKey: {},
    /** nome exibido -> chave da constante @type {Record<string, string>} */
    moveIngameNameToKey: {},
};

/**
 * Monta a lista de tracker para uma tabela: uma entrada por chave do objeto.
 * @param {Record<string, unknown>} obj
 * @returns {TrackerEntry[]}
 */
export function buildTracker(obj) {
    return Object.keys(obj).map((key) => ({ key, filter: [] }));
}
