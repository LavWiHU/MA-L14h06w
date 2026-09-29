import { toggleSnapPoints } from "../media/snap-points.js";
import { setupElementAttentionCue } from "../ui/attention-cue.js";
import { setRichText } from "../ui/rich-text.js";

export function setupTaskHelps(baseFrag, task) {
    const helpsConfig = task.config?.helps ?? {};
    const helpsWrap = baseFrag.querySelector("[data-helps]");

    if (!helpsWrap) {
        return;
    }

    let hasVisibleHelp = false;

    helpsWrap.querySelectorAll("[data-help]").forEach((helpElement) => {
        const key = helpElement.getAttribute("data-help");
        const content = helpsConfig[key];

        if (hasText(content)) {
            hasVisibleHelp = true;
            helpElement.hidden = false;
            setRichText(helpElement, "[data-help-content]", content);
            setupHelpMedia(helpElement, task, key);
        } else {
            helpElement.hidden = true;
            helpElement.open = false;
        }
    });

    if (hasImageSnapPoints(task)) {
        hasVisibleHelp = true;
        setupSnapPointsHelpControl(baseFrag);
    }

    helpsWrap.hidden = !hasVisibleHelp;

    if (hasVisibleHelp) {
        setupHelpDependencies(baseFrag);
    }
}

export function highlightNextHint(fromElement) {
    const taskElement = fromElement?.closest(".task");

    if (!taskElement) {
        return;
    }

    const nextHelp = Array
        .from(taskElement.querySelectorAll(".help"))
        .find((help) => !help.hidden && !help.open);

    if (!nextHelp) {
        return;
    }

    clearHintAttention(fromElement);

    nextHelp.classList.add("is-attention");

    const cue = setupElementAttentionCue({
        element: nextHelp,
        delayMs: 0,
    });

    nextHelp.__attentionCue = cue;

    nextHelp.addEventListener("toggle", () => {
        if (nextHelp.open) {
            cue.stop();
            nextHelp.classList.remove("is-attention", "is-attention-bounce");
            nextHelp.__attentionCue = null;
        }
    }, { once: true });
}

export function clearHintAttention(fromElement) {
    const taskElement = fromElement?.closest(".task");

    if (!taskElement) {
        return;
    }

    taskElement
        .querySelectorAll(".help.is-attention, .help.is-attention-bounce")
        .forEach((help) => {
            help.__attentionCue?.stop();
            help.__attentionCue = null;
            help.classList.remove("is-attention", "is-attention-bounce");
        });
}

function setupHelpDependencies(baseFrag) {
    if (baseFrag.__helpDependencyInitialized) {
        return;
    }

    baseFrag.__helpDependencyInitialized = true;

    const hint1 = baseFrag.querySelector('[data-help="hint1"]');
    const hint2 = baseFrag.querySelector('[data-help="hint2"]');
    const solution = baseFrag.querySelector('[data-help="solution"]');

    if (!hint1 || !hint2 || !solution) {
        return;
    }

    const solutionSummary = solution.querySelector("summary");

    const syncVisibility = () => {
        const hint1Visible = !hint1.hidden;
        const hint2Visible = hint1Visible && hint1.open;
        const solutionVisible = hint2Visible && hint2.open;

        hint2.hidden = !hint2Visible;
        solution.hidden = !solutionVisible;

        if (!hint2Visible) {
            hint2.open = false;
        }

        if (!solutionVisible) {
            solution.open = false;
        }
    };

    solutionSummary?.addEventListener("click", async (event) => {
        const wantsToOpen = !solution.open;

        if (!wantsToOpen) {
            return;
        }

        event.preventDefault();

        const confirmed = await showTaskHelpDialog({
            text: "Möchtest du die Lösung wirklich sehen?",
            confirmLabel: "Ja, Lösung sehen",
            cancelLabel: "Nein, ich versuche es selbst",
            requireConfirmation: true
        });

        if (confirmed) {
            solution.open = true;
        }
    });

    hint1.addEventListener("toggle", syncVisibility);
    hint2.addEventListener("toggle", syncVisibility);

    syncVisibility();
}

