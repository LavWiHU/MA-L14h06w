import { normalizeId } from "../../components/utils.js";

export function isClozeSelectComplete(gapSelects) {
    return gapSelects.length > 0 &&
        gapSelects.every((select) => select.value !== "");
}

export function evaluateClozeSelectAnswer({ task, gapSelects }) {
    const solutionAnswers = task.solution?.answers;

    if (!solutionAnswers || typeof solutionAnswers !== "object") {
        return { error: "Keine Lösung definiert." };
    }

    if (!isClozeSelectComplete(gapSelects)) {
        return { error: "Bitte fülle zuerst alle Lücken aus." };
    }

    const items = [];
    let correctCount = 0;

    gapSelects.forEach((select) => {
        const gapId = normalizeId(select.dataset.gapId);
        const actual = String(select.value ?? "");
        const expected = String(solutionAnswers[gapId] ?? "");

        const isCorrect = actual === expected;

        if (isCorrect) {
            correctCount += 1;
        }

        items.push({
            element: select,
            gapId,
            actual,
            expected,
            isCorrect
        });
    });

    const totalCount = items.length;

    return {
        isCorrect: totalCount > 0 && correctCount === totalCount,
        correctCount,
        totalCount,
        items
    };
}