// Event listeners e observers - modulo de side-effect (nao exporta nada)

import { appTitle, footerText } from './config.js';
import { changeSetting, manageSettings } from './settings.js';
import { sortTableByClassName, sortTableByLearnsets, filterTableInput, filterLocationsTableInput, filterTrainersTableInput, filterItemsTableInput, lazyLoading, tableButtonClick } from './tableUtility.js';
import { filterFilters } from './tableFilters.js';
import { fetchShinySprite, createSpeciesPanel, speciesPanel, createPopupForLocations, createPopupForInfo } from './speciesPanelUtility.js';
import { refreshURLParams, clearLocalStorage } from './utility.js';
import { displayHistoryObj, fetchData } from './app.js';
import {
    panelSpecies,
    historyObj,
    body,
    overlay,
    overlayAbilities,
    overlaySpeciesPanel,
    popup,
    settingsButton,
    credits,
    update,
    utilityButton,
    shinyToggle,
    speciesPanelMainContainer,
    speciesPanelInputSpecies,
    speciesPanelLocationsButton,
    speciesPanelInfoButton,
    hideLevelUpFromPreviousEvolution,
    hideLevelUp,
    hideTMHM,
    hideTutor,
    hideEggMoves,
    changelogMode,
    onlyShowChangedPokemon,
    onlyShowStrategyPokemon,
    table,
    abilitiesTable,
    movesTable,
    speciesTable,
    headerAbilitiesName,
    headerAbilitiesDescription,
    headerMovesMove,
    headerMovesType,
    headerMovesSplit,
    headerMovesPower,
    headerMovesAccuracy,
    headerMovesPP,
    headerMovesEffect,
    headerSpeciesID,
    headerSpeciesSprite,
    headerSpeciesName,
    headerSpeciesTypes,
    headerSpeciesAbilities,
    headerSpeciesInnates,
    headerSpeciesHP,
    headerSpeciesAtk,
    headerSpeciesDef,
    headerSpeciesSpA,
    headerSpeciesSpD,
    headerSpeciesSpe,
    headerSpeciesBST,
    speciesInput,
    speciesButton,
    abilitiesInput,
    abilitiesButton,
    locationsInput,
    locationsButton,
    movesInput,
    movesButton,
    trainersInput,
    trainersButton,
    itemsInput,
    itemsButton,
} from './domRefs.js';

// --- Configuracao inicial ---
document.title = appTitle;

document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("footerName").innerText = footerText;
});

// --- Settings toggle listeners ---
shinyToggle.addEventListener("click", async () => {
    fetchShinySprite(true);
});

hideLevelUpFromPreviousEvolution.addEventListener("click", () => {
    hideLevelUpFromPreviousEvolution.classList.toggle("activeSetting");
    changeSetting(
        "hideLevelUpFromPreviousEvolution",
        hideLevelUpFromPreviousEvolution.classList.contains("activeSetting")
    );
});

hideLevelUp.addEventListener("click", () => {
    hideLevelUp.classList.toggle("activeSetting");
    changeSetting(
        "hideLevelUp",
        hideLevelUp.classList.contains("activeSetting")
    );
});

hideTMHM.addEventListener("click", () => {
    hideTMHM.classList.toggle("activeSetting");
    changeSetting("hideTMHM", hideTMHM.classList.contains("activeSetting"));
});

hideTutor.addEventListener("click", () => {
    hideTutor.classList.toggle("activeSetting");
    changeSetting("hideTutor", hideTutor.classList.contains("activeSetting"));
});

hideEggMoves.addEventListener("click", () => {
    hideEggMoves.classList.toggle("activeSetting");
    changeSetting(
        "hideEggMoves",
        hideEggMoves.classList.contains("activeSetting")
    );
});

// --- Header sort listeners: Abilities ---
headerAbilitiesName.addEventListener("click", () => {
    sortTableByClassName(
        abilitiesTable,
        window.abilities,
        ["name"],
        "ability",
        (asc = headerAbilitiesName.classList.contains("th-sort-desc"))
    );
});
headerAbilitiesDescription.addEventListener("click", () => {
    sortTableByClassName(
        abilitiesTable,
        window.abilities,
        ["description"],
        "description",
        (asc = headerAbilitiesDescription.classList.contains("th-sort-desc"))
    );
});

