import {
    applySingleChoiceFeedback,
    clearSingleChoiceFeedback,
    renderSingleChoiceOptions
} from "./single-choice-ui.js";

import {
    evaluateSingleChoiceAnswer,
    isSingleChoiceComplete
} from "./single-choice-evaluator.js";

export function renderSingleChoiceAnswer(answerFragment, task) {
    const { fieldset, inputName } = renderSingleChoiceOptions({
        answerFragment,
        task
    });

    return {
        isComplete() {
            return isSingleChoiceComplete({
                fieldset,
                inputName
            });
        },

        onChange(callback) {
            fieldset.addEventListener("change", () => {
                clearSingleChoiceFeedback(fieldset);
                callback();
            });
        },

        checkAnswer() {
            return evaluateSingleChoiceAnswer({
                task,
                fieldset,
                inputName
            });
        },

        applyCheckResult(result) {
            clearSingleChoiceFeedback(fieldset);
            applySingleChoiceFeedback(result);
        }
    };
}