import { abilitiesTableTbody, speciesButton, setTracker } from '../../utils/domRefs.js';
import { tableButtonClick } from '../../utils/tableUtility.js';
import { deleteFiltersFromTable, createFilter } from '../../utils/tableFilters.js';

export function appendAbilitiesToTable(abilitiesName) {
    if (
        !window.abilities[abilitiesName]["description"] ||
        window.abilities[abilitiesName]["description"]?.length <= 0 ||
        abilitiesName === "ABILITY_NONE"
    ) {
        return false;
    }

    let tBody = abilitiesTableTbody;

    let row = document.createElement("tr");

    row.setAttribute("id", `${abilitiesName}`);

    if (window.abilities[abilitiesName]["ID"]) {
        let abilityID = document.createElement("td");
        abilityID.className = "abilityID";
        abilityID.innerText = window.abilities[abilitiesName]["ID"];
        row.append(abilityID);
    }

    let ability = document.createElement("td");
    const abilityName = document.createElement("span");
    ability.className = "ability";
    ability.innerText = window.abilities[abilitiesName]["ingameName"];
    abilityName.className = "key hide";
    abilityName.innerText = window.abilities[abilitiesName]["name"];
    ability.append(abilityName);

    row.append(ability);

    let description = document.createElement("td");
    description.className = "description";
    description.innerText = window.abilities[abilitiesName]["description"];
    row.append(description);

    row.addEventListener("click", async () => {
        if (!speciesButton.classList.contains("activeButton")) {
            setTracker(window.speciesTracker);
            await tableButtonClick("species");
        }
        window.scrollTo({ top: 0 });
        deleteFiltersFromTable();
        createFilter(window.abilities[abilitiesName]["ingameName"], "Ability");
    });

    tBody.append(row);
    return true;
}

// Shim temporário: tableUtility.js chama via window[displayFunction]
window.appendAbilitiesToTable = appendAbilitiesToTable;
