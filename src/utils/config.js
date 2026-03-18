// Configuracoes do projeto - constantes puras, sem dependencias

const GITHUB_RAW = 'https://raw.githubusercontent.com';

export const repos = {
    cfru:      `${GITHUB_RAW}/Skeli789/Complete-Fire-Red-Upgrade/master`,
    dpe:       `${GITHUB_RAW}/Skeli789/Dynamic-Pokemon-Expansion/Unbound`,
    dpeMaster: `${GITHUB_RAW}/Skeli789/Dynamic-Pokemon-Expansion/master`,
    dex:       `${GITHUB_RAW}/ydarissep/Unbound-Pokedex/main`,
    dexCore:   `${GITHUB_RAW}/ydarissep/dex-core/main`,
    decap:     `${GITHUB_RAW}/ProfLeonDias/pokefirered/decapitalization`,
    strats:    `${GITHUB_RAW}/ashytastic/Radical-Red-Pokedex/main`,
};
export const checkUpdate = "22 Unbound";
export const regexSpChar = new RegExp("-|'|\u2019| |,|\\.|_|!|\\?", "g");
export const appTitle = "MENT Dex";
export const footerText = "Unbound\nYdarissep Pokedex";

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

