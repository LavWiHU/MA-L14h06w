import { createTaskView } from "../worksheet/task-controller.js";

class TaskBlock extends HTMLElement {
    static get observedAttributes() {
        return ["task", "type", "src"];
    }

    connectedCallback() {
        this.#render();
    }

    attributeChangedCallback() {
        if (this.isConnected) {
            this.#render();
        }
    }

    async #render() {
        const taskId = this.getAttribute("task");
        const taskTypeOverride = this.getAttribute("type");
        const tasksUrl =
            this.getAttribute("src") ||
            this.closest("[data-tasks-src]")?.getAttribute("data-tasks-src");

        this.replaceChildren(createLoadingState(taskId));

        try {
            const taskView = await createTaskView({
                taskId,
                taskTypeOverride,
                tasksUrl
            });

            this.replaceChildren(taskView);
        } catch (error) {
            this.replaceChildren(createErrorState(error));
        }
    }
}

function createLoadingState(taskId) {
    const element = document.createElement("div");
    element.className = "muted";
    element.textContent = `Lade Aufgabe ${taskId ?? ""}…`;
    return element;
}

function createErrorState(error) {
    const section = document.createElement("section");
    section.className = "task task--error";

    const title = document.createElement("div");
    title.innerHTML = "<strong>Fehler</strong>";

    const message = document.createElement("div");
    message.className = "muted";
    message.textContent = String(error.message ?? error);

    section.append(title, message);
    return section;
}

customElements.define("task-block", TaskBlock);