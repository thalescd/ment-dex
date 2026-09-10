// Resolve qual sprite mostrar para uma especie, usando o cache de base64.
//
// Formas cosmeticas compartilham o sprite da forma base; returnTargetSpeciesSprite
// redireciona para ela, para nao cachear a mesma imagem varias vezes.

import { gameData } from "../../core/state.js";
import { LZString } from "../../vendor/lz-string.js";
import {
    spriteRemoveBgReturnBase64,
    decodeSpriteDataString,
} from "../../core/sprites.js";

export function getSpeciesSpriteSrc(speciesName) {
    speciesName = returnTargetSpeciesSprite(speciesName);

    if (localStorage.getItem(speciesName)) {
        if (speciesName in gameData.sprites) {
            if (gameData.sprites[speciesName].length < 500) {
                localStorage.removeItem(speciesName);
                spriteRemoveBgReturnBase64(speciesName, gameData.species);
                return gameData.species[speciesName]["sprite"];
            } else {
                return gameData.sprites[speciesName];
            }
        } else {
            gameData.sprites[speciesName] = decodeSpriteDataString(
                LZString.decompressFromUTF16(localStorage.getItem(speciesName))
            );
            return gameData.sprites[speciesName];
        }
    } else {
        spriteRemoveBgReturnBase64(speciesName, gameData.species);
        return gameData.species[speciesName]["sprite"];
    }
}

export function returnTargetSpeciesSprite(speciesName) {
    if (
        gameData.species[speciesName]["forms"].length > 1 &&
        gameData.species[speciesName]["sprite"] ===
            gameData.species[gameData.species[speciesName]["forms"][0]][
                "sprite"
            ]
    ) {
        return gameData.species[speciesName]["forms"][0];
    }
    return speciesName;
}
