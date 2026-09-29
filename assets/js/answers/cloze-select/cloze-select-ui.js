import { normalizeId } from "../../components/utils.js";
import { createRichTextFragment } from "../../ui/rich-text.js";

export function createClozeSelectParagraph({ task, answers, onAnswerChange }) {
    const parts = validateTextParts(task);
    const paragraph = document.createElement("p");
    paragraph.className = "cloze-select__text";

    const gapSelects = [];
    const seenGapIds = new Set();

    for (const part of parts) {
        if (part.type === "text") {
            paragraph.append(createRichTextFragment(part.value ?? ""));
            continue;
        }

        if (part.type === "gap") {
            const select = createGapSelect({
                task,
                part,
                answers,
                seenGapIds,
                onAnswerChange
            });

            paragraph.append(select);
            gapSelects.push(select);
            continue;
        }

        throw new Error(
            `cloze-select ${task.id}: unbekannter textPart.type "${part.type}"`
        );
    }

    return {
        paragraph,
        gapSelects
    };
}

export function clearClozeSelectFeedback(gapSelects) {
    gapSelects.forEach((select) => {
        select.classList.remove("is-correct", "is-incorrect");
    });
}

export function applyClozeSelectFeedback(result) {
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

export function autoSizeSelect(select) {
    const styles = getComputedStyle(select);

    let longestText = "";

    for (const option of select.options) {
        const text = option.textContent ?? "";

        if (text.length > longestText.length) {
            longestText = text;
        }
    }

    const mirror = document.createElement("span");
    mirror.style.position = "absolute";
    mirror.style.visibility = "hidden";
    mirror.style.whiteSpace = "pre";
    mirror.style.font = styles.font;
    mirror.style.fontSize = styles.fontSize;
    mirror.style.fontFamily = styles.fontFamily;
    mirror.style.fontWeight = styles.fontWeight;
    mirror.style.letterSpacing = styles.letterSpacing;
    mirror.textContent = longestText || "...";

    document.body.append(mirror);

    const textWidth = Math.ceil(mirror.getBoundingClientRect().width);
    mirror.remove();

    const extraWidth = 65;
    const desiredWidth = textWidth + extraWidth;

    const parent = select.parentElement;
    const parentWidth = parent
        ? Math.floor(parent.getBoundingClientRect().width)
        : desiredWidth;

    const finalWidth = desiredWidth;
    const minWidth = parseFloat(styles.minWidth) || 0;

    select.style.width = `${Math.max(minWidth, finalWidth)}px`;
    select.style.maxWidth = "100%";
    select.style.boxSizing = "border-box";
}

function createGapSelect({ task, part, answers, seenGapIds, onAnswerChange }) {
    const gapId = normalizeId(part.id);

    if (seenGapIds.has(gapId)) {
        throw new Error(`cloze-select ${task.id}: doppelte gap id "${gapId}"`);
    }

    seenGapIds.add(gapId);

    const select = document.createElement("select");
    select.className = "cloze-select__gap";
    select.dataset.gapId = gapId;
    select.setAttribute("aria-label", part.placeholder ?? `Lücke ${gapId}`);

    const currentValue = answers.get(gapId) ?? "";

    select.append(createPlaceholderOption(part, currentValue));

    const options = Array.isArray(part.options) ? part.options : [];

    for (const optionValue of options) {
        const option = document.createElement("option");
        option.value = String(optionValue);
        option.textContent = String(optionValue);
        option.selected = String(optionValue) === currentValue;

        select.append(option);
    }

    select.addEventListener("change", () => {
        onAnswerChange(gapId, select.value);
        autoSizeSelect(select);
    });

    return select;
}

function createPlaceholderOption(part, currentValue) {
    const option = document.createElement("option");

    option.value = "";
    option.textContent = part.placeholder ?? "...";
    option.disabled = true;
    option.selected = currentValue === "";
    option.hidden = true;

    return option;
}

function validateTextParts(task) {
    const parts = Array.isArray(task.textParts) ? task.textParts : [];

    if (parts.length === 0) {
        throw new Error(`cloze-select ${task.id}: textParts[] fehlt/leer`);
    }

    return parts;
}