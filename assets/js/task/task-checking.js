import { clearHintAttention, highlightNextHint } from "./task-help.js";
import { setupElementAttentionCue } from "../ui/attention-cue.js";
const chapterCheckState = new WeakMap();

export function setupTaskChecking(baseFrag, task, rendererApi) {
    const checkButton = baseFrag.querySelector("[data-check-button]");
    const feedbackElement = baseFrag.querySelector("[data-check-feedback]");

    if (!checkButton || !feedbackElement || !rendererApi || typeof rendererApi.checkAnswer !== "function") {
        return;
    }

    checkButton.disabled = true;

    const taskEl = getTaskElement(baseFrag);
    const isCheckable = isCheckableTask(task, checkButton);
    const updateChapterState = (isCorrect) => {
        if (!isCheckable || !taskEl) return;

        const chapterEl = getChapterElement(taskEl);
        console.log("chapter unlock debug", {
            taskId: task.id,
            isCorrect,
            isCheckable,
            taskConnected: taskEl.isConnected,
            chapterEl,
            lockedTasks: chapterEl?.querySelectorAll("[data-requires-chapter-correct]").length,
            stateSize: chapterEl ? getChapterState(chapterEl).size : null
        });

        if (!chapterEl) return;

        const state = getChapterState(chapterEl);
        const previousEntry = state.get(taskEl);

        if (isCorrect === true) {
            previousEntry?.cue?.stop();
        }

        const attentionEl = getAttentionElement(task, taskEl, checkButton);

        state.set(taskEl, {
            task,
            isCorrect,
            attentionEl,
            cue: previousEntry?.cue ?? null
        });
        updateChapterUnlockButtons(chapterEl);
    };

    const registerInitialChapterState = () => {
        window.requestAnimationFrame(() => {
            window.requestAnimationFrame(() => {
                window.requestAnimationFrame(() => {
                    if (task.type === "text") {
                        const result = rendererApi.checkAnswer();
                        updateChapterState(result?.isCorrect === true);
                    } else {
                        updateChapterState(false);
                    }
                });
            });
        });
    };

    registerInitialChapterState();

    const updateButtonState = () => {
        checkButton.disabled =
            typeof rendererApi.isComplete === "function"
                ? !rendererApi.isComplete()
                : false;
    };

    const clearCheckState = () => {
        baseFrag.querySelectorAll(".is-correct, .is-incorrect").forEach((element) => {
            element.classList.remove("is-correct", "is-incorrect");
        });

        feedbackElement.hidden = true;
        feedbackElement.textContent = "";
        feedbackElement.classList.remove("is-correct-text", "is-incorrect-text");
    };

    if (typeof rendererApi.onChange === "function") {
        rendererApi.onChange(() => {
            updateButtonState();
            clearCheckState();

            if (task.type === "text") {
                const result = rendererApi.checkAnswer();
                updateChapterState(result?.isCorrect === true);
            } else {
                updateChapterState(false);
            }
        });
    }

    updateButtonState();

    window.requestAnimationFrame(() => {
        window.requestAnimationFrame(updateButtonState);
    });

    checkButton.addEventListener("click", () => {
        const chapterEl = getChapterElement(taskEl);

        if (chapterEl) {
            const state = getChapterState(chapterEl);
            const currentEntry = state.get(taskEl);

            currentEntry?.cue?.stop();

            if (currentEntry) {
                currentEntry.cue = null;
            }
        }

        clearCheckState();

        const result = rendererApi.checkAnswer();

        if (!result) {
            return;
        }

        if (result.error) {
            feedbackElement.hidden = false;
            feedbackElement.textContent = result.error;
            feedbackElement.classList.add("is-incorrect-text");
            return;
        }

        if (typeof rendererApi.applyCheckResult === "function") {
            rendererApi.applyCheckResult(result, baseFrag);
        }

        feedbackElement.hidden = false;
        feedbackElement.textContent = result.isCorrect ? "Richtig." : "Nicht richtig.";
        feedbackElement.classList.add(
            result.isCorrect ? "is-correct-text" : "is-incorrect-text"
        );
        updateChapterState(result.isCorrect);

        if (result.isCorrect) {
            clearHintAttention(checkButton);
        } else {
            highlightNextHint(checkButton);
        }
    });
}

export function setupSolutionControls(baseFrag, task) {
    const checkButton = baseFrag.querySelector("[data-check-button]");
    const feedbackElement = baseFrag.querySelector("[data-check-feedback]");

    const hasSolution =
        task.solution &&
        typeof task.solution === "object" &&
        Object.keys(task.solution).length > 0;

    if (checkButton) {
        checkButton.hidden = !hasSolution;
    }

    if (feedbackElement) {
        feedbackElement.hidden = !hasSolution;
    }
}

