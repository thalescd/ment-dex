/**
 * Shared DOM utility functions to reduce code duplication.
 */

export function clearChildren(element) {
    while (element.firstChild) {
        element.removeChild(element.firstChild);
    }
}

export function getMoveMethodLabel(moveMethod) {
    if (Number.isInteger(moveMethod)) {
        return { text: `Lv ${moveMethod}`, className: "levelUpLearnsets" };
    }
    const labels = {
        eggMovesLearnsets: { text: "Egg", className: "eggMovesLearnsets" },
        TMHMLearnsets: { text: "TM", className: "TMHMLearnsets" },
        tutorLearnsets: { text: "Tutor", className: "tutorLearnsets" },
    };
    return labels[moveMethod] || null;
}

export function createPopup(
    dataArray,
    getNameFn,
    getDescriptionFn,
    overlayEl,
    popupEl,
    bodyEl
) {
    overlayEl.style.display = "flex";
    bodyEl.classList.add("fixedAbilities");

    clearChildren(popupEl);

    const mainContainer = document.createElement("ul");

    for (let i = 0; i < dataArray.length; i++) {
        const container = document.createElement("li");
        const name = document.createElement("span");
        name.innerText = `${getNameFn(dataArray[i])}: `;
        name.className = "bold";
        const description = document.createElement("span");
        description.innerText = getDescriptionFn(dataArray[i]);
        container.append(name);
        container.append(description);
        mainContainer.append(container);
        if (i < dataArray.length - 1) {
            mainContainer.appendChild(document.createElement("br"));
        }
    }

    popupEl.append(mainContainer);
}
