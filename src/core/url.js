// Sincroniza a URL com o estado visivel: tabela ativa, filtros, painel aberto.
//
// Le referencias de DOM do painel de especies, o que e uma amarra conhecida:
// a URL descreve a UI inteira, entao esta funcao precisa saber o que esta
// aberto. As refs vem de core/domRefs.js, entao nao cruza camada.

import { speciesPanelMainContainer } from "./domRefs.js";
import { historyObj, panelSpecies } from "./state.js";

export function refreshURLParams() {
    const url = document.location.href.split("?")[0] + "?";
    // URLSearchParams codifica: um "&" ou "#" na busca nao quebra mais a URL.
    const params = new URLSearchParams();

    if (!speciesPanelMainContainer.classList.contains("hide")) {
        params.set("species", panelSpecies);
    } else if (document.getElementsByClassName("activeTable").length > 0) {
        const activeTable =
            document.getElementsByClassName("activeTable")[0].id;
        if (activeTable !== "speciesTable") {
            params.set("table", activeTable);
        }
        const filters = document
            .getElementsByClassName("activeFilter")[0]
            .getElementsByClassName("filter");
        const filterParams = [];
        for (const filter of filters) {
            if (!/>|<|=/.test(filter.innerText)) {
                const param = filter.innerText.split(":");
                filterParams.push(
                    `${param[0]}:${param[1].trim()}:${filter.parentNode.children[0].value}`
                );
            }
        }
        if (filterParams.length > 0) {
            params.set("filter", filterParams.join(","));
        }
        const input = document.getElementsByClassName("activeInput")[0].value;
        if (input !== "") {
            params.set("input", input);
        }
    }

    getHistoryState();
    const full = `${url}${params}`;
    window.history.replaceState(full, null, full);
    return full;
}

// Helper privado de refreshURLParams: monta o objeto de estado do history.
function getHistoryState() {
    const historyStateObj = {};
    if (!speciesPanelMainContainer.classList.contains("hide")) {
        historyStateObj["species"] = panelSpecies;
    }
    if (document.getElementsByClassName("activeTable").length > 0) {
        historyStateObj["table"] =
            document.getElementsByClassName("activeTable")[0].id;
    }
    if (document.getElementsByClassName("filter").length > 0) {
        historyStateObj["filter"] = {};
        const filters = document.getElementsByClassName("filter");
        for (let i = 0, j = filters.length; i < j; i++) {
            const table = filters[i].parentElement.id.replace(
                "FilterContainer",
                ""
            );
            if (!(table in historyStateObj["filter"])) {
                historyStateObj["filter"][table] = [];
            }
            historyStateObj["filter"][table].push(filters[i].innerText);
        }
    }

    if (
        JSON.stringify(historyObj.slice(-1)[0]) !==
        JSON.stringify(historyStateObj)
    ) {
        historyObj.push(historyStateObj);
    }
}
