// Registro das tabelas: nome da tabela -> como renderizar uma linha dela.
//
// Este modulo e uma FOLHA do grafo de imports de proposito. Antes ele importava
// os seis modulos de display, e tableUtility.js importava ele — o que fechava um
// ciclo entre a infra de tabela e todos os displays. Agora quem conhece as
// features e o orquestrador (app.js), que registra cada tabela na inicializacao.
//
// Trocar o dispatch por nome tambem elimina a derivacao por string que existia
// aqui: o nome da funcao era montado a partir do id do elemento HTML
// ("speciesTableTbody" -> "SpeciesToTable" -> "appendSpeciesToTable"), passando
// por sanitizeString e por um replace do literal "tabletbody". Qualquer rename
// de id, de funcao, ou mudanca na capitalizacao quebrava em runtime.

import { LAZY_LOAD_BATCH_SIZE } from "../../core/config.js";

/**
 * @typedef {Object} TableConfig
 * @property {(key: string) => boolean|void} append renderiza uma linha
 * @property {number} batchSize quantas linhas por rodada de lazy load
 * @property {boolean} useShowFlag respeita tracker[i].show alem dos filtros
 * @property {boolean} groupByMap ao atingir o batch, completa o mapa corrente
 */

/** @type {Map<string, TableConfig>} */
const tables = new Map();

/**
 * @param {string} name nome da tabela, ex. "species" (id do tbody e
 *   `${name}TableTbody`)
 * @param {{ append: (key: string) => boolean|void, batchSize?: number,
 *   useShowFlag?: boolean, groupByMap?: boolean }} config
 */
export function registerTable(name, config) {
    tables.set(name, {
        batchSize: LAZY_LOAD_BATCH_SIZE,
        useShowFlag: false,
        groupByMap: false,
        ...config,
    });
}

/**
 * @param {string} name
 * @returns {TableConfig}
 */
export function getTable(name) {
    const table = tables.get(name);
    if (!table) {
        throw new Error(
            `displayRegistry: nenhuma tabela registrada com o nome "${name}"`
        );
    }
    return table;
}
