// Mostrar / esconder / alternar o painel de especies.
//
// Isto e um primitivo de UI, usado por seis modulos diferentes — nao e logica
// de montagem de painel. Enquanto morava em speciesPanelUtility.js,
// displayMoves.js precisava importar de la, o que fechava o ultimo ciclo de
// import do projeto:
//   speciesPanelUtility -> speciesPanelLearnsets -> displayMoves -> speciesPanelUtility

import {
    speciesPanelMainContainer,
    overlaySpeciesPanel,
    utilityButton,
    panelSpecies,
    table,
    body,
} from "../../core/domRefs.js";
import { refreshURLParams } from "../../core/utility.js";
import { gameData } from "../../core/state.js";

/**
 * @param {"show"|"hide"|"toggle"} param
 */
export async function speciesPanel(param) {
    if (param === "hide" || gameData.species[panelSpecies]["baseSpeed"] <= 0) {
        body.classList.remove("fixedPanel");
        overlaySpeciesPanel.style.display = "none";
        speciesPanelMainContainer.classList.add("hide");
        refreshURLParams();
        if (table.getBoundingClientRect().top < 0) {
            utilityButton.innerText = "\u2191";
        } else {
            utilityButton.innerText = "\u2630";
        }
    } else if (param === "show") {
        utilityButton.innerText = "X";
        body.classList.add("fixedPanel");
        overlaySpeciesPanel.style.display = "block";
        speciesPanelMainContainer.classList.remove("hide");
    } else {
        speciesPanelMainContainer.classList.toggle("hide");
        if (speciesPanelMainContainer.classList.contains("hide")) {
            overlaySpeciesPanel.style.display = "none";
            body.classList.remove("fixedPanel");
            refreshURLParams();
            if (table.getBoundingClientRect().top < 0) {
                utilityButton.innerText = "\u2191";
            } else {
                utilityButton.innerText = "\u2630";
            }
        } else {
            utilityButton.innerText = "X";
            overlaySpeciesPanel.style.display = "block";
            body.classList.add("fixedPanel");
        }
    }
}
