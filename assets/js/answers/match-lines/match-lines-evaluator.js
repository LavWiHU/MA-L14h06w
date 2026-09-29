import { normalizeId } from "../../components/utils.js";

export function isMatchLinesComplete({ leftItems, leftToRightMap, leftUnique }) {
    if (leftItems.length === 0) {
        return false;
    }

    if (leftUnique) {
        return leftItems.every((item) => leftToRightMap.has(normalizeId(item.id)));
    }

    return leftToRightMap.size > 0;
}

export function evaluateMatchLinesAnswer({
                                             task,
                                             leftItems,
                                             leftToRightMap,
                                             leftElements,
                                             rightElements,
                                             leftUnique
                                         }) {
    const expectedPairs = getExpectedPairs(task);

    if (!expectedPairs) {
        return { error: "Keine Lösung definiert." };
    }

    if (!isMatchLinesComplete({ leftItems, leftToRightMap, leftUnique })) {
        return { error: "Bitte verbinde zuerst alle erforderlichen Elemente." };
    }

    const items = [];
    let correctCount = 0;

    for (const leftItem of leftItems) {
        const leftId = normalizeId(leftItem.id);
        const actualRightId = leftToRightMap.get(leftId) ?? "";
        const expectedRightId = expectedPairs.get(leftId) ?? "";
        const isCorrect = actualRightId !== "" && actualRightId === expectedRightId;

        if (isCorrect) {
            correctCount += 1;
        }

        items.push({
            leftId,
            actualRightId,
            expectedRightId,
            isCorrect,
            leftElement: leftElements.get(leftId) ?? null,
            rightElement: actualRightId ? rightElements.get(actualRightId) ?? null : null
        });
    }

    const totalCount = items.length;

    return {
        isCorrect: totalCount > 0 && correctCount === totalCount,
        correctCount,
        totalCount,
        items
    };
}

function getExpectedPairs(task) {
    const pairs = task.solution?.pairs;

    if (Array.isArray(pairs)) {
        const map = new Map();

        for (const pair of pairs) {
            if (!Array.isArray(pair) || pair.length !== 2) {
                continue;
            }

            map.set(normalizeId(pair[0]), normalizeId(pair[1]));
        }

        return map.size > 0 ? map : null;
    }

    if (pairs && typeof pairs === "object") {
        const map = new Map();

        for (const [leftId, rightId] of Object.entries(pairs)) {
            map.set(normalizeId(leftId), normalizeId(rightId));
        }

        return map.size > 0 ? map : null;
    }

    return null;
}