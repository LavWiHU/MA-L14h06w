import {loadTaskState, saveTaskState} from "../infrastructure/local-task-store.js";

export function normalizeId(value) {
    return String(value);
}

export function loadIdBoundAnswers(taskId){
    const savedState = loadTaskState(taskId);
    const answers = new Map();

    if (savedState?.answers && typeof savedState.answers === "object") {
        for (const [key, value] of Object.entries(savedState.answers)) {
            answers.set(normalizeId(key), String(value ?? ""));
        }
    }

    return answers;
}

export function saveIdBoundAnswers(taskId, answers) {
    const serializedAnswers = {};

    for (const [key, value] of answers.entries()) {
        serializedAnswers[key] = value;
    }

    saveTaskState(taskId, {
        answers: serializedAnswers
    });
}