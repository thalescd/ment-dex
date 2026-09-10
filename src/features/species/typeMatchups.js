// Efetividade de tipo de uma especie, defensiva e ofensiva, a partir da
// tabela de tipos carregada em gameData.typeChart.

import { gameData } from "../../core/state.js";

export function getPokemonResistanceValueAgainstType(speciesObj, type) {
    if (speciesObj["type1"] !== speciesObj["type2"]) {
        if (typeof speciesObj["type3"] !== "undefined") {
            if (
                speciesObj["type3"] !== speciesObj["type1"] &&
                speciesObj["type3"] !== speciesObj["type2"]
            ) {
                return (
                    gameData.typeChart[type][speciesObj["type1"]] *
                    gameData.typeChart[type][speciesObj["type2"]] *
                    gameData.typeChart[type][speciesObj["type3"]]
                );
            }
        } else {
            return (
                gameData.typeChart[type][speciesObj["type1"]] *
                gameData.typeChart[type][speciesObj["type2"]]
            );
        }
    } else {
        if (typeof speciesObj["type3"] !== "undefined") {
            if (
                speciesObj["type3"] !== speciesObj["type1"] &&
                speciesObj["type3"] !== speciesObj["type2"]
            ) {
                return (
                    gameData.typeChart[type][speciesObj["type1"]] *
                    gameData.typeChart[type][speciesObj["type3"]]
                );
            }
        } else {
            return gameData.typeChart[type][speciesObj["type1"]];
        }
    }
}

export function getPokemonEffectivenessValueAgainstType(speciesObj, type) {
    let offensiveValue = gameData.typeChart[speciesObj["type1"]][type];
    if (
        gameData.typeChart[speciesObj["type2"]][type] >
        gameData.typeChart[speciesObj["type1"]][type]
    ) {
        offensiveValue = gameData.typeChart[speciesObj["type2"]][type];
    }
    if (typeof speciesObj["type3"] !== "undefined") {
        if (
            gameData.typeChart[speciesObj["type3"]][type] >
                gameData.typeChart[speciesObj["type1"]][type] &&
            gameData.typeChart[speciesObj["type3"]][type] >
                gameData.typeChart[speciesObj["type2"]][type]
        ) {
            offensiveValue = gameData.typeChart[speciesObj["type3"]][type];
        }
    }

    return offensiveValue;
}
