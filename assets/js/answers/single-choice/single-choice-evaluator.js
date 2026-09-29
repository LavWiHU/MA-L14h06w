export function isSingleChoiceComplete({ fieldset, inputName }) {
    return getSelectedInput({ fieldset, inputName }) !== null;
}

export function evaluateSingleChoiceAnswer({ task, fieldset, inputName }) {
    const correctValue = getCorrectValue(task);

    if (correctValue === null) {
        return { error: "Keine Lösung definiert." };
    }

    const selectedInput = getSelectedInput({ fieldset, inputName });

    if (!selectedInput) {
        return { error: "Bitte wähle eine Antwort." };
    }

    const isCorrect = selectedInput.value === correctValue;

    return {
        isCorrect,
        correctCount: isCorrect ? 1 : 0,
        totalCount: 1,
        items: [
            {
                element: selectedInput.closest(".sc-option"),
                isCorrect
            }
        ]
    };
}

function getCorrectValue(task) {
    if (
        task.solution &&
        typeof task.solution === "object" &&
        task.solution.value !== undefined &&
        task.solution.value !== null
    ) {
        return String(task.solution.value);
    }

    return null;
}

function getSelectedInput({ fieldset, inputName }) {
    return fieldset.querySelector(
        `input[name="${CSS.escape(inputName)}"]:checked`
    );
}