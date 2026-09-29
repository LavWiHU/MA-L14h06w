export function getTextAnswerTextarea(answerFragment, task) {
    const textarea = answerFragment.querySelector("textarea[data-answer]");

    if (!textarea) {
        throw new Error("Answer-Template text: textarea[data-answer] fehlt");
    }

    if (task.answerDefault != null) {
        textarea.value = task.answerDefault;
    }

    return textarea;
}