import { repos } from '../../utils/config.js';
import { LZString } from '../../utils/lz-string.js';
import { footerP } from '../../utils/utility.js';
import { gameData, trackers, uiState } from '../../utils/state.js';
import { difficultyButtonContainer, trainersTableTbody, trainersInput, overlay, body } from '../../utils/domRefs.js';
import { lazyLoading, filterTrainersTableInput } from '../../utils/tableUtility.js';
import { trainerSpeciesMatchFilter } from '../../utils/tableFilters.js';
import { spriteRemoveBgReturnBase64 } from '../../utils/spriteUtils.js';
import { spriteRemoveItemBgReturnBase64 } from './displayItems.js';
import { spriteRemoveTrainerBgReturnBase64 } from './displayTrainers.js';
import { regexTrainers, regexTrainersParties } from './regexTrainers.js';
import {
    regexItems,
    regexItemDescriptions,
    regexItemIcon,
    regexItemBallSripts,
    getHeldItems,
    regexHiddenItems
} from './regexItems.js';
import { regexScripts, regexSpecialsFunctions } from './regexScriptLocations.js';

async function getScripts() {
    footerP("Fetching scripts");
    const rawScripts = await fetch(
        `${repos.cfru}/data/event_scripts.s`
    );
    const textScripts = await rawScripts.text();

    const rawTrade = await fetch(
        `${repos.cfru}/src/data/trade.h`
    );
    const tradeText = await rawTrade.text();

    const rawSpecials = await fetch(
        `${repos.cfru}/src/field_specials.c`
    );
    const textSpecials = await rawSpecials.text();

    await getItemBallSripts(textScripts);

    await regexScripts(
        textScripts,
        tradeText,
        await regexSpecialsFunctions(textSpecials)
    );
}

async function getItems() {
    footerP("Fetching items");
    const rawItems = await fetch(
        `${repos.cfru}/src/data/items.h`
    );
    const textItems = await rawItems.text();

    const descriptionConversionTable = await regexItems(textItems);

    const rawItemDescriptions = await fetch(
        `${repos.cfru}/src/data/text/item_descriptions.h`
    );
    const textItemDescriptions = await rawItemDescriptions.text();

    await regexItemDescriptions(
        textItemDescriptions,
        descriptionConversionTable
    );
}

async function getItemBallSripts(textScripts) {
    const rawItemBallSripts = await fetch(
        `${repos.cfru}/data/scripts/item_ball_scripts.inc`
    );
    const textItemBallScripts = await rawItemBallSripts.text();

    await regexItemBallSripts(textItemBallScripts, textScripts);
}

async function getHiddenItems() {
    const rawFlags = await fetch(
        `${repos.cfru}/include/constants/flags.h`
    );
    const textFlags = await rawFlags.text();

    await regexHiddenItems(textFlags);
}

async function getItemsIcon() {
    const rawItemIconTable = await fetch(
        `${repos.cfru}/src/data/item_icon_table.h`
    );
    const textItemIconTable = await rawItemIconTable.text();

    const rawItemsIcon = await fetch(
        `${repos.cfru}/src/data/graphics/items.h`
    );
    const textItemsIcon = await rawItemsIcon.text();

    await regexItemIcon(textItemIconTable, textItemsIcon);
}

async function getTrainers() {
    footerP("Fetching trainers");
    const rawTrainers = await fetch(
        `${repos.cfru}/src/data/trainers.h`
    );
    const textTrainers = await rawTrainers.text();

    const rawTrainersParties = await fetch(
        `${repos.cfru}/src/data/trainer_parties.h`
    );
    const textTrainersParties = await rawTrainersParties.text();

    await regexTrainersParties(
        textTrainersParties,
        await regexTrainers(textTrainers)
    );
}

async function buildScriptsObjs() {
    try {
        gameData.trainers = {};
        gameData.items = {};

        /*
        await getItems()

        await getScripts()

        await getTrainers()

        await Promise.all([
            getItemsIcon(),
            getHiddenItems(),
            getHeldItems(),
            bugFixTrainers()
        ])
        */

        localStorage.setItem(
            "trainers",
            LZString.compressToUTF16(JSON.stringify(gameData.trainers))
        );
        localStorage.setItem(
            "items",
            LZString.compressToUTF16(JSON.stringify(gameData.items))
        );
        localStorage.setItem(
            "locations",
            LZString.compressToUTF16(JSON.stringify(gameData.locations))
        );
    } catch (e) {
        console.error("Failed to build scripts data:", e.message, e.stack);
        footerP("Error fetching scripts data. Please refresh the page.");
        throw e;
    }
}

