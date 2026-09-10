// Predicado sobre o campo `filter` de uma entrada de tracker.
//
// Convencao: tableFilters.js anexa a cada filtro ativo um sufixo "@OK" ou
// "@FAIL" por linha, indicando se aquela linha passou naquele filtro. Uma
// linha e visivel quando TODOS os filtros dela terminaram em "@OK".
//
// Este modulo existe para ser folha do grafo. Antes o predicado morava em
// tableFilters.js, que importa lazyLoading de tableUtility.js — e tableUtility
// precisava do predicado de volta, fechando um ciclo entre os dois. A direcao
// certa e: quem filtra manda redesenhar; quem redesenha so precisa saber ler o
// resultado do filtro.

/**
 * @param {string[]} filterArray o campo `filter` da entrada de tracker
 * @returns {boolean} true se a linha deve aparecer
 */
export function passAllFilters(filterArray) {
    for (let i = 0; i < filterArray.length; i++) {
        if (!filterArray[i].includes("@OK")) {
            return false;
        }
    }

    return true;
}
