import { LZString } from "./lz-string.js";
import { gameData } from "./state.js";

export function isSameColor(r1, g1, b1, r2, g2, b2, tolerance = 1) {
    return (
        Math.abs(r1 - r2) <= tolerance &&
        Math.abs(g1 - g2) <= tolerance &&
        Math.abs(b1 - b2) <= tolerance
    );
}

export async function spriteRemoveBgReturnBase64(speciesName, species) {
    let sprite = new Image();
    let canvas = document.createElement("canvas");
    canvas.width = 64;
    canvas.height = 64;
    sprite.crossOrigin = "anonymous";
    sprite.src = species[speciesName]["sprite"];

    const context = canvas.getContext("2d");
    context.clearRect(0, 0, canvas.width, canvas.height);

    sprite.onload = async () => {
        context.drawImage(sprite, 0, 0);
        const imageData = context.getImageData(
            0,
            0,
            canvas.width,
            canvas.height
        );
        const backgroundColor = [];
        for (let i = 0; i < 4; i++) {
            backgroundColor.push(imageData.data[i]);
        }
        let spriteDataString = "",
            repeat = 1,
            pal = [];
        for (let i = 0; i < imageData.data.length; i += 4) {
            if (
                isSameColor(
                    imageData.data[i],
                    imageData.data[i + 1],
                    imageData.data[i + 2],
                    backgroundColor[0],
                    backgroundColor[1],
                    backgroundColor[2],
                    1
                )
            ) {
                imageData.data[i + 3] = 0;
            }

            if (
                !pal.includes(
                    `${imageData.data[i]},${imageData.data[i + 1]},${imageData.data[i + 2]},${imageData.data[i + 3]}`
                )
            ) {
                pal.push(
                    `${imageData.data[i]},${imageData.data[i + 1]},${imageData.data[i + 2]},${imageData.data[i + 3]}`
                );
            }

            if (
                imageData.data[i] === imageData.data[i + 4] &&
                imageData.data[i + 1] === imageData.data[i + 5] &&
                imageData.data[i + 2] === imageData.data[i + 6] &&
                (imageData.data[i + 3] === imageData.data[i + 7] ||
                    imageData.data[i + 3] === 0)
            ) {
                repeat++;
            } else {
                spriteDataString += `&${pal.indexOf(`${imageData.data[i]},${imageData.data[i + 1]},${imageData.data[i + 2]},${imageData.data[i + 3]}`)}*${repeat}`;
                repeat = 1;
            }
        }
        context.putImageData(imageData, 0, 0);

        spriteDataString = `${canvas.width}&${canvas.height}&[${pal}]${spriteDataString}`;

        if (!localStorage.getItem(speciesName)) {
            localStorage.setItem(
                speciesName,
                LZString.compressToUTF16(spriteDataString)
            );
            gameData.sprites[speciesName] = canvas.toDataURL();
        }
        const els = document.getElementsByClassName(`sprite${speciesName}`);
        if (els.length > 0) {
            for (let i = 0; i < els.length; i++) {
                els[i].src = canvas.toDataURL();
            }
        }
    };
}

export function decodeSpriteDataString(spriteDataString) {
    let canvas = document.createElement("canvas");

    const spriteData = spriteDataString.split("&");
    canvas.width = spriteData[0];
    canvas.height = spriteData[1];
    const context = canvas.getContext("2d");
    context.clearRect(0, 0, canvas.width, canvas.height);
    const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
    const pal = JSON.parse(spriteData[2]);
    let counter = 0;

    for (let i = 1; i < spriteData.length; i++) {
        const spriteDataSplit = spriteData[i].split("*");
        for (let j = 0; j < spriteDataSplit[1]; j++) {
            imageData.data[counter] = pal[spriteDataSplit[0] * 4];
            imageData.data[counter + 1] = pal[spriteDataSplit[0] * 4 + 1];
            imageData.data[counter + 2] = pal[spriteDataSplit[0] * 4 + 2];
            imageData.data[counter + 3] = pal[spriteDataSplit[0] * 4 + 3];
            counter += 4;
        }
    }

    context.putImageData(imageData, 0, 0);

    return canvas.toDataURL();
}
