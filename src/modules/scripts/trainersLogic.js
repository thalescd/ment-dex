// Regras de dominio de trainers, sem DOM.
//
// Estas duas funcoes viviam em displayTrainers.js, mas nao desenham nada: sao
// predicados sobre gameData/trackers. Como tableUtility.js e tableFilters.js
// tambem precisavam delas, o import criava dois ciclos
// (infra de tabela <-> modulo de display). Aqui elas sao uma folha do grafo.

import { gameData, trackers, uiState } from "../../utils/state.js";

export function checkTrainerDifficulty(zone, trainer) {
    if (gameData.trainers[zone][trainer]["party"][uiState.trainersDifficulty]) {
        return uiState.trainersDifficulty;
    } else {
        return "Normal";
    }
}

export function showRematch() {
    for (let i = 0, j = trackers.trainers.length; i < j; i++) {
        const zone = trackers.trainers[i]["key"].split("\\")[0];
        const trainer = trackers.trainers[i]["key"].split("\\")[1];
        if (
            (gameData.trainers[zone][trainer]["rematch"] ||
                gameData.trainers[zone][trainer]["rematchArray"]) &&
            trackers.trainers[i]["filter"].length === 0
        ) {
            let rememberI = i;
            let baseTrainer = trainer;
            if (gameData.trainers[zone][trainer]["rematch"]) {
                baseTrainer = gameData.trainers[zone][trainer]["rematch"];
            }
            //setActiveRematch(zone, trainer)
            if (gameData.trainers[zone][baseTrainer]["rematchArray"]) {
                const rematchArray =
                    gameData.trainers[zone][baseTrainer]["rematchArray"].concat(
                        baseTrainer
                    );
                for (let k = 0; k < rematchArray.length; k++) {
                    if (
                        i - k > 0 &&
                        rematchArray.includes(
                            trackers.trainers[i - k]["key"].split("\\")[1]
                        )
                    ) {
                        trackers.trainers[i - k]["show"] = true;
                    }
                    if (
                        i + k < j &&
                        rematchArray.includes(
                            trackers.trainers[i + k]["key"].split("\\")[1]
                        )
                    ) {
                        trackers.trainers[i + k]["show"] = true;
                        rememberI = i + k + 1;
                    }
                }
                i = rememberI;
            }
        }
    }
}
