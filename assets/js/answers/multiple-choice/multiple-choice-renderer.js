import {
    applyMultipleChoiceFeedback,
    clearMultipleChoiceFeedback,
    renderMultipleChoiceOptions
} from "./multiple-choice-ui.js";

import {
    evaluateMultipleChoiceAnswer,
    isMultipleChoiceComplete
} from "./multiple-choice-evaluator.js";

export function renderMultipleChoiceAnswer(answerFragment, task) {
    const { fieldset, inputName } = renderMultipleChoiceOptions({
        answerFragment,
        task
    });

    return {
        isComplete() {
            return isMultipleChoiceComplete({
                fieldset,
                inputName
            });
        },

        onChange(callback) {
            fieldset.addEventListener("change", () => {
                clearMultipleChoiceFeedback(fieldset);
                callback();
            });
        },

        checkAnswer() {
            return evaluateMultipleChoiceAnswer({
                task,
                fieldset,
                inputName
            });
        },

        applyCheckResult(result) {
            clearMultipleChoiceFeedback(fieldset);
            applyMultipleChoiceFeedback(result);
        }
    };
}