export async function fetchScripts() {
    if (!localStorage.getItem("trainers") || !localStorage.getItem("items")) {
        await buildScriptsObjs();
    } else {
        gameData.items = await JSON.parse(
            LZString.decompressFromUTF16(localStorage.getItem("items"))
        );
        gameData.trainers = await JSON.parse(
            LZString.decompressFromUTF16(localStorage.getItem("trainers"))
        );
    }

    trackers.items = [];
    Object.keys(gameData.items).forEach((name) => {
        if (localStorage.getItem(`${name}`)) {
            gameData.sprites[name] = LZString.decompressFromUTF16(
                localStorage.getItem(`${name}`)
            );
            if (gameData.sprites[name].length < 500) {
                localStorage.removeItem(name);
                spriteRemoveItemBgReturnBase64(name);
            }
        }
    });
    for (let i = 0, j = Object.keys(gameData.items).length; i < j; i++) {
        trackers.items[i] = {};
        trackers.items[i]["key"] = Object.keys(gameData.items)[i];
        trackers.items[i]["filter"] = [];
    }

    let counter = 0;
    trackers.trainers = [];
    Object.keys(gameData.trainers).forEach((zone) => {
        Object.keys(gameData.trainers[zone]).forEach((trainer) => {
            trackers.trainers[counter] = {};
            trackers.trainers[counter]["key"] = `${zone}\\${trainer}`;
            trackers.trainers[counter]["filter"] = [];
            counter++;

            for (let difficulty in gameData.trainers[zone][trainer]["party"]) {
                if (
                    difficulty !== "Normal" &&
                    !document.getElementById(`difficulty${difficulty}`)
                ) {
                    const newDifficulty = document.createElement("button");
                    newDifficulty.innerText = difficulty;
                    newDifficulty.className = "setting";
                    newDifficulty.setAttribute("id", `difficulty${difficulty}`);
                    newDifficulty.setAttribute("type", "button");
                    difficultyButtonContainer.append(newDifficulty);

                    newDifficulty.addEventListener("click", () => {
                        if (newDifficulty.classList.contains("activeSetting")) {
                            uiState.trainersDifficulty = "Normal";
                            newDifficulty.classList.remove("activeSetting");
                        } else {
                            for (const difficultyButton of difficultyButtonContainer.children) {
                                difficultyButton.classList.remove(
                                    "activeSetting"
                                );
                            }
                            newDifficulty.classList.add("activeSetting");
                            uiState.trainersDifficulty = newDifficulty.innerText;
                        }
                        trainerSpeciesMatchFilter(true);
                        filterTrainersTableInput(trainersInput.value);
                    });
                }
            }

            const sprite = gameData.trainers[zone][trainer]["sprite"];
            if (localStorage.getItem(sprite)) {
                gameData.sprites[sprite] = LZString.decompressFromUTF16(
                    localStorage.getItem(sprite)
                );
                if (gameData.sprites[sprite].length < 500) {
                    localStorage.removeItem(sprite);
                    spriteRemoveBgReturnBase64(
                        sprite,
                        `${repos.cfru}/graphics/trainers/front_pics/${sprite.replace(/^TRAINER_PIC_/, "").toLowerCase()}_front_pic.png`
                    );
                }
            }
        });
    });
}

export function getItemSpriteSrc(itemName) {
    if (gameData.sprites[itemName]) {
        if (gameData.sprites[itemName].length < 500) {
            localStorage.removeItem(itemName);
            spriteRemoveItemBgReturnBase64(itemName);
            return gameData.items[itemName]["url"];
        } else {
            return gameData.sprites[itemName];
        }
    } else {
        spriteRemoveItemBgReturnBase64(itemName);
        return gameData.items[itemName]["url"];
    }
}