// --- Header sort listeners: Moves ---
headerMovesMove.addEventListener("click", () => {
    sortTableByClassName(
        movesTable,
        window.moves,
        ["name"],
        "move",
        (asc = headerMovesMove.classList.contains("th-sort-desc"))
    );
});
headerMovesType.addEventListener("click", () => {
    sortTableByClassName(
        movesTable,
        window.moves,
        ["type", "split"],
        "type",
        (asc = headerMovesType.classList.contains("th-sort-desc"))
    );
});
headerMovesSplit.addEventListener("click", () => {
    sortTableByClassName(
        movesTable,
        window.moves,
        ["split", "type"],
        "split",
        (asc = headerMovesSplit.classList.contains("th-sort-desc"))
    );
});
headerMovesPower.addEventListener("click", () => {
    sortTableByClassName(
        movesTable,
        window.moves,
        ["power"],
        "power",
        (asc = headerMovesPower.classList.contains("th-sort-desc"))
    );
});
headerMovesAccuracy.addEventListener("click", () => {
    sortTableByClassName(
        movesTable,
        window.moves,
        ["accuracy"],
        "accuracy",
        (asc = headerMovesAccuracy.classList.contains("th-sort-desc"))
    );
});
headerMovesPP.addEventListener("click", () => {
    sortTableByClassName(
        movesTable,
        window.moves,
        ["PP"],
        "PP",
        (asc = headerMovesPP.classList.contains("th-sort-desc"))
    );
});
headerMovesEffect.addEventListener("click", () => {
    sortTableByClassName(
        movesTable,
        window.moves,
        ["effect"],
        "effect",
        (asc = headerMovesEffect.classList.contains("th-sort-desc"))
    );
});

// --- Header sort listeners: Species ---
headerSpeciesID.addEventListener("click", () => {
    if (window.speciesMoveFilter) {
        sortTableByLearnsets(
            (asc = !headerSpeciesID.classList.contains("th-sort-asc"))
        );
    } else {
        sortTableByClassName(
            speciesTable,
            window.species,
            ["ID"],
            "ID",
            (asc = headerSpeciesID.classList.contains("th-sort-desc"))
        );
    }
});
headerSpeciesSprite.addEventListener("click", () => {
    sortTableByClassName(
        speciesTable,
        window.species,
        ["ID"],
        "ID",
        (asc = headerSpeciesSprite.classList.contains("th-sort-desc"))
    );
});
headerSpeciesName.addEventListener("click", () => {
    sortTableByClassName(
        speciesTable,
        window.species,
        ["name"],
        "species",
        (asc = headerSpeciesName.classList.contains("th-sort-desc"))
    );
});
headerSpeciesTypes.addEventListener("click", () => {
    sortTableByClassName(
        speciesTable,
        window.species,
        ["type1", "type2"],
        "types",
        (asc = headerSpeciesTypes.classList.contains("th-sort-desc"))
    );
});
headerSpeciesAbilities.addEventListener("click", () => {
    sortTableByClassName(
        speciesTable,
        window.species,
        ["abilities"],
        "abilities",
        (asc = headerSpeciesAbilities.classList.contains("th-sort-desc"))
    );
});
headerSpeciesInnates.addEventListener("click", () => {
    sortTableByClassName(
        speciesTable,
        window.species,
        ["innates"],
        "innates",
        (asc = headerSpeciesInnates.classList.contains("th-sort-desc"))
    );
});
headerSpeciesHP.addEventListener("click", () => {
    sortTableByClassName(
        speciesTable,
        window.species,
        ["baseHP"],
        "baseHP",
        (asc = headerSpeciesHP.classList.contains("th-sort-desc"))
    );
});
headerSpeciesAtk.addEventListener("click", () => {
    sortTableByClassName(
        speciesTable,
        window.species,
        ["baseAttack"],
        "baseAttack",
        (asc = headerSpeciesAtk.classList.contains("th-sort-desc"))
    );
});
headerSpeciesDef.addEventListener("click", () => {
    sortTableByClassName(
        speciesTable,
        window.species,
        ["baseDefense"],
        "baseDefense",
        (asc = headerSpeciesDef.classList.contains("th-sort-desc"))
    );
});
headerSpeciesSpA.addEventListener("click", () => {
    sortTableByClassName(
        speciesTable,
        window.species,
        ["baseSpAttack"],
        "baseSpAttack",
        (asc = headerSpeciesSpA.classList.contains("th-sort-desc"))
    );
});
headerSpeciesSpD.addEventListener("click", () => {
    sortTableByClassName(
        speciesTable,
        window.species,
        ["baseSpDefense"],
        "baseSpDefense",
        (asc = headerSpeciesSpD.classList.contains("th-sort-desc"))
    );
});
headerSpeciesSpe.addEventListener("click", () => {
    sortTableByClassName(
        speciesTable,
        window.species,
        ["baseSpeed"],
        "baseSpeed",
        (asc = headerSpeciesSpe.classList.contains("th-sort-desc"))
    );
});
headerSpeciesBST.addEventListener("click", () => {
    sortTableByClassName(
        speciesTable,
        window.species,
        ["BST"],
        "BST",
        (asc = headerSpeciesBST.classList.contains("th-sort-desc"))
    );
});

