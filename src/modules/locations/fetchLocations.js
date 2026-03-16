import { repo1 } from '../../utils/config.js';
import { LZString } from '../../utils/lz-string.js';
import { footerP } from '../../utils/utility.js';
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
    let locations = {};

    locations = await getWildLocations(locations);
    locations = await getRaidLocations(locations);

    localStorage.setItem(
        "locations",
        LZString.compressToUTF16(JSON.stringify(locations))
    );
    return locations;
}

export async function fetchLocationsObj() {
    if (!localStorage.getItem("locations")) {
        window.locations = await buildLocationsObj();
    } else {
        window.locations = await JSON.parse(
            LZString.decompressFromUTF16(localStorage.getItem("locations"))
        );
    }

    let counter = 0;
    window.locationsTracker = [];
    Object.keys(window.locations).forEach((zone) => {
        Object.keys(window.locations[zone]).forEach((method) => {
            Object.keys(window.locations[zone][method]).forEach((speciesName) => {
                window.locationsTracker[counter] = {};
                window.locationsTracker[counter]["key"] =
                    `${zone}\\${method}\\${speciesName}`;
                window.locationsTracker[counter]["filter"] = [];
                counter++;
            });
        });
    });
}
