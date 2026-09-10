import {
    sanitizeString,
    getSpeciesSpriteSrc,
    returnTargetSpeciesSprite,
    getTextWidth,
} from "../../utils/utility.js";
import {
    trainersTableTbody,
    overlayAbilities,
    popupAbilities,
    overlay,
    body,
} from "../../utils/domRefs.js";
import { createSpeciesPanel } from "../../utils/speciesPanelUtility.js";
import { createPopupForMove } from "../moves/displayMoves.js";
import { getItemSpriteSrc, getTrainerSpriteSrc } from "./fetchScripts.js";
import { checkTrainerDifficulty } from "./trainersLogic.js";
import { gameData, uiState } from "../../utils/state.js";
import { createPopup } from "../../utils/domUtils.js";
import { MOVE_NAME_MAX_WIDTH_PX } from "../../utils/config.js";

export function appendTrainersToTable(key) {
    const zone = key.split("\\")[0];
    const trainer = key.split("\\")[1];

    if (!gameData.trainers[zone][trainer]["rematch"]) {
        const trainerMainContainer = document.createElement("table");
        trainerMainContainer.setAttribute("id", key);
        trainerMainContainer.className = "trainerTable";
        const trainerThead = document.createElement("thead");
        const formatContainer = document.createElement("th");
        formatContainer.className = "trainerFormat";
        const trainerNameContainer = document.createElement("th");
        const trainerLocation = document.createElement("th");

        let format = "Single";
        if (gameData.trainers[zone][trainer]["double"]) {
            format = "Double";
            formatContainer.classList.add("double");
        }
        formatContainer.innerText = `${format} ${checkTrainerDifficulty(zone, trainer)}`;
        trainerLocation.innerText = zone;

        const trainerSpriteContainer = document.createElement("span");
        const trainerSprite = document.createElement("img");
        trainerSprite.className = `sprite${gameData.trainers[zone][trainer]["sprite"]}`;
        trainerSprite.src = getTrainerSpriteSrc(
            gameData.trainers[zone][trainer]["sprite"]
        );
        const trainerName = document.createElement("span");
        trainerName.innerText = gameData.trainers[zone][trainer]["ingameName"];
        trainerName.className = "trainerName";
        const trainerRematchContainer = document.createElement("div");
        trainerRematchContainer.className = "trainerRematchContainer hide";
        const trainerRematch = document.createElement("button");
        trainerRematch.innerText = "1";
        trainerRematch.className = `trainerRematch activeRematch`;
        trainerRematch.name = trainer;
        if (gameData.trainers[zone][trainer]["match"]) {
            trainerRematch.classList.add("trainerRematchMatch");
        }

        trainerSpriteContainer.append(trainerSprite);
        trainerRematchContainer.append(trainerRematch);
        trainerNameContainer.append(trainerSpriteContainer);
        trainerNameContainer.append(trainerName);

        trainerThead.append(trainerRematchContainer);
        trainerThead.append(formatContainer);
        trainerThead.append(trainerNameContainer);
        trainerThead.append(trainerLocation);

        trainerMainContainer.append(trainerThead);
        trainerMainContainer.append(
            createTrainerSpeciesTbody(gameData.trainers[zone][trainer])
        );

        trainersTableTbody.append(trainerMainContainer);

        trainerRematch.addEventListener("click", () => {
            replaceTbody(key, zone, trainer);
            setActiveRematch(zone, trainer);
        });

        if (gameData.trainers[zone][trainer]["activeRematch"]) {
            setActiveRematch(zone, trainer);
        }

        return true;
    } else {
        const rematch = gameData.trainers[zone][trainer]["rematch"];
        const rematchKey = `${zone}\\${rematch}`;

        if (document.getElementById(rematchKey)) {
            const trainerRematchContainer = document
                .getElementById(rematchKey)
                .getElementsByClassName("trainerRematchContainer")[0];
            const trainerRematch = document.createElement("button");
            trainerRematch.innerText =
                trainerRematchContainer.children.length + 1;
            trainerRematch.className = `trainerRematch ${key}`;
            trainerRematch.name = trainer;
            if (gameData.trainers[zone][trainer]["match"]) {
                trainerRematch.classList.add("trainerRematchMatch");
            }

            if (!trainerRematchContainer.getElementsByClassName(key)[0]) {
                trainerRematch.addEventListener("click", () => {
                    replaceTbody(rematchKey, zone, trainer);
                    setActiveRematch(zone, trainer);
                });

                trainerRematchContainer.append(trainerRematch);
                trainerRematchContainer.classList.remove("hide");
            }

            if (gameData.trainers[zone][trainer]["activeRematch"]) {
                replaceTbody(rematchKey, zone, trainer);
                setActiveRematch(zone, trainer);
            }
        }

        return false;
    }
}

