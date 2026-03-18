// 1. Config e DOM (sem dependencias externas)
import "./utils/config.js";
import "./utils/domRefs.js";

// 2. Bibliotecas utilitarias
import "./utils/lz-string.js";
import "./utils/utility.js";
import "./utils/tableUtility.js";
import "./utils/tableFilters.js";
import "./utils/settings.js";
import "./utils/speciesPanelUtility.js";

// 3. Modulos de dados
import "./modules/species/regexSpecies.js";
import "./modules/species/fetchSpecies.js";
import "./modules/species/displaySpecies.js";
import "./modules/abilities/regexAbilities.js";
import "./modules/abilities/fetchAbilities.js";
import "./modules/abilities/displayAbilities.js";
import "./modules/moves/regexMoves.js";
import "./modules/moves/fetchMoves.js";
import "./modules/moves/displayMoves.js";
import "./modules/locations/regexLocations.js";
import "./modules/locations/fetchLocations.js";
import "./modules/locations/displayLocations.js";
import "./modules/scripts/regexTrainers.js";
import "./modules/scripts/regexItems.js";
import "./modules/scripts/regexScriptLocations.js";
import "./modules/scripts/fetchScripts.js";
import "./modules/scripts/displayItems.js";
import "./modules/scripts/displayTrainers.js";
import "./modules/strategies/regexStrategies.js";
import "./modules/strategies/fetchStrategies.js";

// 4. Orquestrador (importa dos modulos acima, resolve dependencias)
import "./utils/app.js";

// 5. Event listeners (DEVE ser ultimo - depende de tudo acima)
import "./utils/eventListeners.js";
