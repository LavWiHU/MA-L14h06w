import {fetchJSON} from "../infrastructure/http-client.js";
import {renderChapter} from "../worksheet/chapter-renderer.js";
import {setupWorksheetCover} from "../worksheet/worksheet-cover.js";

export class WorksheetApp {
    constructor({ worksheetUrl, titleSelector, chaptersSelector }) {
        this.worksheetUrl = worksheetUrl;
        this.titleSelector = titleSelector;
        this.chaptersSelector = chaptersSelector;
    }

    async mount() {
        const worksheet = await fetchJSON(this.worksheetUrl);
        setupWorksheetCover(worksheet);
        this.#renderTitle(worksheet);
        this.#renderChapters(worksheet);
    }

    #renderTitle(worksheet) {
        const title = typeof worksheet.title === "string" && worksheet.title.trim()
            ? worksheet.title
            : "Arbeitsblatt";

        document.title = title;

        const titleElement = document.querySelector(this.titleSelector);
        if (titleElement) {
            titleElement.textContent = title;
        }
    }

    #renderChapters(worksheet) {
        const host = document.querySelector(this.chaptersSelector);

        if (!host) {
            throw new Error(`Kapitel-Host nicht gefunden: ${this.chaptersSelector}`);
        }

        const chapters = Array.isArray(worksheet.chapters)
            ? worksheet.chapters
            : [];

        host.replaceChildren(...chapters.map(renderChapter));
    }
}