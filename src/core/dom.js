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
        // Nivel 0 nao existe no jogo: e o marcador de move aprendido no
        // momento em que a especie evolui para esta forma.
        if (moveMethod === 0) {
            return {
                text: "Evo",
                className: "evoLearnsets",
                title: "Learned upon evolving into this form",
            };
        }
        return {
            text: `Lv ${moveMethod}`,
            className: "levelUpLearnsets",
            title: `Learned at level ${moveMethod}`,
        };
    }
    const labels = {
        eggMovesLearnsets: {
            text: "Egg",
            className: "eggMovesLearnsets",
            title: "Egg move",
        },
        TMHMLearnsets: {
            text: "TM",
            className: "TMHMLearnsets",
            title: "Learned by TM/HM",
        },
        tutorLearnsets: {
            text: "Tutor",
            className: "tutorLearnsets",
            title: "Learned from a move tutor",
        },
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
