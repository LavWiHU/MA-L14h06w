import { setRichText } from "../ui/rich-text.js";

export function fillTaskTextFields(baseFrag, task) {
    setTextField(baseFrag, "[data-id]", task.id, {
        hidden: task.hideTaskId === true || !hasText(task.id)
    });

    setRichTextField(baseFrag, "[data-intro]", task.intro);
    setRichTextField(baseFrag, "[data-title]", task.title);
    setRichTextField(baseFrag, "[data-prompt]", task.prompt);
    setRichTextField(baseFrag, "[data-title-label]", task.titleLabel);
    setRichTextField(baseFrag, "[data-prompt-label]", task.promptLabel);
    setRichTextField(baseFrag, "[data-subtitle]", task.subtitle);

    setTextField(baseFrag, "[data-prompt-icon]", task.promptIcon);
}

function hasText(value) {
    return typeof value === "string" && value.trim().length > 0;
}

function setRichTextField(root, selector, value) {
    const text = value ?? "";
    const el = root.querySelector(selector);

    setRichText(root, selector, text);

    if (el) {
        el.hidden = !hasText(text);
    }
}
function setTextField(root, selector, value, options = {}) {
    const text = value ?? "";
    const el = root.querySelector(selector);

    if (!el) return;

    el.replaceChildren(document.createTextNode(String(text)));

    el.hidden =
        typeof options.hidden === "boolean"
            ? options.hidden
            : !hasText(String(text));
}