// --- Input listeners (busca com debounce) ---
let typingTimer;
let doneTypingInterval = 300;
speciesInput.addEventListener("input", (e) => {
    clearTimeout(typingTimer);
    typingTimer = setTimeout(function () {
        const value = e.target.value;
        filterFilters(value);
        filterTableInput(value, window.species, ["name", "abilities", "innates"]);
    }, doneTypingInterval);
});
abilitiesInput.addEventListener("input", (e) => {
    clearTimeout(typingTimer);
    typingTimer = setTimeout(function () {
        const value = e.target.value;
        if (window.abilitiesIngameNameArray.includes(value)) {
            abilitiesInput.blur();
        }
        filterFilters(value);
        filterTableInput(value, window.abilities, [
            "name",
            "ingameName",
            "description",
        ]);
    }, doneTypingInterval);
});
movesInput.addEventListener("input", (e) => {
    clearTimeout(typingTimer);
    typingTimer = setTimeout(function () {
        const value = e.target.value;
        filterFilters(value);
        filterTableInput(value, window.moves, [
            "name",
            "ingameName",
            "effect",
            "description",
        ]);
    }, doneTypingInterval);
});
locationsInput.addEventListener("input", (e) => {
    clearTimeout(typingTimer);
    typingTimer = setTimeout(function () {
        const value = e.target.value;
        filterFilters(value);
        filterLocationsTableInput(value, window.species, ["evolutionLine"]);
    }, doneTypingInterval);
});
trainersInput.addEventListener("input", (e) => {
    clearTimeout(typingTimer);
    typingTimer = setTimeout(function () {
        const value = e.target.value;
        filterFilters(value);
        filterTrainersTableInput(value);
    }, doneTypingInterval);
});
itemsInput.addEventListener("input", (e) => {
    clearTimeout(typingTimer);
    typingTimer = setTimeout(function () {
        const value = e.target.value;
        filterFilters(value);
        filterItemsTableInput(value, ["description", "name"]);
    }, doneTypingInterval);
});
speciesPanelInputSpecies.addEventListener("input", async (e) => {
    const value = e.target.value;
    if (window.speciesIngameNameArray.includes(value)) {
        const panelSpeciesName = `SPECIES_${value.replaceAll(" ", "_").toUpperCase()}`;
        await createSpeciesPanel(panelSpeciesName);
        speciesPanelInputSpecies.blur();
        speciesPanelInputSpecies.value = "";
    }
});