function createTrainerSpeciesTbody(trainerObj) {
    const trainerTbody = document.createElement("tbody");
    trainerTbody.className = "trainerTbody";
    let difficulty = "Normal";
    if (trainerObj["party"][uiState.trainersDifficulty]) {
        difficulty = uiState.trainersDifficulty;
    }

    for (let i = 0; i < trainerObj["party"][difficulty].length; i++) {
        const trainerSpeciesObj = trainerObj["party"][difficulty][i];
        if (gameData.species[trainerSpeciesObj["name"]]["baseSpeed"] > 0) {
            const trainerSpeciesContainer = document.createElement("td");

            const speciesSpriteContainer = document.createElement("div");
            speciesSpriteContainer.className = "trainerSpeciesSprite";
            const speciesName = trainerSpeciesObj["name"];
            const speciesSprite = document.createElement("img");
            speciesSprite.className = `sprite${returnTargetSpeciesSprite(speciesName)}`;
            speciesSprite.src = getSpeciesSpriteSrc(speciesName);
            speciesSpriteContainer.append(speciesSprite);
            trainerSpeciesContainer.append(speciesSpriteContainer);
            speciesSpriteContainer.addEventListener("click", async () => {
                await createSpeciesPanel(trainerSpeciesObj["name"]);
                document
                    .getElementById("speciesPanelMainContainer")
                    .scrollIntoView(true);
            });

            const trainerSpeciesAbility = document.createElement("div");
            trainerSpeciesAbility.innerText =
                gameData.abilities[
                    gameData.species[trainerSpeciesObj["name"]]["abilities"][
                        trainerSpeciesObj["ability"]
                    ]
                ]["ingameName"];
            trainerSpeciesAbility.className =
                "hyperlink bold trainerSpeciesAbility";
            trainerSpeciesAbility.addEventListener("click", () => {
                const abilityArray = [
                    gameData.species[trainerSpeciesObj["name"]]["abilities"][
                        trainerSpeciesObj["ability"]
                    ],
                ];
                createPopupAbility(abilityArray);
            });
            trainerSpeciesContainer.append(trainerSpeciesAbility);

            const trainerSpeciesItemContainer = document.createElement("div");
            trainerSpeciesItemContainer.classList = "flexCenterContainer";
            const trainerSpeciesItemSprite = document.createElement("img");
            trainerSpeciesItemSprite.src = getItemSpriteSrc(
                trainerSpeciesObj["item"]
            );
            trainerSpeciesItemSprite.classList = `trainerItemSprite sprite${trainerSpeciesObj["item"]}`;
            const trainerSpeciesItem = document.createElement("span");
            trainerSpeciesItem.innerText = sanitizeString(
                trainerSpeciesObj["item"]
            );
            trainerSpeciesItem.className = "bold trainerSpeciesItem";
            if (trainerSpeciesObj["item"] !== "ITEM_NONE") {
                trainerSpeciesItemContainer.classList.add("hyperlink");
                trainerSpeciesItemContainer.addEventListener("click", () => {
                    createPopupItem([trainerSpeciesObj["item"]]);
                });
            } else {
                trainerSpeciesItemSprite.style.visibility = "collapse";
            }
            trainerSpeciesItemContainer.append(trainerSpeciesItemSprite);
            trainerSpeciesItemContainer.append(trainerSpeciesItem);
            trainerSpeciesContainer.append(trainerSpeciesItemContainer);

            trainerSpeciesContainer.append(returnEVsIVsObj(trainerSpeciesObj));

            trainerSpeciesContainer.append(returnMovesObj(trainerSpeciesObj));

            trainerTbody.append(trainerSpeciesContainer);
        }
    }

    return trainerTbody;
}

