// Cache em localStorage para os objetos de dados do jogo.
//
// O app parseia arquivos-fonte do pokeemerald-expansion, o que e caro, entao o
// resultado e cacheado. O risco e cachear um resultado RUIM: um build vazio
// gravado aqui fazia o app pular o rebuild para sempre, deixando a dex vazia
// mesmo depois de recarregar. Por isso nada vazio e persistido, e cache
// corrompido cai no rebuild em vez de derrubar o load.

import { LZString } from "./lz-string.js";

/**
 * Le do cache; se nao houver nada utilizavel, chama build() e persiste.
 * @template T
 * @param {string} key chave no localStorage
 * @param {() => Promise<T>} build constroi os dados do zero
 * @returns {Promise<T>}
 */
export async function loadCached(key, build) {
    const cached = readCache(key);
    if (cached !== null) return cached;

    const data = await build();
    writeCache(key, data);
    return data;
}

/**
 * @param {string} key
 * @returns {any} os dados, ou null se ausente/vazio/corrompido
 */
export function readCache(key) {
    const raw = localStorage.getItem(key);
    if (!raw) return null;

    try {
        const data = JSON.parse(LZString.decompressFromUTF16(raw));
        if (isUsable(data)) return data;
        console.warn(`Cache "${key}" estava vazio; descartando.`);
    } catch (e) {
        console.warn(`Cache "${key}" corrompido; descartando.`, e);
    }
    localStorage.removeItem(key);
    return null;
}

/**
 * Persiste os dados, exceto se estiverem vazios.
 * @param {string} key
 * @param {any} data
 */
export function writeCache(key, data) {
    if (!isUsable(data)) {
        console.warn(`Recusando cachear "${key}": resultado vazio.`);
        return;
    }
    try {
        localStorage.setItem(
            key,
            LZString.compressToUTF16(JSON.stringify(data))
        );
    } catch (e) {
        // QuotaExceededError e afins: nao poder cachear nao deve quebrar o app
        console.warn(`Nao foi possivel cachear "${key}".`, e);
    }
}

/** @param {any} data */
function isUsable(data) {
    if (!data || typeof data !== "object") return false;
    return Object.keys(data).length > 0;
}
