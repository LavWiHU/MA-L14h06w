import { loadTaskState, saveTaskState } from "../../infrastructure/local-task-store.js";
import { normalizeId } from "../../components/utils.js"

export function loadMatchLinePairs(taskId, leftIds, rightIds) {
    const savedState = loadTaskState(taskId);
    const pairs = [];

    if (!savedState || !Array.isArray(savedState.pairs)) {
        return pairs;
    }

    for (const pair of savedState.pairs) {
        if (!Array.isArray(pair) || pair.length !== 2) {
            continue;
        }

        const leftId = normalizeId(pair[0]);
        const rightId = normalizeId(pair[1]);

        if (!leftIds.has(leftId) || !rightIds.has(rightId)) {
            continue;
        }

        pairs.push([leftId, rightId]);
    }

    return pairs;
}

export function saveMatchLinePairs(taskId, leftToRightMap) {
    const pairs = Array.from(leftToRightMap.entries()).map(([leftId, rightId]) => [
        leftId,
        rightId
    ]);

    saveTaskState(taskId, { pairs });
}