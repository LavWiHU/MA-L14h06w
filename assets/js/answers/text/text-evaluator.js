export function isTextAnswerComplete(textarea) {
    return textarea.value.trim().length > 0;
}

export function evaluateTextAnswer({ textarea }) {
    const isComplete = isTextAnswerComplete(textarea);

    return {
        isCorrect: isComplete,
        correctCount: isComplete ? 1 : 0,
        totalCount: 1,
        items: []
    };
}