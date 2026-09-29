import { SessionStorage } from "./session-storage.js";

const sessionStorage = new SessionStorage();

export function bindTextareaPersistence(root, taskId) {
    const textarea = root.querySelector("textarea[data-answer]");

    if (!textarea) {
        return;
    }

    const key = createAnswerKey(taskId);
    const savedValue = sessionStorage.read(key);

    if (typeof savedValue === "string") {
        textarea.value = savedValue;
    }

    textarea.addEventListener("input", () => {
        sessionStorage.write(key, textarea.value);
    });
}

export function bindChoicePersistence(root, taskId) {
    const radios = Array.from(root.querySelectorAll('input[type="radio"]'));
    const checkboxes = Array.from(root.querySelectorAll('input[type="checkbox"]'));

    if (radios.length > 0) {
        bindRadioPersistence(radios, taskId);
        return;
    }

    if (checkboxes.length > 0) {
        bindCheckboxPersistence(checkboxes, taskId);
    }
}

export function loadTaskState(taskId) {
    const savedState = sessionStorage.read(createStateKey(taskId));

    if (savedState && typeof savedState === "object") {
        return savedState;
    }

    return null;
}

export function saveTaskState(taskId, state) {
    sessionStorage.write(createStateKey(taskId), state);
}

function bindRadioPersistence(radios, taskId) {
    const key = createChoiceKey(taskId);
    const savedValue = sessionStorage.read(key);

    if (savedValue != null) {
        const matchingRadio = radios.find((radio) => radio.value === String(savedValue));

        if (matchingRadio) {
            matchingRadio.checked = true;
        }
    }

    radios.forEach((radio) => {
        radio.addEventListener("change", () => {
            if (radio.checked) {
                sessionStorage.write(key, radio.value);
            }
        });
    });
}

function bindCheckboxPersistence(checkboxes, taskId) {
    const key = createChoicesKey(taskId);
    const savedValue = sessionStorage.read(key);

    if (Array.isArray(savedValue)) {
        const selectedValues = new Set(savedValue.map(String));

        checkboxes.forEach((checkbox) => {
            checkbox.checked = selectedValues.has(String(checkbox.value));
        });
    }

    const save = () => {
        const selectedValues = checkboxes
            .filter((checkbox) => checkbox.checked)
            .map((checkbox) => checkbox.value);

        sessionStorage.write(key, selectedValues);
    };

    checkboxes.forEach((checkbox) => {
        checkbox.addEventListener("change", save);
    });
}

function createAnswerKey(taskId) {
    return `worksheet.answer.${taskId}`;
}

function createChoiceKey(taskId) {
    return `worksheet.choice.${taskId}`;
}

function createChoicesKey(taskId) {
    return `worksheet.choices.${taskId}`;
}

function createStateKey(taskId) {
    return `worksheet.state.${taskId}`;
}