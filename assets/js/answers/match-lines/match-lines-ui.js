import { normalizeId } from "../../components/utils.js";

export function getMatchLinesTemplateParts(answerFragment) {
    const root = answerFragment.querySelector("[data-ml-root]");
    const leftColumn = answerFragment.querySelector("[data-ml-left]");
    const rightColumn = answerFragment.querySelector("[data-ml-right]");
    const stage = answerFragment.querySelector("[data-ml-stage]");
    const svg = answerFragment.querySelector("[data-ml-svg]");

    if (!root || !leftColumn || !rightColumn || !stage || !svg) {
        throw new Error("Answer-Template match-lines: required data-ml-* nodes fehlen");
    }

    return {
        root,
        leftColumn,
        rightColumn,
        stage,
        svg
    };
}

export function validateMatchLinesItems(task) {
    const leftItems = Array.isArray(task.left) ? task.left : [];
    const rightItems = Array.isArray(task.right) ? task.right : [];

    if (leftItems.length === 0 || rightItems.length === 0) {
        throw new Error(`match-lines ${task.id}: left[] und/oder right[] fehlen/leer`);
    }

    return {
        leftItems,
        rightItems
    };
}

export function renderMatchLineItems({
                                         leftItems,
                                         rightItems,
                                         leftColumn,
                                         rightColumn,
                                         onPick
                                     }) {
    const leftElements = new Map();
    const rightElements = new Map();

    leftItems.forEach((item) => {
        const id = normalizeId(item.id);
        const button = createMatchLineButton({
            side: "left",
            id,
            item
        });

        button.addEventListener("click", (event) => {
            event.stopPropagation();
            onPick("left", id);
        });

        leftColumn.append(button);
        leftElements.set(id, button);
    });

    rightItems.forEach((item) => {
        const id = normalizeId(item.id);
        const button = createMatchLineButton({
            side: "right",
            id,
            item
        });

        button.addEventListener("click", (event) => {
            event.stopPropagation();
            onPick("right", id);
        });

        rightColumn.append(button);
        rightElements.set(id, button);
    });

    return {
        leftElements,
        rightElements
    };
}

export function updateMatchLinesUi({
                                       selected,
                                       leftToRightMap,
                                       rightToLeftMap,
                                       leftElements,
                                       rightElements
                                   }) {
    for (const [id, button] of leftElements) {
        button.classList.toggle(
            "is-selected",
            selected?.side === "left" && selected.id === id
        );
        button.classList.toggle("is-linked", leftToRightMap.has(id));
    }

    for (const [id, button] of rightElements) {
        button.classList.toggle(
            "is-selected",
            selected?.side === "right" && selected.id === id
        );
        button.classList.toggle("is-linked", rightToLeftMap.has(id));
    }
}

export function clearMatchLinesFeedback({ leftElements, rightElements }) {
    [...leftElements.values(), ...rightElements.values()].forEach((button) => {
        button.classList.remove("is-correct", "is-incorrect");
    });
}

export function applyMatchLinesFeedback(result) {
    if (!Array.isArray(result.items)) {
        return;
    }

    result.items.forEach((item) => {
        item.leftElement?.classList.add(item.isCorrect ? "is-correct" : "is-incorrect");
        item.rightElement?.classList.add(item.isCorrect ? "is-correct" : "is-incorrect");
    });
}

export function syncMatchLineColumnLayout({ leftItems, rightItems, leftColumn, rightColumn }) {
    const rows = Math.max(leftItems.length, rightItems.length);

    rightColumn.style.gridTemplateRows = `repeat(${rows}, 1fr)`;

    leftColumn.style.height = "";
    rightColumn.style.height = "";

    const height = Math.max(leftColumn.scrollHeight, rightColumn.scrollHeight);

    leftColumn.style.height = `${height}px`;
    rightColumn.style.height = `${height}px`;
}

function createMatchLineButton({ side, id, item }) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "ml-item";
    button.dataset.side = side;
    button.dataset.id = id;

    if (item.img) {
        const image = document.createElement("img");
        image.className = "ml-img";
        image.src = item.img;
        image.alt = item.alt ?? "";
        button.append(image);
    }

    if (item.label) {
        const label = document.createElement("span");
        label.className = "ml-label";
        label.textContent = item.label;
        button.append(label);
    } else if (!item.img) {
        const label = document.createElement("span");
        label.className = "ml-label";
        label.textContent = id;
        button.append(label);
    }

    return button;
}