import { sanitizeString } from '../../utils/utility.js';
import { repos } from '../../utils/config.js';
import { gameData, trackers } from '../../utils/state.js';
import { initTrainer } from './regexTrainers.js';
import { initItem } from './regexItems.js';

function initScriptsLocations(speciesName, zone, method) {
    if (!gameData.locations[zone]) {
        gameData.locations[zone] = {};
    }
    if (!gameData.locations[zone][method]) {
        gameData.locations[zone][method] = {};
    }
    if (!gameData.locations[zone][method][speciesName]) {
        gameData.locations[zone][method][speciesName] = 100;

        const counter = trackers.locations.length;
        trackers.locations[counter] = {};
        trackers.locations[counter]["key"] = `${zone}\\${method}\\${speciesName}`;
        trackers.locations[counter]["filter"] = [];
    }
}

function regexScript(
    text,
    scriptPath,
    tradeArray,
    specialFunctions,
    regexSpecialFunctions
) {
    let map = false;
    let zone = sanitizeString(
        scriptPath
            .match(/(\w+).inc/i)[1]
            .replaceAll("_", " ")
            .replace(/([A-Z])/g, " $1")
            .replace(/(\d+)/g, " $1")
            .trim()
    );

    if (/data\/maps\/(.*)\/scripts.inc/i.test(scriptPath)) {
        map = true;
        zone = scriptPath
            .match(/data\/maps\/(.*)\/scripts.inc/i)[1]
            .replaceAll("_", "")
            .replace(/([A-Z])/g, " $1")
            .replace(/(\d+)/g, " $1")
            .trim();
    }

    if (map) {
        const trainersFromScript = Array.from(
            new Set(text.match(/TRAINER_\w+/g))
        );
        for (let k = 0; k < trainersFromScript.length; k++) {
            initTrainer(gameData.trainers, trainersFromScript[k], zone);
        }

        if (/CreateEventLegalEnemyMon/i.test(text)) {
            const speciesEvent = Array.from(
                new Set(text.match(/SPECIES_\w+/g))
            );
            for (let k = 0; k < speciesEvent.length; k++) {
                initScriptsLocations(speciesEvent[k], zone, "Scripted Battle");
            }
        }

        const wildBattle = Array.from(
            new Set(text.match(/setwildbattle\w*\s*SPECIES_\w+/gi))
        );
        for (let k = 0; k < wildBattle.length; k++) {
            initScriptsLocations(
                wildBattle[k].match(/SPECIES_\w+/)[0],
                zone,
                "Scripted Battle"
            );
        }

        const tradeMatch = Array.from(new Set(text.match(/INGAME_TRADE_\w+/g)));
        for (let k = 0; k < tradeMatch.length; k++) {
            tradeArray.forEach((trade) => {
                if (trade.includes(tradeMatch[k])) {
                    const speciesName = trade.match(
                        /.species\s*=\s*(SPECIES_\w+)/i
                    );
                    if (speciesName) {
                        initScriptsLocations(speciesName[1], zone, "Trade");
                    }
                }
            });
        }
    }

    const tutorMatch = Array.from(new Set(text.match(/TUTOR_MOVE_\w+/g)));
    for (let k = 0; k < tutorMatch.length; k++) {
        const tutorName = `ITEM_${tutorMatch[k].replace("MOVE_", "")}`;
        const move = tutorMatch[k].match(/TUTOR_(MOVE_\w+)/)[1];
        initItem(tutorName);
        if (!gameData.items[tutorName]["locations"]["Tutor"]) {
            gameData.items[tutorName]["locations"]["Tutor"] = [];
        }
        gameData.items[tutorName]["url"] =
            `${repos.dexCore}/src/locations/sprites/Tutor.png`;
        if (move in gameData.moves) {
            gameData.items[tutorName]["description"] =
                gameData.moves[move]["description"].join("");
            gameData.items[tutorName]["pocket"] = "POCKET_TUTOR";
            gameData.items[tutorName]["url"] = `assets/TM_${gameData.moves[move]["type"]}.png`;
        }
        gameData.items[tutorName]["locations"]["Tutor"].push(zone);
    }

    const giveitemMatch = Array.from(
        new Set(text.match(/giveitem\s+ITEM_\w+/g))
    );
    for (let k = 0; k < giveitemMatch.length; k++) {
        const itemName = giveitemMatch[k].match(/ITEM_\w+/)[0];
        if (!gameData.items[itemName]["locations"]["Gift"]) {
            gameData.items[itemName]["locations"]["Gift"] = [];
        }
        gameData.items[itemName]["locations"]["Gift"].push(zone);
    }

    const buyitemMatch = Array.from(new Set(text.match(/.2byte\s+ITEM_\w+/g)));
    for (let k = 0; k < buyitemMatch.length; k++) {
        const itemName = buyitemMatch[k].match(/ITEM_\w+/)[0];
        if (!gameData.items[itemName]["locations"]["Buy"]) {
            gameData.items[itemName]["locations"]["Buy"] = [];
        }
        gameData.items[itemName]["locations"]["Buy"].push(zone);
    }

    if (/\s+givemon\s+|\s+giveegg\s+/i.test(text)) {
        const giveMatch = Array.from(
            new Set(text.match(/givemon\s*SPECIES_\w+|giveegg\s*SPECIES_\w+/g))
        );
        for (let k = 0; k < giveMatch.length; k++) {
            initScriptsLocations(
                giveMatch[k].match(/SPECIES_\w+/)[0],
                zone,
                "Gift"
            );
        }

        const specialFunctionMatch = Array.from(
            new Set(text.match(regexSpecialFunctions))
        );
        for (let k = 0; k < specialFunctionMatch.length; k++) {
            specialFunctions[specialFunctionMatch[k]].forEach((speciesName) => {
                initScriptsLocations(speciesName, zone, "Gift");
            });
        }
    }
}

