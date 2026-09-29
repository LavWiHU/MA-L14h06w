export function isMultipleChoiceComplete({ fieldset, inputName }) {
    return getCheckedInputs({ fieldset, inputName }).length > 0;
}

export function evaluateMultipleChoiceAnswer({ task, fieldset, inputName }) {
    const correctValues = getCorrectValues(task);

    if (correctValues === null) {
        return { error: "Keine Lösung definiert." };
    }

    const allInputs = getAllInputs({ fieldset, inputName });
    const checkedInputs = allInputs.filter((input) => input.checked);

    if (checkedInputs.length === 0) {
        return { error: "Bitte wähle mindestens eine Antwort." };
    }

    const items = allInputs.map((input) => {
        const value = String(input.value);
        const shouldBeChecked = correctValues.has(value);
        const isCorrect = input.checked === shouldBeChecked;

        return {
            element: input.closest(".mc-option"),
            isCorrect,
            isChecked: input.checked,
            shouldBeChecked
        };
    });

    const correctCount = items.filter((item) => item.isCorrect).length;
    const totalCount = items.length;

    return {
        isCorrect: correctCount === totalCount,
        correctCount,
        totalCount,
        items
    };
}

function getCorrectValues(task) {
    if (
        task.solution &&
        typeof task.solution === "object" &&
        Array.isArray(task.solution.values)
    ) {
        return new Set(task.solution.values.map(String));
    }

    return null;
}

function getCheckedInputs({ fieldset, inputName }) {
    return Array.from(
        fieldset.querySelectorAll(
            `input[name="${CSS.escape(inputName)}"]:checked`
        )
    );
}

function getAllInputs({ fieldset, inputName }) {
    return Array.from(
        fieldset.querySelectorAll(
            `input[name="${CSS.escape(inputName)}"]`
        )
    );
}