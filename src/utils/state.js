// Estado centralizado do app — substitui window.* para dados e estado UI
// Importar este módulo dá acesso mutável a todos os dados do jogo

// --- Dados do jogo (populados pelos fetch modules) ---
export const gameData = {
    species: {},
    moves: {},
    abilities: {},
    locations: {},
    trainers: {},
    items: {},
    typeChart: {},
    sprites: {},
    locationsByPokemon: {},
};

// --- Trackers para lazy loading das tabelas ---
export const trackers = {
    species: [],
    moves: [],
    abilities: [],
    locations: [],
    trainers: [],
    items: [],
};

// --- Estado UI ---
export const uiState = {
    speciesMoveFilter: null,
    locationsMoveFilter: null,
    speciesIngameNameArray: [],
    abilitiesIngameNameArray: [],
    speciesPanelHistory: [],
    trainersDifficulty: "Normal",
    abilityIngameNameToKey: {},
    moveIngameNameToKey: {},
};

/**
 * Monta a lista de tracker para uma tabela: uma entrada por chave do objeto.
 * @param {Record<string, unknown>} obj
 * @returns {{ key: string, filter: string[] }[]}
 */
export function buildTracker(obj) {
    return Object.keys(obj).map((key) => ({ key, filter: [] }));
}
