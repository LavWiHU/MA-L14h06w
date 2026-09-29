import { cloneAnswerTemplate } from "../infrastructure/template-registry.js";
import { getAnswerTypeConfig } from "../config/answer-type-manifest.js";
import { createTaskShell } from "./task-shell.js";

export function renderTask(taskType, task) {
    if (!taskType) {
        throw new Error(`Task "${task?.id}": type fehlt.`);
    }

    const { renderer } = getAnswerTypeConfig(taskType);

    const shell = createTaskShell(task);
    const baseFragment = shell.fragment;

    const answerSlot = baseFragment.querySelector("[data-answer-slot]");

    if (!answerSlot) {
        throw new Error("Task-Shell: [data-answer-slot] fehlt.");
    }

    const answerFragment = cloneAnswerTemplate(taskType);

    const rendererApi = renderer(answerFragment, task, baseFragment);

    answerSlot.append(answerFragment);

    shell.connectChecking(rendererApi);

    return baseFragment;
}