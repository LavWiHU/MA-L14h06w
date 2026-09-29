import { cloneTemplateById } from "../infrastructure/template-registry.js";
import { fillTaskTextFields } from "./task-fields.js";
import { setupTaskChecking, setupSolutionControls, setupChapterUnlock } from "./task-checking.js";
import { setupTaskHelps } from "./task-help.js";
import { setupTaskMedia } from "../media/media-renderer.js";

export function createTaskShell(task) {
    const fragment = cloneTemplateById("tpl-task-base");

    fillTaskTextFields(fragment, task);
    setupTaskMedia(fragment, task);
    setupTaskHelps(fragment, task);
    setupSolutionControls(fragment, task);
    setupChapterUnlock(fragment, task);

    return {
        fragment,
        connectChecking(rendererApi) {
            setupTaskChecking(fragment, task, rendererApi);
        }
    };
}