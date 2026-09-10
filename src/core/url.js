// Sincroniza a URL com o estado visivel: tabela ativa, filtros, painel aberto.
//
// Le referencias de DOM do painel de especies, o que e uma amarra conhecida:
// a URL descreve a UI inteira, entao esta funcao precisa saber o que esta
// aberto. As refs vem de core/domRefs.js, entao nao cruza camada.

import {
    speciesPanelMainContainer,
    panelSpecies,
    historyObj,
} from "./domRefs.js";

export function refreshURLParams() {
    const url = document.location.href.split("?")[0] + "?";
    let params = "";

    if (!speciesPanelMainContainer.classList.contains("hide")) {
        params += `species=${panelSpecies}&`;
    } else if (document.getElementsByClassName("activeTable").length > 0) {
        const activeTable =
            document.getElementsByClassName("activeTable")[0].id;
        if (activeTable !== "speciesTable") {
            params += `table=${document.getElementsByClassName("activeTable")[0].id}&`;
        }
        if (
            document
                .getElementsByClassName("activeFilter")[0]
                .getElementsByClassName("filter").length > 0
        ) {
            params += "filter=";
            const filters = document
                .getElementsByClassName("activeFilter")[0]
                .getElementsByClassName("filter");
            for (let i = 0, j = filters.length; i < j; i++) {
                if (!/>|<|=/.test(filters[i].innerText)) {
                    const param = filters[i].innerText.split(":");
                    params += `${param[0]}:${param[1].trim()}:`;
                    params += filters[i].parentNode.children[0].value;
                    if (i !== j - 1) {
                        params += ",";
                    }
                }
            }
            params += "&";
        }
        if (document.getElementsByClassName("activeInput")[0].value !== "") {
            params += `input=${document.getElementsByClassName("activeInput")[0].value}&`;
        }
    }

    getHistoryState();
    window.history.replaceState(`${url}${params}`, null, `${url}${params}`);
    return `${url}${params}`;
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