function returnMovesObj(trainerSpeciesObj) {
    const trainerSpeciesMovesContainer = document.createElement("div");
    trainerSpeciesMovesContainer.className = "trainerSpeciesMovesContainer";

    for (let i = 0; i < trainerSpeciesObj["moves"].length; i++) {
        if (
            trainerSpeciesObj["moves"][i] !== "MOVE_NONE" &&
            trainerSpeciesObj["moves"][i] in gameData.moves
        ) {
            const trainerSpeciesMoveContainer = document.createElement("div");
            const trainerSpeciesMoveType = document.createElement("span");
            trainerSpeciesMoveType.innerText = sanitizeString(
                gameData.moves[trainerSpeciesObj["moves"][i]]["type"]
            ).slice(0, 3);
            trainerSpeciesMoveType.className = `backgroundSmall ${gameData.moves[trainerSpeciesObj["moves"][i]]["type"]} trainersSpeciesMoveType`;
            const trainerSpeciesMoveName = document.createElement("span");
            trainerSpeciesMoveName.className =
                "trainerSpeciesMoveName hyperlink";

            let moveName =
                gameData.moves[trainerSpeciesObj["moves"][i]]["ingameName"];
            let resized = false;
            while (getTextWidth(moveName + ".") >= MOVE_NAME_MAX_WIDTH_PX) {
                moveName = moveName.slice(0, -1);
                resized = true;
            }
            if (resized) {
                moveName = moveName + ".";
            }

            trainerSpeciesMoveName.innerText = moveName;

            trainerSpeciesMoveContainer.append(trainerSpeciesMoveType);

            trainerSpeciesMoveName.addEventListener("click", () => {
                createPopupForMove(
                    gameData.moves[trainerSpeciesObj["moves"][i]],
                    false
                );
                overlay.style.display = "flex";
                body.classList.add("fixed");
            });

            trainerSpeciesMoveContainer.append(trainerSpeciesMoveName);

            trainerSpeciesMovesContainer.append(trainerSpeciesMoveContainer);
        }
    }

    return trainerSpeciesMovesContainer;
}

function returnEVsIVsObj(trainerSpeciesObj) {
    const stats = ["HP", "Atk", "Def", "SpA", "SpD", "Spe"];
    const nature = returnNature(trainerSpeciesObj["nature"]);
    const EVs = trainerSpeciesObj["evs"];
    const IVs = trainerSpeciesObj["ivs"];

    while (EVs.length < 6) {
        EVs.push(0);
    }
    while (IVs.length < 6) {
        IVs.push(0);
    }

    const trainerSpeciesEVsIVsMainContainer =
        document.createElement("fieldset");
    trainerSpeciesEVsIVsMainContainer.classList =
        "trainerSpeciesEVsIVsMainContainer";
    const trainerSpeciesEVsIVsLegend = document.createElement("legend");
    trainerSpeciesEVsIVsLegend.innerText = `Level ${trainerSpeciesObj["lvl"]}`;
    trainerSpeciesEVsIVsMainContainer.append(trainerSpeciesEVsIVsLegend);

    for (let i = 0; i < IVs.length; i++) {
        const trainerSpeciesEVsIVsContainer = document.createElement("span");
        trainerSpeciesEVsIVsContainer.classList =
            "trainerSpeciesEVsIVsContainer";

        const trainerSpeciesStat = document.createElement("div");
        trainerSpeciesStat.innerText = stats[i];
        trainerSpeciesStat.style.fontSize = "12px";
        if (nature[0] === stats[i]) {
            trainerSpeciesStat.classList.add("buff");
        } else if (nature[1] === stats[i]) {
            trainerSpeciesStat.classList.add("nerf");
        }

        const trainerSpeciesEVs = document.createElement("div");
        trainerSpeciesEVs.innerText = EVs[i];
        if (EVs[i] === 0) {
            trainerSpeciesEVs.innerText = "-";
        }
        const trainerSpeciesIVs = document.createElement("div");
        trainerSpeciesIVs.innerText = IVs[i];
        if (IVs[i] === 0) {
            trainerSpeciesIVs.innerText = "-";
        }

        trainerSpeciesEVsIVsContainer.append(trainerSpeciesStat);
        trainerSpeciesEVsIVsContainer.append(trainerSpeciesEVs);
        trainerSpeciesEVsIVsContainer.append(trainerSpeciesIVs);
        trainerSpeciesEVsIVsMainContainer.append(trainerSpeciesEVsIVsContainer);
    }

    return trainerSpeciesEVsIVsMainContainer;
}

