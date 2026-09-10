// Versao do snapshot de dados em cache.
//
// O app parseia os arquivos-fonte do pokeemerald-expansion e guarda o
// resultado no localStorage. Isto compara o SHA do upstream com o que gerou o
// cache atual, para o botao de update aparecer quando ha dado novo.

import { expansionApiRef } from "./config.js";

export function clearLocalStorage() {
    Object.keys(localStorage).forEach((key) => {
        if (
            key !== "speciesPanelHistory" &&
            key !== "itemsLocations" &&
            !/settings/i.test(key)
        ) {
            localStorage.removeItem(key);
        }
    });
}

export async function checkForUpdates(updateBtn) {
    try {
        const response = await fetch(expansionApiRef);
        if (!response.ok) return;
        const data = await response.json();
        const remoteSha = data.object.sha;
        sessionStorage.setItem("pendingSha", remoteSha);
        const localSha = localStorage.getItem("expansionSha");
        if (!localSha) {
            localStorage.setItem("expansionSha", remoteSha);
        } else if (localSha !== remoteSha) {
            updateBtn.classList.add("updateAvailable");
        }
    } catch {
        // silently fail — não bloqueia o app se a API estiver indisponível
    }
}
