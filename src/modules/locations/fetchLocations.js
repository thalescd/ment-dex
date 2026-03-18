import { LZString } from "../../utils/lz-string.js";
import { footerP } from "../../utils/utility.js";
import { gameData, trackers } from "../../utils/state.js";

// TODO: implementar parser para wild_encounters.json do expansion
async function buildLocationsObj() {
    try {
        let locations = {};
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
            Object.keys(gameData.locations[zone][method]).forEach(
                (speciesName) => {
                    trackers.locations[counter] = {};
                    trackers.locations[counter]["key"] =
                        `${zone}\\${method}\\${speciesName}`;
                    trackers.locations[counter]["filter"] = [];
                    counter++;
                }
            );
        });
    });
}
