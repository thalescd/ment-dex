// Helpers de texto, sem dominio nenhum.

export function sanitizeString(string, removeSpecial = true) {
    const regex =
        /^SPECIES_|^TYPE_|^ABILITY_|^MOVE_TARGET_|^MOVE_|^SPLIT_|FLAG_|^EFFECT_|^Z_EFFECT_|^ITEM_|^EGG_GROUP_|^EVO_|^NATURE_|^POCKET_/gi;

    const unsanitizedString = string
        .toString()
        .replace(regex, "")
        .replaceAll(/_+/g, "_")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");
    let matchArray;
    if (removeSpecial) {
        matchArray = unsanitizedString.match(/\w+/g);
    } else {
        matchArray = unsanitizedString.match(/\S+/g);
    }
    if (matchArray) {
        for (let i = 0; i < matchArray.length; i++) {
            matchArray[i] = matchArray[i].split("_");
            for (let j = 0; j < matchArray[i].length; j++) {
                matchArray[i][j] =
                    matchArray[i][j][0].toUpperCase() +
                    matchArray[i][j].slice(1).toLowerCase();
            }
            matchArray[i] = matchArray[i].join(" ");
        }
        return matchArray.join(" ");
    } else return unsanitizedString;
}

export function getTextWidth(text) {
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");

    context.font = getComputedStyle(document.body).font;

    return context.measureText(text).width;
}
