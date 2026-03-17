import { sanitizeString } from '../../utils/utility.js';
import { repo1 } from '../../utils/config.js';
import { gameData } from '../../utils/state.js';

export function initItem(name) {
    gameData.items[name] = {};
    gameData.items[name]["name"] = name;
    gameData.items[name]["url"] = "";
    gameData.items[name]["description"] = "";
    gameData.items[name]["locations"] = {};
    gameData.items[name]["pocket"] = "";
    gameData.items[name]["price"] = 0;
    gameData.items[name]["ingameName"] = sanitizeString(name);
    gameData.items[name]["effect"] = "";
}

export async function regexItems(textItems) {
    const lines = textItems.split("\n");
    const regex = /.name|.description|.holdEffectParam|.price|.pocket/i;
    let item = null,
        conversionTable = {};

    lines.forEach((line) => {
        const regexMatch = line.match(regex);
        if (/\[\s*ITEM_\w+\s*\]/.test(line)) {
            item = line.match(/\[\s*(ITEM_\w+)\s*\]/)[1];
            initItem(item);
        } else if (regexMatch) {
            const match = regexMatch[0];
            if (match === ".name") {
                gameData.items[item]["ingameName"] = line.match(/_\("(.*)"\)/)[1];
            } else if (match === ".description") {
                const descMatch = line.match(/s\w+Desc/i);
                if (descMatch) {
                    const desc = descMatch[0];
                    if (!(desc in conversionTable)) {
                        conversionTable[desc] = [item];
                    } else {
                        conversionTable[desc].push(item);
                    }
                }
            } else if (match === ".holdEffectParam") {
                gameData.items[item]["effect"] = line.match(/=\s*(.*)\s*,/)[1];
            } else if (match === ".price") {
                gameData.items[item]["price"] = line.match(/\d+/)[0];
            } else if (match === ".pocket") {
                gameData.items[item]["pocket"] = line.match(/POCKET_\w+/)[0];
            }
        }
    });

    return conversionTable;
}

export async function regexItemDescriptions(textItemDescriptions, conversionTable) {
    const lines = textItemDescriptions.split("\n");
    let desc = null,
        description = "";

    lines.forEach((line) => {
        const descMatch = line.match(/s\w+Desc/i);
        if (descMatch) {
            desc = descMatch[0];
        } else if (/".*"/.test(line)) {
            description += line
                .match(/"(.*)"/)[1]
                .replaceAll("-\\n", "")
                .replaceAll("\\n", " ");
        }

        if (/"\s*\)\s*;/.test(line)) {
            conversionTable[desc].forEach((item) => {
                gameData.items[item]["description"] = description;
            });

            desc = null;
            description = "";
        }
    });
}

export async function regexItemIcon(textItemIconTable, textItemsIcon) {
    let iconToItem = {};

    textItemIconTable
        .match(/ITEM_\w+\s*\].*gItemIcon_\w+/gi)
        .forEach((iconMatch) => {
            const itemName = iconMatch.match(/(ITEM_\w+)\s*\]/i)[1];
            const itemIcon = iconMatch.match(/\].*(gItemIcon_\w+)/)[1];

            if (!iconToItem[itemIcon]) {
                iconToItem[itemIcon] = [];
            }

            iconToItem[itemIcon].push(itemName);
        });

    textItemsIcon.match(/gItemIcon_\w+.*?\./gi).forEach((pathMatch) => {
        const itemIcon = pathMatch.match(/gItemIcon_\w+/)[0];
        const itemPath = `${pathMatch.match(/"(.*?)\./)[1]}.png`;

        if (iconToItem[itemIcon]) {
            iconToItem[itemIcon].forEach((itemName) => {
                if (itemName in gameData.items) {
                    gameData.items[itemName]["url"] =
                        `https://raw.githubusercontent.com/${repo1}/${itemPath}`;
                    if (/gItemIcon_(?:HM|TM)$/.test(itemIcon)) {
                        const moveMatch = itemName.match(
                            /ITEM_(?:HM\d+_|TM\d+_)(\w+)/
                        );
                        if (moveMatch) {
                            const move = `MOVE_${moveMatch[1]}`;
                            if (move in gameData.moves) {
                                gameData.items[itemName]["url"] =
                                    `assets/TM_${gameData.moves[move]["type"]}.png`;
                            }
                        }
                    }
                }
            });
        }
    });
}

