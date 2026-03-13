// --- UTILS (Base do sistema) ---
import './utils/global.js';
import './utils/lz-string.js';
import './utils/utility.js';
import './utils/tableUtility.js';
import './utils/tableFilters.js';
import { changeSetting, manageSettings, applySettings } from './utils/settings.js';
import './utils/speciesPanelUtility.js';

// --- MODULES: SPECIES ---
import './modules/species/regexSpecies.js';
import './modules/species/fetchSpecies.js';
import './modules/species/displaySpecies.js';

// --- MODULES: ABILITIES ---
import './modules/abilities/regexAbilities.js';
import './modules/abilities/fetchAbilities.js';
import './modules/abilities/displayAbilities.js';

// --- MODULES: MOVES ---
import './modules/moves/regexMoves.js';
import './modules/moves/fetchMoves.js';
import './modules/moves/displayMoves.js';

// --- MODULES: LOCATIONS ---
import './modules/locations/regexLocations.js';
import './modules/locations/fetchLocations.js';
import './modules/locations/displayLocations.js';

// --- MODULES: SCRIPTS (Items e Trainers) ---
import './modules/scripts/regexScripts.js';
import './modules/scripts/fetchScripts.js';
import './modules/scripts/displayItems.js';
import './modules/scripts/displayTrainers.js';

// --- MODULES: STRATEGIES ---
import './modules/strategies/regexStrategies.js';
import './modules/strategies/fetchStrategies.js';
