import { sanitizeString } from '../../utils/utility.js';
import { repo1 } from '../../utils/config.js';
import { gameData } from '../../utils/state.js';

export function initTrainer(trainers, trainer, zone) {
    if (!trainers[zone]) {
        trainers[zone] = {};
    }
    if (!trainers[zone][trainer]) {
        trainers[zone][trainer] = {};
    }
    trainers[zone][trainer]["sprite"] = "";
    trainers[zone][trainer]["ingameName"] = sanitizeString(trainer);
    trainers[zone][trainer]["items"] = [];
    trainers[zone][trainer]["double"] = false;
    trainers[zone][trainer]["party"] = {};
}

export async function regexTrainers(textTrainers) {
    const lines = textTrainers.split("\n");
    let comment = false,
        trainer = null,
        zone = null,
        conversionTable = {},
        trainerToZone = {};

    Object.keys(gameData.trainers).forEach((zone) => {
        Object.keys(gameData.trainers[zone]).forEach((trainer) => {
            trainerToZone[trainer] = zone;
        });
    });

    const rawRematch = await fetch(
        `https://raw.githubusercontent.com/${repo1}/src/battle_setup.c`
    );
    const textRematch = await rawRematch.text();

    let trainerToRematch = {};
    const rematches = textRematch.match(
        /REMATCH\(TRAINER_\w+, TRAINER_\w+, TRAINER_\w+, TRAINER_\w+/gi
    );
    rematches.forEach((rematch) => {
        const trainerMatch = rematch.match(/TRAINER_\w+/gi);
        for (let i = 1; i < trainerMatch.length; i++) {
            if (trainerMatch[i] !== trainerMatch[0]) {
                trainerToRematch[trainerMatch[i]] = trainerMatch[0];
            }
        }
    });

    lines.forEach((line) => {
        line = line.trim();
        if (/\/\*/.test(line)) {
            comment = true;
        }
        if (/\*\//.test(line)) {
            comment = false;
        }

        if (!comment && !/^\/\//.test(line)) {
            if (/\[ *TRAINER_\w+ *\]/i.test(line)) {
                trainer = line.match(/TRAINER_\w+/i)[0];
                zone = trainerToZone[trainer];
                if (trainerToRematch[trainer]) {
                    const rematch = trainerToRematch[trainer];
                    if (!zone) {
                        zone = trainerToZone[rematch];
                    }
                    if (trainer && zone && rematch) {
                        if (!gameData.trainers[zone][rematch]["rematchArray"]) {
                            gameData.trainers[zone][rematch]["rematchArray"] = [];
                        }
                        try {
                            gameData.trainers[zone][trainer]["rematch"] = rematch;
                        } catch {
                            gameData.trainers[zone][trainer] = {};
                            initTrainer(gameData.trainers, trainer, zone);
                            gameData.trainers[zone][trainer]["rematch"] = rematch;
                            trainerToZone[trainer] = zone;
                        }
                        gameData.trainers[zone][rematch]["rematchArray"].push(trainer);
                    }
                }
            }
            if (zone && gameData.trainers[zone][trainer]) {
                if (/.trainerPic *=/i.test(line)) {
                    const matchTrainerPic = line.match(/TRAINER_PIC_\w+/i);
                    if (matchTrainerPic) {
                        gameData.trainers[zone][trainer]["sprite"] = matchTrainerPic[0];
                    }
                } else if (/.trainerName *=/i.test(line)) {
                    const matchTrainerName = line.match(/_\(\"(.*)\"\)/i);
                    if (matchTrainerName) {
                        gameData.trainers[zone][trainer]["ingameName"] =
                            matchTrainerName[1];
                    }
                } else if (/.doubleBattle *=/i.test(line)) {
                    /*
                else if(/.items/i.test(line)){
                    const matchItems = line.match(/ITEM_\w+/g)
                    if(matchItems){
                        gameData.trainers[zone][trainer]["items"] = matchItems
                    }
                    else{
                        gameData.trainers[zone][trainer]["items"] = []
                    }
                }
                */
                    if (/TRUE *,/i.test(line)) {
                        gameData.trainers[zone][trainer]["double"] = true;
                    }
                } else if (/.partyInsane *=/i.test(line)) {
                    const matchParty = line.match(/sParty_\w+/i);
                    if (matchParty) {
                        conversionTable[matchParty[0]] = trainer;
                    }
                } else if (/.party *=/i.test(line)) {
                    const matchParty = line.match(/sParty_\w+/i);
                    if (matchParty) {
                        conversionTable[matchParty[0]] = trainer;
                    }
                } else if (/^} *,$/.test(line)) {
                    trainer = null;
                    zone = null;
                }
            }
        }
    });

    return [conversionTable, trainerToZone];
}

export async function regexTrainersParties(
    textTrainersParties,
    [conversionTable, trainerToZone]
) {
    const lines = textTrainersParties.split("\n");
    let comment = false,
        trainer = null,
        zone = null,
        difficulty = "Normal",
        mon = {};

    const rawTrainerSpreads = await fetch(
        `https://raw.githubusercontent.com/${repo1}/src/data/trainer_spreads.h`
    );
    const textTrainerSpreads = await rawTrainerSpreads.text();

    let spreadToStats = {};
    textTrainerSpreads
        .match(/\[SPREAD_\w+\].+?(?=.nature).+?(?=})/gs)
        .forEach((spread) => {
            const spreadMatch = spread.match(
                /\[(SPREAD_\w+)\](.+?(?=EVs).+?)((?=IVs).+?)((?=nature).*)/s
            );
            if (spreadMatch) {
                const spreadName = spreadMatch[1].match(/SPREAD_\w+/i)[0];
                spreadToStats[spreadName] = {};
                spreadToStats[spreadName]["evs"] = spreadMatch[2].match(/\d+/g);
                if (!spreadToStats[spreadName]["evs"]) {
                    spreadToStats[spreadName]["evs"] = [0];
                } else if (spreadToStats[spreadName]["evs"].length === 6) {
                    spreadToStats[spreadName]["evs"].push(
                        spreadToStats[spreadName]["evs"].splice(3, 1)[0]
                    );
                }
                spreadToStats[spreadName]["ivs"] = spreadMatch[3].match(/\d+/g);
                if (!spreadToStats[spreadName]["ivs"]) {
                    spreadToStats[spreadName]["ivs"] = [0];
                } else if (spreadToStats[spreadName]["ivs"].length === 6) {
                    spreadToStats[spreadName]["ivs"].push(
                        spreadToStats[spreadName]["ivs"].splice(3, 1)[0]
                    );
                }
                spreadToStats[spreadName]["nature"] =
                    spreadMatch[4].match(/NATURE_\w+/i)[0];
            }
        });

    lines.forEach((line) => {
        line = line.trim();

        if (/\/\*/.test(line) || line === "/*") {
            comment = true;
        }
        if (/[^\/]\*\//.test(line) || line === "*/") {
            comment = false;
        }

        if (!comment && !/^\/\//.test(line)) {
            if (/sParty_\w+/i.test(line)) {
                const party = line.match(/sParty_\w+/)[0];
                if (conversionTable[party]) {
                    trainer = conversionTable[party];
                    zone = trainerToZone[trainer];
                    if (/Insane$/.test(party)) {
                        difficulty = "Elite";
                    }
                }
            }
            if (zone && gameData.trainers[zone][trainer]) {
                if (/.lvl *=/i.test(line)) {
                    const matchLvl = line.match(/-?\d+/);
                    if (matchLvl) {
                        mon["lvl"] = matchLvl[0];
                    }
                } else if (/.species *=/i.test(line)) {
                    const matchSpecies = line.match(/SPECIES_\w+/i);
                    if (matchSpecies) {
                        mon["name"] = matchSpecies[0];
                    }
                } else if (/.heldItem *=/i.test(line)) {
                    const matchItem = line.match(/ITEM_\w+/i);
                    if (matchItem) {
                        mon["item"] = matchItem[0];
                    }
                } else if (/.ability *=/i.test(line)) {
                    const matchAbility = line.match(/\d+/);
                    if (matchAbility) {
                        mon["ability"] = matchAbility[0];
                    }
                } else if (/.moves *=/i.test(line)) {
                    const matchMoves = line.match(/MOVE_\w+/gi);
                    if (matchMoves) {
                        mon["moves"] = matchMoves;
                    }
                } else if (/.spread *=/i.test(line)) {
                    const spreadMatch = line.match(/SPREAD_\w+/i);
                    if (spreadMatch) {
                        const spreadName = spreadMatch[0];
                        if (spreadToStats[spreadName]) {
                            mon["ivs"] = spreadToStats[spreadName]["ivs"];
                            mon["evs"] = spreadToStats[spreadName]["evs"];
                            mon["nature"] = spreadToStats[spreadName]["nature"];
                        }
                    }
                } else if (/^} *,?$/.test(line)) {
                    if (mon["lvl"] && mon["name"] && mon["moves"]) {
                        if (!mon["item"]) {
                            mon["item"] = "ITEM_NONE";
                        }
                        if (!mon["ability"]) {
                            mon["ability"] = 0;
                        }
                        if (!mon["ivs"]) {
                            mon["ivs"] = [0];
                        }
                        if (!mon["evs"]) {
                            mon["evs"] = [0];
                        }
                        if (!mon["nature"]) {
                            mon["nature"] = "NATURE_DOCILE";
                        }
                        if (!gameData.trainers[zone][trainer]["party"][difficulty]) {
                            gameData.trainers[zone][trainer]["party"][difficulty] = [];
                        }
                        gameData.trainers[zone][trainer]["party"][difficulty].push(mon);
                    }
                    mon = {};
                } else if (/^} *;$/.test(line)) {
                    Object.keys(gameData.trainers[zone][trainer]["party"]).forEach(
                        (difficulty) => {
                            gameData.trainers[zone][trainer]["party"][
                                difficulty
                            ].forEach((trainerSpeciesObj) => {
                                let speciesName = trainerSpeciesObj["name"];
                                for (
                                    let i = 0;
                                    i <
                                    gameData.species[speciesName]["evolution"].length;
                                    i++
                                ) {
                                    if (
                                        gameData.species[speciesName]["evolution"][
                                            i
                                        ][0].includes("EVO_MEGA") &&
                                        gameData.species[speciesName]["evolution"][
                                            i
                                        ][1] === trainerSpeciesObj["item"]
                                    ) {
                                        trainerSpeciesObj["name"] =
                                            gameData.species[speciesName]["evolution"][
                                                i
                                            ][2];
                                    }
                                }
                            });
                        }
                    );

                    trainer = null;
                    zone = null;
                    difficulty = "Normal";
                }
            }
        }
    });
}