// --- Table button listeners ---
speciesButton.addEventListener("click", async () => {
    if (!speciesButton.classList.contains("activeButton")) {
        await tableButtonClick("species");
    }
});
abilitiesButton.addEventListener("click", async () => {
    if (!abilitiesButton.classList.contains("activeButton")) {
        await tableButtonClick("abilities");
    }
});
locationsButton.addEventListener("click", async () => {
    if (!locationsButton.classList.contains("activeButton")) {
        await tableButtonClick("locations");
    }
});
movesButton.addEventListener("click", async () => {
    if (!movesButton.classList.contains("activeButton")) {
        await tableButtonClick("moves");
    }
});
trainersButton.addEventListener("click", async () => {
    if (!trainersButton.classList.contains("activeButton")) {
        await tableButtonClick("trainers");
    }
});
itemsButton.addEventListener("click", async () => {
    if (!itemsButton.classList.contains("activeButton")) {
        await tableButtonClick("items");
    }
});

// --- Changelog / Filter toggles ---
changelogMode.addEventListener("click", () => {
    changelogMode.classList.toggle("activeSetting");
    lazyLoading(true);
});

onlyShowChangedPokemon.addEventListener("click", () => {
    onlyShowChangedPokemon.classList.toggle("activeSetting");

    for (let i = 0, j = window.speciesTracker.length; i < j; i++) {
        if (onlyShowChangedPokemon.classList.contains("activeSetting")) {
            if (window.species[window.speciesTracker[i]["key"]]["changes"].length === 0) {
                window.speciesTracker[i]["filter"].push("changed");
            }
        } else {
            window.tracker[i]["filter"] = window.tracker[i]["filter"].filter(
                (value) => value !== "changed"
            );
        }
    }
    lazyLoading(true);
});
onlyShowStrategyPokemon.addEventListener("click", () => {
    onlyShowStrategyPokemon.classList.toggle("activeSetting");
    for (let i = 0, j = window.speciesTracker.length; i < j; i++) {
        if (onlyShowStrategyPokemon.classList.contains("activeSetting")) {
            if (!window.strategies[window.speciesTracker[i]["key"]]) {
                window.speciesTracker[i]["filter"].push("strategy");
            }
        } else {
            window.tracker[i]["filter"] = window.tracker[i]["filter"].filter(
                (value) => value !== "strategy"
            );
        }
    }
    lazyLoading(true);
});

// --- Species panel popup buttons ---
speciesPanelLocationsButton.addEventListener("click", () => {
    createPopupForLocations();
    overlay.style.display = "flex";
    body.classList.add("fixed");
});

speciesPanelInfoButton.addEventListener("click", () => {
    createPopupForInfo();
    overlay.style.display = "flex";
    body.classList.add("fixed");
});

// --- IntersectionObservers ---
const options = {
    root: null,
    rootMargins: "0px",
    threshold: 0,
};

function footerIsTouching(entries) {
    if (entries[0].isIntersecting) {
        lazyLoading(false);
        settingsButton.classList.remove("hide");
        credits.classList.remove("hide");
        update.classList.remove("hide");
    } else {
        settingsButton.classList.add("hide");
        credits.classList.add("hide");
        update.classList.add("hide");
    }
}

function speciesPanelIsTouching(entries) {
    if (entries[0].isIntersecting) {
        utilityButton.innerText = "X";
    } else {
        speciesPanel("hide");
        if (table.getBoundingClientRect().top < 0) {
            utilityButton.innerText = "\u2191";
        } else if (window.tableInput.getBoundingClientRect().top < 0) {
            utilityButton.innerText = "\u2630";
        }
    }
}

function tableIsTouching(entries) {
    if (
        entries[0].isIntersecting &&
        window.tableInput.getBoundingClientRect().top <= 0
    ) {
        utilityButton.innerText = "\u2630";
    } else {
        if (table.getBoundingClientRect().top < 0) {
            utilityButton.innerText = "\u2191";
        } else if (window.tableInput.getBoundingClientRect().top < 0) {
            utilityButton.innerText = "\u2630";
        }
    }
}

function CreditsIsTouching(entries) {
    if (entries[0].isIntersecting) {
        lazyLoading(false);
    }
}

const observerFooter = new IntersectionObserver(footerIsTouching, options);
observerFooter.observe(document.getElementById("footer"));

