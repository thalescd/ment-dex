// Efetividade defensiva de tipo de uma especie, a partir da tabela de tipos
// carregada em gameData.typeChart.

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