export async function regexItemBallSripts(textItemBallScripts, textScripts) {
    const zones = textScripts.match(/data\/.*.inc/gi).toString();

    textItemBallScripts
        .match(/\w+\s*::.*?ITEM_\w+/gis)
        .forEach((scriptMatch) => {
            const itemName = scriptMatch.match(/(?:finditem\s*)?(ITEM_\w+)/)[1];
            const scriptNameArray = scriptMatch.match(/(.*?)::/)[1].split("_");

            for (let i = 1; i < scriptNameArray.length; i++) {
                const zone = scriptNameArray.slice(0, -i).join("_");
                if (
                    zones.includes(zone) ||
                    zones.includes(zone.replaceAll("_", ""))
                ) {
                    if (!gameData.items[itemName]["locations"]["Find"]) {
                        gameData.items[itemName]["locations"]["Find"] = [];
                    }
                    gameData.items[itemName]["locations"]["Find"].push(
                        zone
                            .replaceAll("_", "")
                            .replace(/([A-Z])/g, " $1")
                            .replace(/(\d+)/g, " $1")
                            .trim()
                    );
                    break;
                }
            }
        });
}

export async function getHeldItems() {
    Object.keys(gameData.species).forEach((speciesName) => {
        if (gameData.species[speciesName]["item1"] !== "") {
            if (
                !("Held" in gameData.items[gameData.species[speciesName]["item1"]]["locations"])
            ) {
                gameData.items[gameData.species[speciesName]["item1"]]["locations"]["Held"] = [
                    "Held by wild Pokemon",
                ];
            }
        }
        if (gameData.species[speciesName]["item2"] !== "") {
            if (
                !("Held" in gameData.items[gameData.species[speciesName]["item2"]]["locations"])
            ) {
                gameData.items[gameData.species[speciesName]["item2"]]["locations"]["Held"] = [
                    "Held by wild Pokemon",
                ];
            }
        }
    });
}

export async function regexHiddenItems(textFlags) {
    const itemsKey = JSON.stringify(Object.keys(gameData.items));

    textFlags.match(/FLAG_.*FLAG_HIDDEN_ITEMS_START/g).forEach((flagMatch) => {
        const flag = flagMatch.match(/FLAG_\w+/)[0];
        const itemNameArray = flag
            .replace(/FLAG_(?:HIDDEN_ITEM_)?/, "")
            .split("_");

        regexLoop: for (let i = 0; i < itemNameArray.length; i++) {
            let itemName = itemNameArray
                .slice(i, itemNameArray.length)
                .join("_");

            const regex = [
                new RegExp(`"(ITEM_${itemName})"`, "i"),
                new RegExp(`"(ITEM_${itemName.replace(/_?\d+$/, "")})"`, "i"),
                new RegExp(
                    `"(ITEM_\\w*${itemName.replaceAll("_", "")}\\w*)"`,
                    "i"
                ),
                new RegExp(`"(ITEM_\\w*${itemName}\\w*)"`, "i"),
                new RegExp(
                    `"(ITEM_\\w*${itemName.replace(/_?\d+$/, "")}\\w*)"`,
                    "i"
                ),
            ];

            for (let j = 0; j < regex.length; j++) {
                const itemNameMatch = itemsKey.match(regex[j]);
                if (itemNameMatch) {
                    itemName = itemNameMatch[1];

                    let zone = itemNameArray.slice(0, i).join(" ");
                    if (zone === "") {
                        zone = "Unknown";
                    }

                    if (!gameData.items[itemName]["locations"]["Hidden"]) {
                        gameData.items[itemName]["locations"]["Hidden"] = [];
                    }
                    gameData.items[itemName]["locations"]["Hidden"].push(
                        sanitizeString(zone)
                    );
                    break regexLoop;
                }
            }
        }
    });
}
