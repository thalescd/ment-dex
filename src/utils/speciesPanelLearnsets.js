import { sanitizeString, speciesCanLearnMove } from "./utility.js";
import { createPopupForMove } from "../modules/moves/displayMoves.js";
import {
    panelSpecies,
    overlay,
    speciesPanelLevelUpFromPreviousEvoTable,
    speciesPanelLevelUpTable,
    speciesPanelTMHMTable,
    speciesPanelTutorTable,
    speciesPanelEggMovesTable,
} from "./domRefs.js";
import { gameData } from "./state.js";
import { clearChildren } from "./domUtils.js";

function sortLearnsetsArray(thead, learnsetsArray, label, asc) {
    let index = "";

    if (asc === 0) {
        thead.querySelectorAll("th").forEach((th) => {
            if (th.classList.contains("th-sort-asc")) {
                asc = 1;
                label = th.innerText;
            } else if (th.classList.contains("th-sort-desc")) {
                asc = -1;
                label = th.innerText;
            }
        });
    }

    if (asc === 0) {
        return learnsetsArray;
    }

    if (
        label === "Name" ||
        label === "Type" ||
        label === "Split" ||
        label === "Power"
    ) {
        index = label.toLowerCase();
    } else if (label === "Level") {
        index = "level";
    } else if (label === "Acc") {
        index = "accuracy";
    } else if (label === "Effect") {
        index = "description";
    } else if (label === "PP") {
        index = label.toUpperCase();
    } else {
        return learnsetsArray;
    }

    learnsetsArray.sort((a, b) => {
        let stringA = "";
        let stringB = "";

        if (index === "level") {
            stringA = parseInt(a[1]);
            stringB = parseInt(b[1]);
        } else if (Array.isArray(a)) {
            stringA += gameData.moves[a[0]][index];
            stringB += gameData.moves[b[0]][index];

            if (!isNaN(stringA)) {
                stringA = parseInt(gameData.moves[a[0]][index]);
            }
            if (!isNaN(stringB)) {
                stringB = parseInt(gameData.moves[b[0]][index]);
            }
        } else {
            stringA += gameData.moves[a][index];
            stringB += gameData.moves[b][index];

            if (!isNaN(stringA)) {
                stringA = parseInt(gameData.moves[a][index]);
            }
            if (!isNaN(stringB)) {
                stringB = parseInt(gameData.moves[b][index]);
            }
        }

        return stringA > stringB ? 1 * asc : -1 * asc;
    });

    thead.querySelectorAll("th").forEach((th) => {
        th.classList.remove("th-sort-asc", "th-sort-desc");
        if (th.innerText === label) {
            th.classList.toggle("th-sort-asc", asc > 0);
            th.classList.toggle("th-sort-desc", asc < 0);
        }
    });

    return learnsetsArray;
}

export function buildSpeciesPanelLevelUpFromPreviousEvoTable(
    table,
    name,
    label = "",
    asc = 0
) {
    let evolutionLineArray = [name];
    for (
        let i = gameData.species[name]["evolutionLine"].indexOf(name) - 1;
        i >= 0;
        i--
    ) {
        const targetSpecies = gameData.species[name]["evolutionLine"][i];
        for (
            let j = 0;
            j < gameData.species[targetSpecies]["evolution"].length;
            j++
        ) {
            if (
                evolutionLineArray.includes(
                    gameData.species[targetSpecies]["evolution"][j][2]
                ) &&
                !evolutionLineArray.includes(targetSpecies)
            ) {
                evolutionLineArray.push(targetSpecies);
            }
        }
    }

    const Tbody = table.querySelector("tbody");
    const THead = table.querySelector("thead");

    if (!Tbody || !THead) {
        return;
    }

    clearChildren(Tbody);

    let movesArray = [];

    for (let i = 1; i < evolutionLineArray.length; i++) {
        sortLearnsetsArray(
            THead,
            gameData.species[evolutionLineArray[i]]["levelUpLearnsets"],
            label,
            asc
        ).forEach((move) => {
            if (
                speciesCanLearnMove(gameData.species[name], move[0]) ===
                    false &&
                !movesArray.includes(move[0])
            ) {
                movesArray.push(move[0]);

                const row = document.createElement("tr");

                const moveName = document.createElement("td");
                moveName.innerText = gameData.moves[move[0]]["ingameName"];
                moveName.className = "bold";
                row.append(moveName);

                const typeContainer = document.createElement("td");
                const type = document.createElement("div");
                type.innerText = sanitizeString(
                    gameData.moves[move[0]]["type"]
                ).slice(0, 3);
                type.className = `${gameData.moves[move[0]]["type"]} backgroundSmall`;
                typeContainer.append(type);
                row.append(typeContainer);

                const splitContainer = document.createElement("td");
                const splitIcon = document.createElement("img");
                splitIcon.src = `assets/${gameData.moves[move[0]]["split"]}.png`;
                splitIcon.className = `${sanitizeString(gameData.moves[move[0]]["split"])} splitIcon`;
                splitContainer.append(splitIcon);
                row.append(splitContainer);

                const power = document.createElement("td");
                power.className = "speciesPanelLearnsetsPower";
                if (gameData.moves[move[0]]["power"] > 0) {
                    power.innerText = gameData.moves[move[0]]["power"];
                } else {
                    power.innerText = "-";
                }
                row.append(power);

                const accuracy = document.createElement("td");
                accuracy.className = "speciesPanelLearnsetsAccuracy";
                if (gameData.moves[move[0]]["accuracy"] > 0) {
                    accuracy.innerText = gameData.moves[move[0]]["accuracy"];
                } else {
                    accuracy.innerText = "-";
                }
                row.append(accuracy);

                const PP = document.createElement("td");
                PP.className = "speciesPanelLearnsetsPP";
                PP.innerText = gameData.moves[move[0]]["PP"];
                row.append(PP);

                const movedescription = document.createElement("td");
                movedescription.className = "speciesPanelLearnsetsEffect";
                movedescription.innerText =
                    gameData.moves[move[0]]["description"].join("");

                row.addEventListener("click", function () {
                    createPopupForMove(gameData.moves[move[0]]);
                    overlay.style.display = "flex";
                });

                row.append(movedescription);

                Tbody.append(row);
            }
        });
    }

    if (Tbody.children.length > 0) {
        table.classList.remove("hide");
    } else {
        table.classList.add("hide");
    }
}

