import { repo1 } from '../../utils/config.js';
import { LZString } from '../../utils/lz-string.js';
import { footerP } from '../../utils/utility.js';
import { gameData, trackers } from '../../utils/state.js';
import { regexWildLocations, regexRaidLocations } from './regexLocations.js';

async function getWildLocations(locations) {
    footerP("Fetching wild locations");
    const rawWildLocations = await fetch(
        `https://raw.githubusercontent.com/ydarissep/Unbound-Pokedex/refs/heads/main/src/locations/encounters.json`
    );
    const jsonWildLocations = await rawWildLocations.json();

    return regexWildLocations(jsonWildLocations, locations);
}

async function getRaidLocations(locations) {
    footerP("Fetching raid locations");
    const rawRaidLocations = await fetch(
        `https://raw.githubusercontent.com/${repo1}/src/Tables/raid_encounters.h`
    );
    const textRaidLocations = await rawRaidLocations.text();

    return regexRaidLocations(textRaidLocations, locations);
}

async function buildLocationsObj() {
    try {
        let locations = {};

        locations = await getWildLocations(locations);
        locations = await getRaidLocations(locations);

        localStorage.setItem(
            "locations",
            LZString.compressToUTF16(JSON.stringify(locations))
        );
        return locations;
    } catch (e) {
        console.error("Failed to build locations data:", e.message, e.stack);
        footerP("Error fetching locations data. Please refresh the page.");
        throw e;
    }
}

export async function fetchLocationsObj() {
    if (!localStorage.getItem("locations")) {
        gameData.locations = await buildLocationsObj();
    } else {
        gameData.locations = await JSON.parse(
            LZString.decompressFromUTF16(localStorage.getItem("locations"))
        );
    }

    let counter = 0;
    trackers.locations = [];
    Object.keys(gameData.locations).forEach((zone) => {
        Object.keys(gameData.locations[zone]).forEach((method) => {
            Object.keys(gameData.locations[zone][method]).forEach((speciesName) => {
                trackers.locations[counter] = {};
                trackers.locations[counter]["key"] =
                    `${zone}\\${method}\\${speciesName}`;
                trackers.locations[counter]["filter"] = [];
                counter++;
            });
        });
    });
}