function showTaskHelpDialog({
                                title = "Hinweis",
                                text = "",
                                confirmLabel = "OK",
                                cancelLabel = "",
                                requireConfirmation = false
                            } = {}) {
    return new Promise((resolve) => {
        const dialog = document.createElement("dialog");
        dialog.className = "task-help-dialog";

        const titleElement = document.createElement("h3");
        titleElement.className = "task-help-dialog__title";
        titleElement.textContent = title;

        const textElement = document.createElement("p");
        textElement.className = "task-help-dialog__text";
        textElement.textContent = text;

        const actions = document.createElement("div");
        actions.className = "task-help-dialog__actions";

        if (requireConfirmation && cancelLabel) {
            const cancelButton = document.createElement("button");
            cancelButton.type = "button";
            cancelButton.className = "task-help-dialog__button";
            cancelButton.textContent = cancelLabel;
            cancelButton.addEventListener("click", () => dialog.close("cancel"));
            actions.append(cancelButton);
        }

        const confirmButton = document.createElement("button");
        confirmButton.type = "button";
        confirmButton.className = "task-help-dialog__button";
        confirmButton.textContent = confirmLabel;

        if (requireConfirmation) {
            confirmButton.classList.add("task-help-dialog__button--primary");
        }

        confirmButton.addEventListener("click", () => dialog.close("confirm"));
        actions.append(confirmButton);

        const content = document.createElement("div");
        content.className = "task-help-dialog__content";
        content.append(titleElement, textElement, actions);

        dialog.append(content);

        dialog.addEventListener("close", () => {
            const confirmed = dialog.returnValue === "confirm";
            dialog.remove();
            resolve(confirmed);
        }, { once: true });

        document.body.append(dialog);
        dialog.showModal();
    });
}

function hasText(value) {
    return typeof value === "string" && value.trim().length > 0;
}
export function setupSnapPointsHelpControl(baseFrag) {
    const hint2 = baseFrag.querySelector('[data-help="hint2"]');
    const hint2Content = hint2?.querySelector("[data-help-content]");

    if (!hint2 || !hint2Content) {
        return;
    }

    hint2.hidden = false;

    hint2Content.querySelector("[data-snap-toggle-button]")?.remove();

    const button = document.createElement("button");
    button.type = "button";
    button.className = "task__snap-toggle-button";
    button.dataset.snapToggleButton = "true";
    button.textContent = "Orientierungspunkte anzeigen";

    button.addEventListener("click", () => {
        const isVisible = toggleSnapPoints(button);

        if (isVisible === null) {
            return;
        }

        button.textContent = isVisible
            ? "Orientierungspunkte ausblenden"
            : "Orientierungspunkte anzeigen";
    });

    hint2Content.prepend(button);
}

function hasImageSnapPoints(task) {
    const image = task.media?.image;
    const snapPoints = image?.snapPoints;

    return (
        typeof image?.src === "string" &&
        image.src.trim().length > 0 &&
        snapPoints?.enabled === true &&
        Array.isArray(snapPoints.points) &&
        snapPoints.points.length > 0
    );
}
function setupHelpMedia(helpElement, task, key) {
    const media = task.config?.helpMedia?.[key]?.image;
    const figure = helpElement.querySelector("[data-help-media]");
    const image = helpElement.querySelector("[data-help-image]");
    const caption = helpElement.querySelector("[data-help-caption]");

    if (!figure || !image) {
        return;
    }

    const hasImage = typeof media?.src === "string" && media.src.trim().length > 0;

    figure.hidden = !hasImage;
    image.hidden = !hasImage;

    if (!hasImage) {
        image.removeAttribute("src");
        image.alt = "";
        if (caption) {
            caption.hidden = true;
            caption.textContent = "";
        }
        return;
    }

    image.src = media.src;
    image.alt = typeof media.alt === "string" ? media.alt : "";

    if (typeof media.maxHeight === "string" && media.maxHeight.trim()) {
        image.style.maxHeight = media.maxHeight;
        image.style.objectFit = "contain";
    }

    if (caption) {
        const text = typeof media.caption === "string" ? media.caption.trim() : "";
        caption.hidden = text.length === 0;
        caption.textContent = text;
    }
}