export function buildSpeciesPanelDoubleLearnsetsTable(
    table,
    name,
    input,
    label = "",
    asc = 0
) {
    const Tbody = table.querySelector("tbody");
    const THead = table.querySelector("thead");

    if (!Tbody || !THead) {
        return;
    }

    clearChildren(Tbody);

    sortLearnsetsArray(
        THead,
        gameData.species[name][input],
        label,
        asc
    ).forEach((move) => {
        const row = document.createElement("tr");

        const level = document.createElement("td");
        level.innerText = move[1];
        row.append(level);

        const moveName = document.createElement("td");
        moveName.innerText = gameData.moves[move[0]]["ingameName"];
        moveName.className = "bold";
        row.append(moveName);

        const typeContainer = document.createElement("td");
        const type = document.createElement("div");
        type.innerText = sanitizeString(gameData.moves[move[0]]["type"]).slice(
            0,
            3
        );
        type.className = `${gameData.moves[move[0]]["type"]} backgroundSmall`;
        typeContainer.append(type);
        row.append(typeContainer);

        const splitContainer = document.createElement("td");
        const splitIcon = document.createElement("img");
        splitIcon.src = `assets/${gameData.moves[move[0]]["split"]}.png`;
        splitIcon.className = `${sanitizeString(gameData.moves[move[0]]["split"])} splitIcon`;
        splitContainer.append(splitIcon);
        row.append(splitContainer);

        const power = document.createElement("td");
        power.className = "speciesPanelLearnsetsPower";
        if (gameData.moves[move[0]]["power"] > 0) {
            power.innerText = gameData.moves[move[0]]["power"];
        } else {
            power.innerText = "-";
        }
        row.append(power);

        const accuracy = document.createElement("td");
        accuracy.className = "speciesPanelLearnsetsAccuracy";
        if (gameData.moves[move[0]]["accuracy"] > 0) {
            accuracy.innerText = gameData.moves[move[0]]["accuracy"];
        } else {
            accuracy.innerText = "-";
        }
        row.append(accuracy);

        const PP = document.createElement("td");
        PP.className = "speciesPanelLearnsetsPP";
        PP.innerText = gameData.moves[move[0]]["PP"];
        row.append(PP);

        const movedescription = document.createElement("td");
        movedescription.className = "speciesPanelLearnsetsEffect";
        movedescription.innerText =
            gameData.moves[move[0]]["description"].join("");

        row.addEventListener("click", function () {
            createPopupForMove(gameData.moves[move[0]]);
            overlay.style.display = "flex";
        });

        row.append(movedescription);

        Tbody.append(row);
    });
}

