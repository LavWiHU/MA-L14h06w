import {
    loadIdBoundAnswers,
    saveIdBoundAnswers
} from "../../components/utils.js";

import { renderClozeSelectMedia } from "./cloze-select-media.js";

import {
    applyClozeSelectFeedback,
    autoSizeSelect,
    clearClozeSelectFeedback,
    createClozeSelectParagraph
} from "./cloze-select-ui.js";

import {
    evaluateClozeSelectAnswer,
    isClozeSelectComplete
} from "./cloze-select-evaluator.js";

export function renderClozeSelectAnswer(answerFragment, task) {
    const root = answerFragment.querySelector("[data-cloze-select]");

    if (!root) {
        throw new Error("Answer-Template cloze-select: [data-cloze-select] fehlt");
    }

    renderClozeSelectMedia(answerFragment, task);

    const answers = loadIdBoundAnswers(task.id);

    const { paragraph, gapSelects } = createClozeSelectParagraph({
        task,
        answers,
        onAnswerChange(gapId, value) {
            answers.set(gapId, value);
            saveIdBoundAnswers(task.id, answers);
        }
    });

    root.replaceChildren(paragraph);

    requestAnimationFrame(() => {
        gapSelects.forEach(autoSizeSelect);
    });

    return {
        isComplete() {
            return isClozeSelectComplete(gapSelects);
        },

        onChange(callback) {
            gapSelects.forEach((select) => {
                select.addEventListener("change", () => {
                    clearClozeSelectFeedback(gapSelects);
                    callback();
                });
            });
        },

        checkAnswer() {
            return evaluateClozeSelectAnswer({
                task,
                gapSelects
            });
        },

        applyCheckResult(result) {
            clearClozeSelectFeedback(gapSelects);
            applyClozeSelectFeedback(result);
        }
    };
}