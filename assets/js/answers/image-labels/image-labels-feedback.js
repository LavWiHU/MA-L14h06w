export function clearImageLabelsFeedback(inputElements) {
    inputElements.forEach(({ wrap, select }) => {
        wrap.querySelectorAll(".ic-feedback").forEach((element) => element.remove());
        select.classList.remove("is-correct", "is-incorrect");
    });
}

export function applyImageLabelsFeedback({ result, inputElements, optionById, answers }) {
    if (!Array.isArray(result.items)) {
        return;
    }

    clearImageLabelsFeedback(inputElements);

    result.items.forEach((item) => {
        if (!item.element) {
            return;
        }

        const select = item.element;
        const wrap = select.closest(".ic-input");

        if (!wrap) {
            return;
        }

        const feedback = document.createElement("span");
        feedback.className = "ic-feedback";

        const icon = document.createElement("span");
        icon.className = "ic-feedback__icon";

        if (item.isCorrect) {
            icon.textContent = "✔";
            icon.classList.add("is-correct");

            select.classList.add("is-correct");
            feedback.append(icon);
        } else {
            icon.textContent = "✖";
            icon.classList.add("is-wrong");

            select.classList.add("is-incorrect");

            const wrongLabel =
                item.actual && optionById.get(item.actual)
                    ? optionById.get(item.actual).label
                    : "— keine Auswahl —";

            const solution = document.createElement("span");
            solution.className = "ic-feedback__solution";
            solution.textContent = `Deine Antwort vorher: ${wrongLabel}`;

            feedback.append(icon, solution);

            select.value = "";
            answers.set(item.calloutId, "");
        }

        wrap.append(feedback);
    });
}