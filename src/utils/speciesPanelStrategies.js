import { sanitizeString, getSpeciesSpriteSrc, copyToClipboard } from './utility.js';
import { gameData } from './state.js';

function createStrategyMove(num, move) {
    const moveContainer = document.createElement("tr");
    moveContainer.className = "strategyTr";
    const moveNum = document.createElement("td");
    moveNum.className = "strategyLabel";
    const moveName = document.createElement("td");
    moveName.className = "strategyData";

    moveNum.innerText = `Move ${num + 1}:`;
    if (/\/|\(|\)/.test(move)) {
        moveName.innerText = move.trim();
    } else {
        moveName.innerText = sanitizeString(move);
    }
    moveContainer.append(moveNum);
    moveContainer.append(moveName);
    return moveContainer;
}

function createStrategyMisc(label, value, speciesName) {
    const miscContainer = document.createElement("tr");
    miscContainer.className = "strategyTr";
    const miscLabel = document.createElement("td");
    miscLabel.className = "strategyLabel";
    const miscValue = document.createElement("td");
    miscValue.className = "strategyData";

    miscLabel.innerText = `${label}:`;
    if (label === "EVs") {
        if (value) {
            for (let i = 0; i < value.length; i++) {
                if (value[i] > 0) {
                    if (miscValue.innerText !== "") {
                        miscValue.innerText += " / ";
                    }
                    if (i === 0) miscValue.innerText += `${value[i]} HP`;
                    else if (i === 1) miscValue.innerText += `${value[i]} Atk`;
                    else if (i === 2) miscValue.innerText += `${value[i]} Def`;
                    else if (i === 3) miscValue.innerText += `${value[i]} SpA`;
                    else if (i === 4) miscValue.innerText += `${value[i]} SpD`;
                    else if (i === 5) miscValue.innerText += `${value[i]} Spe`;
                }
            }
        } else {
            miscValue.innerText = `0`;
        }
    } else {
        if (/\/|\(|\)/.test(value)) {
            miscValue.innerText = value.trim();
        } else {
            miscValue.innerText = sanitizeString(value, false);
        }
    }
    miscContainer.append(miscLabel);
    miscContainer.append(miscValue);
    return miscContainer;
}

export function createSpeciesStrategy(strategy, speciesName) {
    const strategyContainer = document.createElement("div");
    const strategyName = document.createElement("h3");
    strategyName.className = "strategyName";
    const strategySpriteContainer = document.createElement("span");
    strategySpriteContainer.className = "strategySpriteContainer";
    const strategySprite = document.createElement("img");
    strategySprite.className = `miniSprite sprite${speciesName} strategySprite`;
    const strategyTagsContainer = document.createElement("div");
    strategyTagsContainer.className = "strategyTagsContainer";
    const strategyInfo = document.createElement("div");
    strategyInfo.className = "strategyInfo";
    const strategyMoves = document.createElement("div");
    strategyMoves.className = "strategyTableContainer";
    const strategyMovesTable = document.createElement("table");
    strategyMovesTable.className = "strategyTable";
    const strategyMovesTbody = document.createElement("Tbody");
    const strategyMisc = document.createElement("div");
    strategyMisc.className = "strategyTableContainer";
    const strategyMiscTable = document.createElement("table");
    strategyMiscTable.className = "strategyTable";
    const strategyMiscTbody = document.createElement("Tbody");
    const strategyCommentContainer = document.createElement("div");
    strategyCommentContainer.className = "strategyCommentContainer";
    const strategyExportButton = document.createElement("button");
    strategyExportButton.className = "strategyExportButton";
    strategyExportButton.type = "button";

    strategyName.innerText = strategy["name"];
    strategySpriteContainer.append(strategySprite);
    strategySprite.src = getSpeciesSpriteSrc(speciesName);
    strategySpriteContainer.append(strategyName);
    strategyContainer.append(strategySpriteContainer);

    if (strategy["tags"].length > 0) {
        for (let i = 0; i < strategy["tags"].length; i++) {
            const strategyTag = document.createElement("span");
            strategyTag.className = "strategyTag";
            strategyTag.innerText = strategy["tags"][i].trim();
            strategyTagsContainer.append(strategyTag);
            if (i >= 2) {
                break;
            }
        }
        strategyContainer.append(strategyTagsContainer);
    }

    strategyMoves.append(strategyMovesTable);
    strategyMovesTable.append(strategyMovesTbody);
    strategyMisc.append(strategyMiscTable);
    strategyMiscTable.append(strategyMiscTbody);

    for (let i = 0; i < strategy["moves"].length; i++) {
        strategyMovesTbody.append(createStrategyMove(i, strategy["moves"][i]));
    }
    strategyMiscTbody.append(
        createStrategyMisc("Item", strategy["item"], speciesName)
    );
    strategyMiscTbody.append(
        createStrategyMisc("Ability", strategy["ability"], speciesName)
    );
    strategyMiscTbody.append(
        createStrategyMisc("Nature", strategy["nature"], speciesName)
    );
    strategyMiscTbody.append(
        createStrategyMisc("EVs", strategy["evs"], speciesName)
    );

    for (let i = 0; i < strategy["comment"].length; i++) {
        const strategyComment = document.createElement("div");
        if (strategy["comment"][i] === "") {
            strategyComment.append(document.createElement("br"));
        } else {
            strategyComment.innerText = strategy["comment"][i];
        }
        strategyCommentContainer.append(strategyComment);
    }

    strategyExportButton.innerText = "Export";

    strategyInfo.append(strategyMoves);
    strategyInfo.append(strategyMisc);
    strategyInfo.append(strategyCommentContainer);
    strategyContainer.append(strategyInfo);

    if (strategy["paste"].length > 0) {
        strategyContainer.append(strategyExportButton);

        strategyExportButton.addEventListener("click", () => {
            let paste = "";

            for (let i = 0; i < strategy["paste"].length; i++) {
                if (strategy["paste"][i] !== "") {
                    paste += `${strategy["paste"][i]}\n`;
                }
            }

            try {
                navigator.clipboard.writeText(paste).then(() => {
                    strategyExportButton.classList.add("exportSuccess");
                    strategyExportButton.innerText = "Exported";
                });
                setTimeout(() => {
                    strategyExportButton.classList.remove("exportSuccess");
                    strategyExportButton.innerText = "Export";
                }, "3000");
            } catch (e) {
                try {
                    copyToClipboard(paste);
                    strategyExportButton.classList.add("exportSuccess");
                    strategyExportButton.innerText = "Exported";
                    setTimeout(() => {
                        strategyExportButton.classList.remove("exportSuccess");
                        strategyExportButton.innerText = "Export";
                    }, "3000");
                } catch (e) {
                    strategyExportButton.classList.add("exportFailure");
                    strategyExportButton.innerText = "Nuh uh";
                    console.log(e);
                }
            }
        });
    }

    return strategyContainer;
}
