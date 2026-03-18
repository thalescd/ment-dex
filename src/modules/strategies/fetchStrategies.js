import { repos } from '../../utils/config.js';
import { LZString } from '../../utils/lz-string.js';
import { footerP } from '../../utils/utility.js';
import { gameData } from '../../utils/state.js';
import { regexStrategies } from './regexStrategies.js';

async function getStrategies(strategies) {
    footerP("Fetching strategies");
    const rawStrategies = await fetch(
        `${repos.strats}/data/dex-strategy.md`
    );
    const textStrategies = await rawStrategies.text();

    return regexStrategies(textStrategies, strategies);
}

async function buildStrategiesObj() {
    let strategies = {};

    try {
        /*await Promise.all([
            getStrategies(strategies)
        ])*/
    } catch (e) {
        console.error("Failed to fetch strategies:", e.message, e.stack);
    }

    //await localStorage.setItem("strategies", LZString.compressToUTF16(JSON.stringify(strategies)))
    return strategies;
}

export async function fetchStrategiesObj() {
    if (!localStorage.getItem("strategies"))
        gameData.strategies = await buildStrategiesObj();
    else
        gameData.strategies = await JSON.parse(
            LZString.decompressFromUTF16(localStorage.getItem("strategies"))
        );
}
