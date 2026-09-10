import { statusMsg } from "../../core/utility.js";
import { gameData, trackers } from "../../core/state.js";
import { dataSources } from "../../core/config.js";
import { fetchJson } from "../../core/http.js";
import { loadCached } from "../../core/cache.js";

// Mapeamento de tipo de encounter para nome legivel
const METHOD_NAMES = {
    land_mons: "Land",
    water_mons: "Surfing",
    rock_smash_mons: "Rock Smash",
};

// Converter MAP_ROUTE101 → "Route 101", MAP_PETALBURG_CITY → "Petalburg City"
function formatMapName(mapKey) {
    return mapKey
        .replace(/^MAP_/, "")
        .replace(/_/g, " ")
        .toLowerCase()
        .replace(/\b\w/g, (c) => c.toUpperCase());
}

// Somar rates por species dentro de um metodo
function aggregateSlots(mons, rates) {
    const result = {};
    for (let i = 0; i < mons.length; i++) {
        const species = mons[i].species;
        const rate = rates[i] || 0;
        result[species] = (result[species] || 0) + rate;
    }
    return result;
}

async function buildLocationsObj() {
    try {
        statusMsg("Fetching locations");
        const json = await fetchJson(dataSources.wildEncountersJson);
        const locations = {};

        // Pegar o primeiro grupo (gWildMonHeaders)
        const group = json.wild_encounter_groups[0];
        if (!group) return locations;

        // Montar mapa de rates por tipo de encounter
        const ratesMap = {};
        let fishingGroups = null;
        for (const field of group.fields) {
            ratesMap[field.type] = field.encounter_rates;
            if (field.type === "fishing_mons" && field.groups) {
                fishingGroups = field.groups;
            }
        }

        // Processar cada location
        for (const encounter of group.encounters) {
            const mapName = formatMapName(encounter.map);

            // Land, Water, Rock Smash
            for (const [type, methodName] of Object.entries(METHOD_NAMES)) {
                if (!encounter[type]) continue;
                const mons = encounter[type].mons;
                const rates = ratesMap[type];
                const aggregated = aggregateSlots(mons, rates);

                if (Object.keys(aggregated).length > 0) {
                    if (!locations[mapName]) locations[mapName] = {};
                    locations[mapName][methodName] = aggregated;
                }
            }

            // Fishing — separar por rod type
            if (encounter.fishing_mons && fishingGroups) {
                const mons = encounter.fishing_mons.mons;
                const rates = ratesMap.fishing_mons;

                for (const [rodKey, slotIndices] of Object.entries(
                    fishingGroups
                )) {
                    const rodName = rodKey
                        .replace(/_/g, " ")
                        .replace(/\b\w/g, (c) => c.toUpperCase());
                    const rodMons = slotIndices.map((i) => mons[i]);
                    const rodRates = slotIndices.map((i) => rates[i]);
                    const aggregated = aggregateSlots(rodMons, rodRates);

                    if (Object.keys(aggregated).length > 0) {
                        if (!locations[mapName]) locations[mapName] = {};
                        locations[mapName][rodName] = aggregated;
                    }
                }
            }
        }

        return locations;
    } catch (e) {
        console.error("Failed to build locations data:", e.message, e.stack);
        statusMsg("Error fetching locations data. Please refresh the page.");
        throw e;
    }
}

export async function fetchLocationsObj() {
    gameData.locations = await loadCached("locations", buildLocationsObj);

    // Uma entrada de tracker por (zona, metodo, especie)
    const entries = [];
    for (const [zone, methods] of Object.entries(gameData.locations)) {
        for (const [method, speciesMap] of Object.entries(methods)) {
            for (const speciesName of Object.keys(speciesMap)) {
                entries.push({
                    key: `${zone}\\${method}\\${speciesName}`,
                    filter: [],
                });
            }
        }
    }
    trackers.locations = entries;
}
