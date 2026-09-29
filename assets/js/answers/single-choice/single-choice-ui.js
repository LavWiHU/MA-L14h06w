import { createRichTextFragment } from "../../ui/rich-text.js";

export function renderSingleChoiceOptions({ answerFragment, task }) {
    const options = Array.isArray(task.options) ? task.options : [];

    if (options.length === 0) {
        throw new Error(`Single-Choice Task ${task.id}: keine options[]`);
    }

    const fieldset = answerFragment.querySelector("[data-options]");

    if (!fieldset) {
        throw new Error("Answer-Template single-choice: [data-options] fehlt");
    }

    const inputName = `sc.${task.id}`;

    options.forEach((option, index) => {
        fieldset.append(createOptionLabel({ option, index, inputName }));
    });

    return {
        fieldset,
        inputName
    };
}

export function clearSingleChoiceFeedback(fieldset) {
    fieldset.querySelectorAll(".sc-option").forEach((label) => {
        label.classList.remove("is-correct", "is-incorrect");
    });
}

export function applySingleChoiceFeedback(result) {
    if (!Array.isArray(result.items)) {
        return;
    }

    result.items.forEach((item) => {
        if (!item.element) {
            return;
        }

        item.element.classList.add(
            item.isCorrect ? "is-correct" : "is-incorrect"
        );
    });
}

function createOptionLabel({ option, index, inputName }) {
    const label = document.createElement("label");
    label.className = "sc-option";
    label.style.display = "block";
    label.style.margin = "6px 0";

    const input = document.createElement("input");
    input.type = "radio";
    input.name = inputName;
    input.value = option.value ?? String(index);

    const text = document.createElement("span");
    text.append(createRichTextFragment(option.label ?? String(option.value ?? index)));
    text.style.marginLeft = "8px";

    label.append(input, text);

    return label;
}