export function setupChapterUnlock(baseFrag, task) {
    const taskEl = baseFrag.querySelector(".task");

    if (!taskEl || task.requiresChapterCorrect !== true) {
        return;
    }

    const contentEl = taskEl.querySelector(".task__content");

    if (contentEl) {
        contentEl.hidden = true;
    }

    taskEl.dataset.requiresChapterCorrect = "";

    const unlockButton = document.createElement("button");
    unlockButton.type = "button";
    unlockButton.className = "task__unlock-button";
    unlockButton.textContent = "Fertig";
    setUnlockButtonEnabled(unlockButton, false);
    unlockButton.dataset.chapterUnlockButton = "";

    taskEl.append(unlockButton);

    window.requestAnimationFrame(() => {
        const chapterEl = getChapterElement(unlockButton);

        if (chapterEl) {
            updateChapterUnlockButtons(chapterEl);
        }
    });

    unlockButton.addEventListener("click", () => {
        const chapterEl = getChapterElement(unlockButton);

        if (!chapterEl) {
            return;
        }

        if (unlockButton.dataset.enabled !== "true") {
            const missingEntries = getMissingChapterEntries(chapterEl);

            showChapterUnlockDialog("",
                missingEntries,
                () => startMissingTaskCues(missingEntries)
            );

            return;
        }

        unlockButton.remove();

        if (contentEl) {
            contentEl.hidden = false;
        }

        window.requestAnimationFrame(() => {
            const scrollTarget = taskEl.closest("task-block") ?? taskEl;

            scrollTarget.scrollIntoView({
                behavior: "smooth",
                block: "center"
            });

            const currentChapter = taskEl.closest("[data-chapter]");
            const nextChapter = currentChapter?.nextElementSibling;
            const nextSummary = nextChapter?.querySelector("summary");

            if (nextChapter && nextSummary) {
                const cue = setupElementAttentionCue({
                    element: nextSummary,
                    delayMs: 10000
                });

                nextChapter.addEventListener("toggle", () => {
                    if (nextChapter.open) {
                        cue.stop();
                    }
                }, { once: true });
            }
        });
    });
}

function getChapterElement(element) {
    return element.closest("[data-chapter]");
}

function getTaskElement(baseFrag) {
    return baseFrag.querySelector(".task");
}

function getChapterState(chapterEl) {
    if (!chapterCheckState.has(chapterEl)) {
        chapterCheckState.set(chapterEl, new Map());
    }

    return chapterCheckState.get(chapterEl);
}

function isCheckableTask(task, checkButton) {
    if (task.type === "text") {
        return true;
    }
    return (
        checkButton &&
        checkButton.hidden !== true &&
        task.solution &&
        typeof task.solution === "object" &&
        Object.keys(task.solution).length > 0
    );
}

function areAllCheckableTasksCorrect(chapterEl) {
    const entries = [...getChapterState(chapterEl).values()];

    return (
        entries.length > 0 &&
        entries.every((entry) => entry.isCorrect === true)
    );
}

function updateChapterUnlockButtons(chapterEl) {
    if (!chapterEl) return;

    const allCorrect = areAllCheckableTasksCorrect(chapterEl);

    chapterEl.querySelectorAll("[data-chapter-unlock-button]").forEach((button) => {
        setUnlockButtonEnabled(button, allCorrect);
    });
}

function getMissingChapterEntries(chapterEl) {
    return [...getChapterState(chapterEl).values()]
        .filter((entry) => entry.isCorrect !== true);
}

function getAttentionElement(task, taskEl, checkButton) {
    if (task.type === "text") {
        return taskEl.querySelector("textarea, input");
    }

    return checkButton;
}

function getMissingTaskMessage(entry) {
    const wrapper = document.createElement("span");

    const id = entry.task?.id ?? "";
    const titleLabel = entry.task?.titleLabel ?? "Aufgabe";

    const strong = document.createElement("strong");

    strong.textContent = id
        ? `${id} ${titleLabel} `
        : `${titleLabel} `;

    const text = document.createElement("span");

    if (entry.task?.type === "text") {
        text.textContent = "Die Antwort fehlt.";
    } else {
        text.textContent = "Die Antwort ist nicht richtig.";
    }

    wrapper.append(strong, text);

    return wrapper;
}

function showChapterUnlockDialog(title, entries, onOk = () => {}) {
    const dialog = document.createElement("dialog");
    dialog.className = "task-unlock-dialog";

    const text = document.createElement("p");
    text.textContent = title;

    const list = document.createElement("ul");

    entries.forEach((entry) => {
        const item = document.createElement("li");
        item.append(getMissingTaskMessage(entry));
        list.append(item);
    });

    const button = document.createElement("button");
    button.type = "button";
    button.className = "task-unlock-dialog__ok";
    button.textContent = "Ok";

    button.addEventListener("click", () => {
        onOk();

        dialog.close();
        dialog.remove();
    });

    dialog.append(text, list, button);
    document.body.append(dialog);
    dialog.showModal();
}

function startMissingTaskCues(entries) {
    entries.forEach((entry) => {
        if (!entry.attentionEl) {
            return;
        }

        entry.cue?.stop();

        entry.cue = setupElementAttentionCue({
            element: entry.attentionEl,
            delayMs: 0
        });
    });
}

function setUnlockButtonEnabled(button, isEnabled) {
    button.dataset.enabled = isEnabled ? "true" : "false";
    button.setAttribute("aria-disabled", isEnabled ? "false" : "true");
}