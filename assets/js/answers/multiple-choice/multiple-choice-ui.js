import { createRichTextFragment } from "../../ui/rich-text.js";

export function renderMultipleChoiceOptions({ answerFragment, task }) {
    const options = Array.isArray(task.options) ? task.options : [];

    if (options.length === 0) {
        throw new Error(`Multiple-Choice Task ${task.id}: keine options[]`);
    }

    const fieldset = answerFragment.querySelector("[data-options]");

    if (!fieldset) {
        throw new Error("Answer-Template multiple-choice: [data-options] fehlt");
    }

    const inputName = `mc.${task.id}`;

    options.forEach((option, index) => {
        const label = createOptionLabel({
            option,
            index,
            inputName
        });

        fieldset.append(label);
    });

    return {
        fieldset,
        inputName
    };
}

export function clearMultipleChoiceFeedback(fieldset) {
    fieldset.querySelectorAll(".mc-option").forEach((label) => {
        label.classList.remove("is-correct", "is-incorrect");
    });
}

export function applyMultipleChoiceFeedback(result) {
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
    label.className = "mc-option";
    label.style.display = "block";
    label.style.margin = "6px 0";

    const input = document.createElement("input");
    input.type = "checkbox";
    input.name = inputName;
    input.value = option.value ?? String(index);

    const text = document.createElement("span");
    text.append(createRichTextFragment(option.label ?? String(option.value ?? index)));
    text.style.marginLeft = "8px";

    label.append(input, text);

    return label;
}