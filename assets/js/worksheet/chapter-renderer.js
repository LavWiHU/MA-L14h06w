export function renderChapter(chapter) {
    validateChapter(chapter);

    const details = document.createElement("details");
    details.className = "chapter";
    details.dataset.chapter = "";
    details.dataset.tasksSrc = chapter.tasksSrc;

    if (chapter.open === true) {
        details.open = true;
    }

    const summary = document.createElement("summary");
    const title = document.createElement("span");

    title.className = "chapter-title";
    title.textContent = chapter.title;

    if (chapter.icon) {
        title.dataset.icon = chapter.icon;
    }

    summary.append(title);

    const layout = document.createElement("section");
    layout.className = "page-layout";

    const main = document.createElement("div");
    main.className = "main";

    for (const taskId of chapter.tasks) {
        const taskBlock = document.createElement("task-block");
        taskBlock.setAttribute("task", String(taskId));
        taskBlock.setAttribute("src", chapter.tasksSrc);

        main.append(taskBlock);
    }

    layout.append(main);
    details.append(summary, layout);

    return details;
}

function validateChapter(chapter) {
    if (!chapter || typeof chapter !== "object") {
        throw new Error("Ungültige Kapitel-Konfiguration.");
    }

    if (!chapter.tasksSrc || typeof chapter.tasksSrc !== "string") {
        throw new Error(`Kapitel "${chapter.id ?? "ohne ID"}": tasksSrc fehlt.`);
    }

    if (!chapter.title || typeof chapter.title !== "string") {
        throw new Error(`Kapitel "${chapter.id ?? "ohne ID"}": title fehlt.`);
    }

    if (!Array.isArray(chapter.tasks)) {
        throw new Error(`Kapitel "${chapter.id ?? "ohne ID"}": tasks[] fehlt.`);
    }
}