import { normalizeId } from "../../components/utils.js";

export function isImageLabelsComplete(callouts, answers) {
    if (callouts.length === 0) {
        return false;
    }

    return callouts.every((callout) => {
        const value = answers.get(normalizeId(callout.id));
        return value !== undefined && value !== null && value !== "";
    });
}

export function evaluateImageLabelsAnswer({ task, callouts, answers, inputElements }) {
    const solutionAnswers = task.solution?.answers;

    if (!solutionAnswers || typeof solutionAnswers !== "object") {
        return { error: "Keine Lösung definiert." };
    }

    const items = [];
    let correctCount = 0;

    for (const callout of callouts) {
        const calloutId = normalizeId(callout.id);
        const expected = solutionAnswers[calloutId];
        const actual = answers.get(calloutId) ?? "";
        const entry = inputElements.get(calloutId);

        if (!entry) {
            continue;
        }

        const isCorrect = String(actual) === String(expected);

        if (isCorrect) {
            correctCount += 1;
        }

        items.push({
            calloutId,
            expected: expected == null ? "" : String(expected),
            actual: String(actual),
            element: entry.select,
            isCorrect
        });
    }

    return {
        isCorrect: items.length > 0 && correctCount === items.length,
        correctCount,
        totalCount: items.length,
        items
    };
}