import {
    loadMatchLinePairs,
    saveMatchLinePairs
} from "./match-lines-state.js";
import { normalizeId } from "../../components/utils.js"

import {
    applyMatchLinesFeedback,
    clearMatchLinesFeedback,
    getMatchLinesTemplateParts,
    renderMatchLineItems,
    syncMatchLineColumnLayout,
    updateMatchLinesUi,
    validateMatchLinesItems
} from "./match-lines-ui.js";

import { createMatchLineDrawer } from "./match-lines-lines.js";

import {
    evaluateMatchLinesAnswer,
    isMatchLinesComplete
} from "./match-lines-evaluator.js";

export function renderMatchLinesAnswer(answerFragment, task) {
    const {
        root,
        leftColumn,
        rightColumn,
        svg
    } = getMatchLinesTemplateParts(answerFragment);

    const {
        leftItems,
        rightItems
    } = validateMatchLinesItems(task);

    const leftUnique = task.config?.leftUnique !== false;
    const rightUnique = task.config?.rightUnique !== false;

    const leftIds = new Set(leftItems.map((item) => normalizeId(item.id)));
    const rightIds = new Set(rightItems.map((item) => normalizeId(item.id)));

    const leftToRightMap = new Map();
    const rightToLeftMap = new Map();

    let selected = null;
    let drawer = null;

    const { leftElements, rightElements } = renderMatchLineItems({
        leftItems,
        rightItems,
        leftColumn,
        rightColumn,
        onPick
    });

    loadMatchLinePairs(task.id, leftIds, rightIds).forEach(([leftId, rightId]) => {
        setPair(leftId, rightId, { save: false });
    });

    root.addEventListener("click", () => {
        if (selected) {
            cancelOrDeleteSelected({ invalidSecondClick: true });
        }
    });

    drawer = createMatchLineDrawer({
        root,
        svg,
        leftElements,
        rightElements,
        leftToRightMap,
        onLineClick(leftId) {
            removeByLeft(leftId, { save: true });
            updateUiAndLines();
        }
    });

    const resizeObserver = new ResizeObserver(() => {
        syncMatchLineColumnLayout({
            leftItems,
            rightItems,
            leftColumn,
            rightColumn
        });

        drawer.scheduleRedraw();
    });

    resizeObserver.observe(root);

    updateUiAndLines();
    syncMatchLineColumnLayout({ leftItems, rightItems, leftColumn, rightColumn });
    drawer.scheduleRedraw();

    function onPick(side, id) {
        clearMatchLinesFeedback({ leftElements, rightElements });

        if (!selected) {
            selected = {
                side,
                id,
                hadConnection: side === "left"
                    ? leftToRightMap.has(id)
                    : rightToLeftMap.has(id)
            };

            updateUiAndLines();
            return;
        }

        if (selected.side === side) {
            cancelOrDeleteSelected({ invalidSecondClick: true });
            return;
        }

        const leftId = selected.side === "left" ? selected.id : id;
        const rightId = selected.side === "right" ? selected.id : id;

        setPair(leftId, rightId, { save: true });

        selected = null;
        updateUiAndLines();
    }

    function cancelOrDeleteSelected({ invalidSecondClick }) {
        if (!selected) {
            return;
        }

        if (invalidSecondClick) {
            if (selected.side === "left" && leftToRightMap.has(selected.id)) {
                removeByLeft(selected.id, { save: true });
            }

            if (selected.side === "right" && rightToLeftMap.has(selected.id)) {
                removeByRight(selected.id, { save: true });
            }
        }

        selected = null;
        updateUiAndLines();
    }

    function setPair(leftId, rightId, { save }) {
        if (leftUnique && leftToRightMap.has(leftId)) {
            removeByLeft(leftId, { save: false });
        }

        if (rightUnique && rightToLeftMap.has(rightId)) {
            removeByRight(rightId, { save: false });
        }

        leftToRightMap.set(leftId, rightId);
        rightToLeftMap.set(rightId, leftId);

        if (save) {
            saveMatchLinePairs(task.id, leftToRightMap);
        }
    }

    function removeByLeft(leftId, { save }) {
        const rightId = leftToRightMap.get(leftId);

        if (!rightId) {
            return;
        }

        leftToRightMap.delete(leftId);
        rightToLeftMap.delete(rightId);

        if (save) {
            saveMatchLinePairs(task.id, leftToRightMap);
        }
    }

    function removeByRight(rightId, { save }) {
        const leftId = rightToLeftMap.get(rightId);

        if (!leftId) {
            return;
        }

        rightToLeftMap.delete(rightId);
        leftToRightMap.delete(leftId);

        if (save) {
            saveMatchLinePairs(task.id, leftToRightMap);
        }
    }

    function updateUiAndLines() {
        updateMatchLinesUi({
            selected,
            leftToRightMap,
            rightToLeftMap,
            leftElements,
            rightElements
        });

        drawer?.scheduleRedraw();
    }

    return {
        isComplete() {
            return isMatchLinesComplete({
                leftItems,
                leftToRightMap,
                leftUnique
            });
        },

        onChange(callback) {
            root.addEventListener("click", () => {
                callback();
            });
        },

        checkAnswer() {
            return evaluateMatchLinesAnswer({
                task,
                leftItems,
                leftToRightMap,
                leftElements,
                rightElements,
                leftUnique
            });
        },

        applyCheckResult(result) {
            clearMatchLinesFeedback({ leftElements, rightElements });
            applyMatchLinesFeedback(result);
        },

        destroy() {
            resizeObserver.disconnect();
            drawer?.destroy();
        }
    };
}