function returnNature(nature) {
    const natureArray = {
        NATURE_ADAMANT: ["Atk", "SpA"],
        NATURE_BASHFUL: ["-", "-"],
        NATURE_BOLD: ["Def", "Atk"],
        NATURE_BRAVE: ["Atk", "Spe"],
        NATURE_CALM: ["SpD", "Atk"],
        NATURE_CAREFUL: ["SpD", "SpA"],
        NATURE_DOCILE: ["-", "-"],
        NATURE_GENTLE: ["SpD", "Def"],
        NATURE_HARDY: ["-", "-"],
        NATURE_HASTY: ["Spe", "Def"],
        NATURE_IMPISH: ["Def", "SpA"],
        NATURE_JOLLY: ["Spe", "SpA"],
        NATURE_LAX: ["Def", "SpD"],
        NATURE_LONELY: ["Atk", "Def"],
        NATURE_MILD: ["SpA", "Def"],
        NATURE_MODEST: ["SpA", "Atk"],
        NATURE_NAIVE: ["Spe", "SpD"],
        NATURE_NAUGHTY: ["Atk", "SpD"],
        NATURE_QUIET: ["SpA", "Spe"],
        NATURE_QUIRKY: ["-", "-"],
        NATURE_RASH: ["SpA", "SpD"],
        NATURE_RELAXED: ["Def", "Spe"],
        NATURE_SASSY: ["SpD", "Spe"],
        NATURE_SERIOUS: ["-", "-"],
        NATURE_TIMID: ["Spe", "Atk"],
    };

    return natureArray[nature];
}

function createPopupAbility(abilityArray) {
    createPopup(
        abilityArray,
        (key) => gameData.abilities[key]["ingameName"],
        (key) => gameData.abilities[key]["description"],
        overlayAbilities,
        popupAbilities,
        body
    );
}

function createPopupItem(itemArray) {
    createPopup(
        itemArray,
        (key) => gameData.items[key]["ingameName"],
        (key) => gameData.items[key]["description"],
        overlayAbilities,
        popupAbilities,
        body
    );
}

function replaceTbody(key, zone, trainer) {
    const trainerEl = document.getElementById(key);
    if (trainerEl) {
        let format = "Single";

        trainerEl
            .getElementsByClassName("trainerTbody")[0]
            .replaceWith(
                createTrainerSpeciesTbody(gameData.trainers[zone][trainer])
            );
        const trainerFormat =
            trainerEl.getElementsByClassName("trainerFormat")[0];
        trainerFormat.classList.remove("double");

        if (gameData.trainers[zone][trainer]["double"]) {
            format = "Double";
            trainerFormat.classList.add("double");
        }

        trainerFormat.innerText = `${format} ${checkTrainerDifficulty(zone, trainer)}`;
    }
}

function setActiveRematch(zone, trainer) {
    let trainerName = trainer;
    if (gameData.trainers[zone][trainer]["rematch"]) {
        trainerName = gameData.trainers[zone][trainer]["rematch"];
    }
    const key = `${zone}\\${trainerName}`;

    let baseTrainer = trainer;
    if (gameData.trainers[zone][trainer]["rematch"]) {
        baseTrainer = gameData.trainers[zone][trainer]["rematch"];
    }
    if (gameData.trainers[zone][baseTrainer]["rematchArray"]) {
        delete gameData.trainers[zone][baseTrainer]["activeRematch"];
        gameData.trainers[zone][baseTrainer]["rematchArray"].forEach(
            (rematch) => {
                delete gameData.trainers[zone][rematch]["activeRematch"];
            }
        );
    }

    gameData.trainers[zone][trainer]["activeRematch"] = true;

    try {
        document
            .getElementById(key)
            .getElementsByClassName("activeRematch")[0]
            .classList.remove("activeRematch");
        document.getElementsByName(trainer)[0].classList.add("activeRematch");
    } catch (e) {
        console.warn("Failed to update rematch UI:", e.message);
    }
}
