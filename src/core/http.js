// Wrappers de fetch que falham alto.
//
// fetch() NAO rejeita em 404/500 — so em falha de rede. Sem checar
// response.ok, o corpo de erro ("404: Not Found") era passado adiante para os
// parsers, que devolviam {} sem reclamar.

/**
 * @param {string} url
 * @returns {Promise<Response>}
 */
async function request(url) {
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(
            `HTTP ${response.status} ${response.statusText}: ${url}`
        );
    }
    return response;
}

/**
 * @param {string} url
 * @returns {Promise<string>}
 */
export async function fetchText(url) {
    return (await request(url)).text();
}

/**
 * @param {string} url
 * @returns {Promise<any>}
 */
export async function fetchJson(url) {
    return (await request(url)).json();
}