export function buildSpeciesPanelSingleLearnsetsTable(
    table,
    name,
    input,
    label = "",
    asc = 0
) {
    const Tbody = table.querySelector("tbody");
    const THead = table.querySelector("thead");

    if (!Tbody || !THead) {
        return;
    }

    clearChildren(Tbody);

    sortLearnsetsArray(
        THead,
        gameData.species[name][input],
        label,
        asc
    ).forEach((move) => {
        const row = document.createElement("tr");

        const moveName = document.createElement("td");
        moveName.innerText = gameData.moves[move]["ingameName"];
        moveName.className = "bold";
        row.append(moveName);

        const typeContainer = document.createElement("td");
        const type = document.createElement("div");
        type.innerText = sanitizeString(gameData.moves[move]["type"]).slice(
            0,
            3
        );
        type.className = `${gameData.moves[move]["type"]} backgroundSmall`;
        typeContainer.append(type);
        row.append(typeContainer);

        const splitContainer = document.createElement("td");
        const splitIcon = document.createElement("img");
        splitIcon.src = `assets/${gameData.moves[move]["split"]}.png`;
        splitIcon.className = `${sanitizeString(gameData.moves[move]["split"])} splitIcon`;
        splitContainer.append(splitIcon);
        row.append(splitContainer);

        const power = document.createElement("td");
        power.className = "speciesPanelLearnsetsPower";
        if (gameData.moves[move]["power"] > 0) {
            power.innerText = gameData.moves[move]["power"];
        } else {
            power.innerText = "-";
        }
        row.append(power);

        const accuracy = document.createElement("td");
        accuracy.className = "speciesPanelLearnsetsAccuracy";
        if (gameData.moves[move]["accuracy"] > 0) {
            accuracy.innerText = gameData.moves[move]["accuracy"];
        } else {
            accuracy.innerText = "-";
        }
        row.append(accuracy);

        const PP = document.createElement("td");
        PP.className = "speciesPanelLearnsetsPP";
        PP.innerText = gameData.moves[move]["PP"];
        row.append(PP);

        const movedescription = document.createElement("td");
        movedescription.className = "speciesPanelLearnsetsEffect";
        movedescription.innerText +=
            gameData.moves[move]["description"].join("");

        row.addEventListener("click", function () {
            createPopupForMove(gameData.moves[move]);
            overlay.style.display = "flex";
        });

        row.append(movedescription);

        Tbody.append(row);
    });
}

// Setup thead click handlers for sorting
let interval = setInterval(function () {
    if (
        document.querySelectorAll(
            "#speciesPanelLevelUpFromPreviousEvoTableTHead, #speciesPanelLevelUpTableTHead, #speciesPanelTMHMTableTHead, #speciesPanelTutorTableTHead, #speciesPanelEggMovesTableTHead"
        ).length === 0
    ) {
        return;
    }
    clearInterval(interval);

    document
        .querySelectorAll(
            "#speciesPanelLevelUpFromPreviousEvoTableTHead, #speciesPanelLevelUpTableTHead, #speciesPanelTMHMTableTHead, #speciesPanelTutorTableTHead, #speciesPanelEggMovesTableTHead"
        )
        .forEach((thead) => {
            thead.querySelectorAll("th").forEach((th) => {
                th.addEventListener("click", () => {
                    const offset = window.scrollY;
                    if (th.classList.contains("th-sort-desc")) {
                        [
                            [speciesPanelLevelUpTable, "levelUpLearnsets"],
                            [speciesPanelTMHMTable, "TMHMLearnsets"],
                            [speciesPanelTutorTable, "tutorLearnsets"],
                            [speciesPanelEggMovesTable, "eggMovesLearnsets"],
                        ].forEach((learnsets) => {
                            try {
                                if (
                                    typeof gameData.species[panelSpecies][
                                        learnsets[1]
                                    ][0] === "string"
                                ) {
                                    buildSpeciesPanelSingleLearnsetsTable(
                                        learnsets[0],
                                        panelSpecies,
                                        [learnsets[1]],
                                        th.innerText,
                                        1
                                    );
                                } else {
                                    buildSpeciesPanelDoubleLearnsetsTable(
                                        learnsets[0],
                                        panelSpecies,
                                        [learnsets[1]],
                                        th.innerText,
                                        1
                                    );
                                }
                            } catch {
                                console.log(
                                    `Error building ${learnsets[1]} for ${panelSpecies}`
                                );
                            }
                        });
                        buildSpeciesPanelLevelUpFromPreviousEvoTable(
                            speciesPanelLevelUpFromPreviousEvoTable,
                            panelSpecies,
                            th.innerText,
                            1
                        );
                    } else {
                        [
                            [speciesPanelLevelUpTable, "levelUpLearnsets"],
                            [speciesPanelTMHMTable, "TMHMLearnsets"],
                            [speciesPanelTutorTable, "tutorLearnsets"],
                            [speciesPanelEggMovesTable, "eggMovesLearnsets"],
                        ].forEach((learnsets) => {
                            try {
                                if (
                                    typeof gameData.species[panelSpecies][
                                        learnsets[1]
                                    ][0] === "string"
                                ) {
                                    buildSpeciesPanelSingleLearnsetsTable(
                                        learnsets[0],
                                        panelSpecies,
                                        [learnsets[1]],
                                        th.innerText,
                                        -1
                                    );
                                } else {
                                    buildSpeciesPanelDoubleLearnsetsTable(
                                        learnsets[0],
                                        panelSpecies,
                                        [learnsets[1]],
                                        th.innerText,
                                        -1
                                    );
                                }
                            } catch {
                                console.log(
                                    `Error building ${learnsets[1]} for ${panelSpecies}`
                                );
                            }
                        });
                        buildSpeciesPanelLevelUpFromPreviousEvoTable(
                            speciesPanelLevelUpFromPreviousEvoTable,
                            panelSpecies,
                            th.innerText,
                            -1
                        );
                    }
                    window.scroll({ top: offset });
                });
            });
        });
}, 100);