const observeTable = new IntersectionObserver(tableIsTouching, options);
observeTable.observe(document.getElementById("observerCheck"));

const observeSpeciesPanel = new IntersectionObserver(
    speciesPanelIsTouching,
    options
);
observeSpeciesPanel.observe(speciesPanelMainContainer);

const observeCredits = new IntersectionObserver(CreditsIsTouching, options);
observeCredits.observe(credits);

// --- Utility button + keyboard shortcuts ---
function utilityButtonOnClick() {
    if (utilityButton.innerText === "\u2630" && panelSpecies !== "") {
        speciesPanel("show");
        document
            .getElementById("speciesPanelMainContainer")
            .scrollIntoView(true);
    } else if (utilityButton.innerText === "X") {
        speciesPanel("hide");
    } else {
        window.scrollTo({ top: 0 });
        utilityButton.innerText = "\u2630";
    }
}

utilityButton.onclick = () => {
    utilityButtonOnClick();
};

document.addEventListener("keydown", (e) => {
    if (
        speciesPanelMainContainer.classList.contains("hide") &&
        (e.code == "F3" || (e.ctrlKey && e.code == "KeyF"))
    ) {
        e.preventDefault();
        document
            .getElementsByClassName("activeInput")[0]
            .focus({ focusVisible: true });
        document.getElementsByClassName("activeInput")[0].select();
    }
    if (e.target.nodeName !== "INPUT") {
        if (e.code === "Space") {
            e.preventDefault();
            utilityButtonOnClick();
            refreshURLParams();
        } else if (e.code === "Enter" && panelSpecies !== "") {
            speciesPanel("toggle");
            refreshURLParams();
        } else if (e.code === "Escape" || e.code === "Delete") {
            speciesPanel("hide");
            refreshURLParams();
        }
    }
});

// --- Overlay click handlers ---
overlay.addEventListener("click", function (event) {
    if (event.target === overlay) {
        overlay.style.display = "none";
        body.classList.remove("fixed");
    }
});
overlayAbilities.addEventListener("click", function (event) {
    if (event.target === overlayAbilities) {
        overlayAbilities.style.display = "none";
        body.classList.remove("fixedAbilities");
    }
});
overlaySpeciesPanel.addEventListener("click", function (event) {
    if (event.target === overlaySpeciesPanel) {
        speciesPanel("hide");
    }
});

// --- Settings popup ---
settingsButton.addEventListener("click", async () => {
    while (popup.firstChild) {
        popup.removeChild(popup.firstChild);
    }

    manageSettings();

    overlay.style.display = "flex";
    body.classList.add("fixed");
});

// --- Credits popup ---
credits.addEventListener("click", () => {
    while (popup.firstChild) {
        popup.removeChild(popup.firstChild);
    }
    const creditMainContainer = document.createElement("div");
    const creditRis = document.createElement("div");
    creditRis.className = "credits";
    creditRis.innerText = `Credit to ris (previously ris#0000 on discord) for:\n- Night theme\n- Sprite background removal function\n- Red button design\n- Species stats graph\n- Helping with CSS\n- Bitching and moaning about my CSS while this is literally my first ever website.`;
    creditMainContainer.append(creditRis);
    popup.append(creditMainContainer);

    overlay.style.display = "flex";
    body.classList.add("fixed");
});

// --- Update button ---
update.addEventListener("click", () => {
    clearLocalStorage();
    window.location.reload();
});

// --- Scroll reset on page unload ---
window.onbeforeunload = () => {
    window.scrollTo(0, 0);
};

// --- Browser history (back/forward) ---
window.addEventListener("popstate", async () => {
    historyObj.pop();
    const temp = historyObj.length;
    await displayHistoryObj(historyObj.slice(-1)[0]);
    if (historyObj.length > 0) {
        window.history.pushState(null, null, await refreshURLParams());
    } else {
        window.history.replaceState(null, null, await refreshURLParams());
    }

    while (historyObj.length > temp && temp > 0) {
        historyObj.pop();
    }
});

// --- Bootstrap: inicia o app ---
const searchParams = new URLSearchParams(window.location.search);
fetchData(searchParams);
