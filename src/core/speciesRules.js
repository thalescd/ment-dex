// Predicados puros sobre o modelo Species.
//
// Fica em core/ e nao em features/species/ porque nao depende de nada: recebe
// o objeto da especie por parametro e le apenas os campos dele, sem tocar
// gameData nem DOM. O typedef Species tambem vive em core (state.js), entao o
// modelo e as regras sobre ele estao na mesma camada — e shared/table/ pode
// usar isto sem violar a direcao das dependencias.

export function speciesCanLearnMove(speciesObj, moveName) {
    const index = [
        "levelUpLearnsets",
        "eggMovesLearnsets",
        "TMHMLearnsets",
        "tutorLearnsets",
    ];
    for (let i = 0; i < index.length; i++) {
        if (index[i] in speciesObj) {
            for (let j = 0; j < speciesObj[index[i]].length; j++) {
                if (typeof speciesObj[index[i]][j] === "object") {
                    if (speciesObj[index[i]][j][0] === moveName) {
                        if (index[i] === "levelUpLearnsets") {
                            return speciesObj[index[i]][j][1];
                        }
                        return index[i];
                    }
                } else if (typeof speciesObj[index[i]][j] === "string") {
                    if (speciesObj[index[i]][j] === moveName) {
                        return index[i];
                    }
                }
            }
        }
    }

    return false;
}