export function getTrainerSpriteSrc(trainerSprite) {
    const url = `${repos.cfru}/graphics/trainers/front_pics/${trainerSprite.replace(/^TRAINER_PIC_/, "").toLowerCase()}_front_pic.png`;
    if (gameData.sprites[trainerSprite]) {
        if (gameData.sprites[trainerSprite].length < 500) {
            localStorage.removeItem(trainerSprite);
            spriteRemoveTrainerBgReturnBase64(trainerSprite, url);
            return url;
        } else {
            return gameData.sprites[trainerSprite];
        }
    } else {
        spriteRemoveTrainerBgReturnBase64(trainerSprite, url);
        return url;
    }
}

async function bugFixTrainers() {
    let trainerToZone = {};
    let stop = false;
    let correctZone = false;
    Object.keys(gameData.trainers).forEach((zone) => {
        Object.keys(gameData.trainers[zone]).forEach((trainer) => {
            if (!trainerToZone[trainer]) {
                trainerToZone[trainer] = zone;
            } else {
                const baseTrainerName = trainer
                    .split("_")
                    .splice(0, 2)
                    .join("_");
                const fullTrainerName = trainer
                    .split("_")
                    .slice(0, -1)
                    .join("_");
                Object.keys(gameData.trainers[zone]).forEach((trainerName) => {
                    if (
                        trainerName.split("_").splice(0, 2).join("_") ==
                            baseTrainerName &&
                        trainerName.split("_").slice(0, -1).join("_") !=
                            fullTrainerName
                    ) {
                        correctZone = trainerToZone[trainer];
                        stop = true;
                    }
                });
                if (!stop) {
                    Object.keys(gameData.trainers[trainerToZone[trainer]]).forEach(
                        (trainerName) => {
                            if (
                                trainerName.split("_").splice(0, 2).join("_") ==
                                    baseTrainerName &&
                                trainerName.split("_").slice(0, -1).join("_") !=
                                    fullTrainerName
                            ) {
                                correctZone = zone;
                            }
                        }
                    );
                }
                stop = false;
            }

            if (correctZone) {
                if (correctZone === zone) {
                    if (
                        Object.keys(gameData.trainers[zone][trainer]["party"]).length ===
                        0
                    ) {
                        gameData.trainers[zone][trainer] = JSON.parse(
                            JSON.stringify(
                                gameData.trainers[trainerToZone[trainer]][trainer]
                            )
                        );
                        delete gameData.trainers[trainerToZone[trainer]][trainer];
                    }
                } else {
                    if (
                        Object.keys(
                            gameData.trainers[trainerToZone[trainer]][trainer]["party"]
                        ).length === 0
                    ) {
                        gameData.trainers[trainerToZone[trainer]][trainer] = JSON.parse(
                            JSON.stringify(gameData.trainers[zone][trainer])
                        );
                        delete gameData.trainers[zone][trainer];
                    }
                }
                correctZone = false;
            }
        });
    });

    Object.keys(gameData.trainers).forEach((zone) => {
        let rematchObj = {};
        let sortedZoneObj = {};
        Object.keys(gameData.trainers[zone])
            .sort(function (a, b) {
                return a < b ? -1 : a > b ? 1 : 0;
            })
            .forEach((trainer) => {
                sortedZoneObj[trainer] = gameData.trainers[zone][trainer];
            });
        gameData.trainers[zone] = JSON.parse(JSON.stringify(sortedZoneObj));

        Object.keys(gameData.trainers[zone]).forEach((trainer) => {
            if (gameData.trainers[zone][trainer]["rematch"]) {
                rematchObj[trainer.split("_").slice(0, -1).join("_")] =
                    gameData.trainers[zone][trainer]["rematch"];
            } else if (
                rematchObj[trainer.split("_").slice(0, -1).join("_")] &&
                !gameData.trainers[zone][trainer]["rematch"]
            ) {
                gameData.trainers[zone][trainer]["rematch"] =
                    rematchObj[trainer.split("_").slice(0, -1).join("_")];
                gameData.trainers[zone][
                    rematchObj[trainer.split("_").slice(0, -1).join("_")]
                ]["rematchArray"].push(trainer);
            }
            if (Object.keys(gameData.trainers[zone][trainer]["party"]).length === 0) {
                delete gameData.trainers[zone][trainer];
                if (Object.keys(gameData.trainers[zone]).length === 0) {
                    delete gameData.trainers[zone];
                }
            }
        });
    });
}

