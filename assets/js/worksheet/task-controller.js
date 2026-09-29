import { fetchJSON } from "../infrastructure/http-client.js";
import { renderTask } from "../task/task-rendering-service.js";
import {
    bindChoicePersistence,
    bindTextareaPersistence
} from "../infrastructure/local-task-store.js";

const taskDataCache = new Map();

export async function createTaskView({ taskId, taskTypeOverride, tasksUrl }) {
    if (!taskId || !tasksUrl) {
        throw new Error(`taskId/tasksUrl fehlen (taskId="${taskId}", tasksUrl="${tasksUrl}")`);
    }

    const chapterData = await loadChapterTasks(tasksUrl);
    const task = findTaskById(chapterData, taskId);

    if (!task) {
        throw new Error(`Task "${taskId}" nicht in ${tasksUrl} gefunden.`);
    }

    const taskType = taskTypeOverride || task.type;

    if (!taskType) {
        throw new Error(`Kein Task-Type definiert für Task "${taskId}".`);
    }

    const taskNode = renderTask(taskType, task);

    bindTextareaPersistence(taskNode, taskId);
    bindChoicePersistence(taskNode, taskId);

    return taskNode;
}

async function loadChapterTasks(tasksUrl) {
    if (!taskDataCache.has(tasksUrl)) {
        taskDataCache.set(tasksUrl, fetchJSON(tasksUrl));
    }

    return taskDataCache.get(tasksUrl);
}

function findTaskById(chapterData, taskId) {
    const tasks = Array.isArray(chapterData?.tasks)
        ? chapterData.tasks
        : [];

    return tasks.find((task) => String(task.id) === String(taskId)) ?? null;
}