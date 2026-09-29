import { getTextAnswerTextarea } from "./text-ui.js";
import {
    evaluateTextAnswer,
    isTextAnswerComplete
} from "./text-evaluator.js";

export function renderTextAnswer(answerFragment, task) {
    const textarea = getTextAnswerTextarea(answerFragment, task);

    return {
        isComplete() {
            return isTextAnswerComplete(textarea);
        },

        onChange(callback) {
            textarea.addEventListener("input", callback);
        },

        checkAnswer() {
            return evaluateTextAnswer({
                task,
                textarea
            });
        },

        applyCheckResult() {
            // bewusst leer – keine automatische Bewertung
        }
    };
}