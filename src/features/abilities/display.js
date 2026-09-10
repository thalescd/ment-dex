import { gameData, trackers } from "../../core/state.js";
import {
    abilitiesTableTbody,
    speciesButton,
    setTracker,
} from "../../core/domRefs.js";
import { tableButtonClick } from "../../shared/table/table.js";
import {
    deleteFiltersFromTable,
    createFilter,
} from "../../shared/table/filters.js";

export function appendAbilitiesToTable(abilitiesName) {
    if (
        !gameData.abilities[abilitiesName]["description"] ||
        gameData.abilities[abilitiesName]["description"]?.length <= 0 ||
        abilitiesName === "ABILITY_NONE"
    ) {
        return false;
    }

    const tBody = abilitiesTableTbody;

    const row = document.createElement("tr");

    row.setAttribute("id", `${abilitiesName}`);

    if (gameData.abilities[abilitiesName]["ID"]) {
        const abilityID = document.createElement("td");
        abilityID.className = "abilityID";
        abilityID.innerText = gameData.abilities[abilitiesName]["ID"];
        row.append(abilityID);
    }

    const ability = document.createElement("td");
    const abilityName = document.createElement("span");
    ability.className = "ability";
    ability.innerText = gameData.abilities[abilitiesName]["ingameName"];
    abilityName.className = "key hide";
    abilityName.innerText = gameData.abilities[abilitiesName]["name"];
    ability.append(abilityName);

    row.append(ability);

    const description = document.createElement("td");
    description.className = "description";
    description.innerText = gameData.abilities[abilitiesName]["description"];
    row.append(description);

    row.addEventListener("click", async () => {
        if (!speciesButton.classList.contains("activeButton")) {
            setTracker(trackers.species);
            await tableButtonClick("species");
        }
        window.scrollTo({ top: 0 });
        deleteFiltersFromTable();
        createFilter(
            gameData.abilities[abilitiesName]["ingameName"],
            "Ability"
        );
    });

    tBody.append(row);
    return true;
}