export async function regexScripts(textScripts, tradeText, specialFunctions) {
    const tradeArray = tradeText.match(
        /INGAME_TRADE_\w+.*?.species.*?SPECIES_\w+/gis
    );
    const regexSpecialFunctions = new RegExp(
        Object.keys(specialFunctions).toString().replaceAll(",", "|"),
        "g"
    );

    const scripts = textScripts.match(/data\/.*.inc/gi);
    for (let i = 0, j = scripts.length; i < j; i++) {
        fetch(`${repos.cfru}/${scripts[i]}`).then(
            (promises) => {
                promises.text().then((text) => {
                    regexScript(
                        text,
                        scripts[i],
                        tradeArray,
                        specialFunctions,
                        regexSpecialFunctions
                    );
                });
            }
        );
    }
}

export async function regexSpecialsFunctions(textSpecials) {
    const lines = textSpecials.split("\n");
    let functionName = null;
    let functions = {};
    let counter = 0;

    lines.forEach((line) => {
        line = line.trim();
        const functionNameMatch = line.match(
            /^(?:u\d+|s\d+|bool\d+|void)\s*(\w+)\s*\(.*\)$/i
        );
        if (functionNameMatch) {
            functionName = functionNameMatch[1];
            counter = 0;
        } else if (functionName) {
            const speciesMatch = line.match(/SPECIES_\w+/g);
            if (speciesMatch) {
                speciesMatch.forEach((speciesName) => {
                    if (
                        speciesName !== "SPECIES_NONE" &&
                        speciesName !== "SPECIES_EGG" &&
                        speciesName !== "SPECIES_ZIGZAGOON"
                    ) {
                        if (!(functionName in functions)) {
                            functions[functionName] = [];
                        }
                        if (!functions[functionName].includes(speciesName)) {
                            functions[functionName].push(speciesName);
                        }
                    }
                });
            }
        }
        if (line.includes("{")) {
            counter++;
        }
        if (line.includes("}")) {
            counter--;
            if (counter <= 0) {
                functionName = null;
            }
        }
    });

    return functions;
}
