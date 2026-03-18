import { getSpeciesSpriteSrc, returnTargetSpeciesSprite } from "./utility.js";
import { panelSpecies, speciesPanelHistoryContainer } from "./domRefs.js";
import { gameData, uiState } from "./state.js";
import { clearChildren } from "./domUtils.js";
import { MAX_PANEL_HISTORY, LOCK_SPECIES_TIMEOUT_MS } from "./config.js";
import { createSpeciesPanel } from "./speciesPanelUtility.js";

// Initialize history from localStorage
if (localStorage.getItem("speciesPanelHistory")) {
    uiState.speciesPanelHistory = JSON.parse(
        localStorage.getItem("speciesPanelHistory")
    );
} else {
    uiState.speciesPanelHistory = [];
}

function updateSpeciesPanelHistoryOrder() {
    for (let i = 0; i < uiState.speciesPanelHistory.length; i++) {
        if (uiState.speciesPanelHistory[i][1] === true) {
            for (let j = i; j > 0; j--) {
                if (uiState.speciesPanelHistory[j - 1][1] === true) {
                    break;
                } else {
                    const temp = uiState.speciesPanelHistory[j - 1];
                    uiState.speciesPanelHistory[j - 1] =
                        uiState.speciesPanelHistory[j];
                    uiState.speciesPanelHistory[j] = temp;
                }
            }
        }
    }
    localStorage.setItem(
        "speciesPanelHistory",
        JSON.stringify(uiState.speciesPanelHistory)
    );
    displaySpeciesPanelHistory();
}

function displaySpeciesPanelHistory() {
    clearChildren(speciesPanelHistoryContainer);

    for (let i = 0; i < uiState.speciesPanelHistory.length; i++) {
        const spriteContainer = document.createElement("span");
        const sprite = document.createElement("img");
        const speciesName = uiState.speciesPanelHistory[i][0];

        spriteContainer.className = "historyAnimation";
        sprite.src = getSpeciesSpriteSrc(speciesName);
        sprite.className = `sprite${returnTargetSpeciesSprite(speciesName)}`;
        if (uiState.speciesPanelHistory[i][1] === true) {
            spriteContainer.classList.add("locked");
        }
        if (speciesName === panelSpecies) {
            spriteContainer.classList.add("historyActive");
        }

        spriteContainer.append(sprite);
        speciesPanelHistoryContainer.append(spriteContainer);

        let lockTimer = 0;
        let clickTimer = 0;
        async function historyHandler(event, preventDefault = true) {
            if (preventDefault) {
                event.preventDefault();
            }
            if (event.type === "mousedown" || event.type === "mouseup") {
                if (event.which === 2 || event.which === 3) {
                    // if right click or mousewheel
                    return false;
                }
            }
            if (event.type === "mousedown" || event.type === "touchstart") {
                spriteContainer.classList.add("clicked");
                spriteContainer.classList.add("emulateClick");
                lockTimer = setTimeout(lockSpecies, LOCK_SPECIES_TIMEOUT_MS);
                clickTimer = setTimeout(emulateClick, 300);
            } else if (event.type === "mouseup" || event.type === "touchend") {
                spriteContainer.classList.remove("clicked");
                clearTimeout(lockTimer);
                if (
                    spriteContainer.classList.contains("emulateClick") &&
                    panelSpecies !== speciesName
                ) {
                    await createSpeciesPanel(speciesName);
                }
            }
        }

        function lockSpecies() {
            spriteContainer.classList.toggle("locked");
            if (uiState.speciesPanelHistory[i][1] === false) {
                uiState.speciesPanelHistory[i][1] = true;
            } else {
                uiState.speciesPanelHistory[i][1] = false;
            }
            updateSpeciesPanelHistoryOrder();
        }

        function emulateClick() {
            spriteContainer.classList.remove("emulateClick");
        }

        spriteContainer.addEventListener("touchstart", (event) => {
            historyHandler(event);
        });
        spriteContainer.addEventListener("touchend", (event) => {
            historyHandler(event);
        });
        spriteContainer.addEventListener("mousedown", (event) => {
            historyHandler(event);
        });
        spriteContainer.addEventListener("mouseup", (event) => {
            historyHandler(event);
        });
        document.body.addEventListener("mouseup", (event) => {
            historyHandler(event, false);
        });
    }
}

export async function manageSpeciesPanelHistory(speciesName) {
    for (let i = 0; i < uiState.speciesPanelHistory.length; i++) {
        if (
            !(uiState.speciesPanelHistory[i][0] in gameData.species) ||
            gameData.species[uiState.speciesPanelHistory[i][0]]["baseSpeed"] ===
                0
        ) {
            uiState.speciesPanelHistory.splice(i, 1);
            i--;
        }
    }

    if (
        speciesPanelHistoryContainer.children.length !=
        uiState.speciesPanelHistory.length
    ) {
        displaySpeciesPanelHistory();
    }

    for (let i = 0; i < speciesPanelHistoryContainer.children.length; i++) {
        speciesPanelHistoryContainer.children[i].classList.remove(
            "historyActive"
        );
        if (
            speciesPanelHistoryContainer.children[i].querySelector(
                `.sprite${speciesName}`
            )
        ) {
            speciesPanelHistoryContainer.children[i].classList.add(
                "historyActive"
            );
        }
    }

    const maxHistory = MAX_PANEL_HISTORY;
    let index = -1;
    let locked = 0;
    for (let i = 0; i < uiState.speciesPanelHistory.length; i++) {
        if (uiState.speciesPanelHistory[i][1] === true) {
            locked++;
        } else if (index < 0) {
            index = i;
        }
    }

    if (
        locked >= maxHistory ||
        uiState.speciesPanelHistory.some((el) => el[0] === speciesName)
    ) {
        return;
    }

    for (let i = 0; i < uiState.speciesPanelHistory.length; i++) {
        if (
            gameData.species[uiState.speciesPanelHistory[i][0]][
                "evolutionLine"
            ].includes(speciesName) ||
            gameData.species[uiState.speciesPanelHistory[i][0]][
                "forms"
            ].includes(speciesName)
        ) {
            uiState.speciesPanelHistory[i][0] = speciesName;
            for (let j = i; j > locked; j--) {
                const temp = uiState.speciesPanelHistory[j - 1];
                uiState.speciesPanelHistory[j - 1] =
                    uiState.speciesPanelHistory[j];
                uiState.speciesPanelHistory[j] = temp;
            }
            displaySpeciesPanelHistory();
            localStorage.setItem(
                "speciesPanelHistory",
                JSON.stringify(uiState.speciesPanelHistory)
            );
            return;
        }
    }

    if (index < 0) {
        index = locked;
    }

    uiState.speciesPanelHistory.splice(index, 0, [speciesName, false]);
    while (uiState.speciesPanelHistory.length > maxHistory) {
        uiState.speciesPanelHistory.splice(-1, 1);
    }
    displaySpeciesPanelHistory();
    localStorage.setItem(
        "speciesPanelHistory",
        JSON.stringify(uiState.speciesPanelHistory)
    );
}
