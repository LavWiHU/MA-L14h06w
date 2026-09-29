import { setRichText } from "../ui/rich-text.js";
import { setupElementAttentionCue } from "../ui/attention-cue.js";

export function setupWorksheetCover(worksheet) {
    const cover = worksheet.cover ?? {};

    const coverEl = document.querySelector("[data-worksheet-cover]");
    const innerEl = document.querySelector("[data-cover-inner]");
    const imageEl = document.querySelector("[data-cover-image]");
    const titleEl = document.querySelector("[data-cover-title]");
    const startButton = document.querySelector("[data-cover-start]");
    const worksheetEl = document.querySelector("[data-worksheet]");

    if (!coverEl || !innerEl || !titleEl || !startButton || !worksheetEl) {
        return;
    }

    const hasTitle =
        typeof cover.title === "string" &&
        cover.title.trim().length > 0;

    const hasImage =
        typeof cover.imageSrc === "string" &&
        cover.imageSrc.trim().length > 0;

    const hasCover = hasTitle || hasImage;

    if (!hasCover) {
        worksheetEl.hidden = false;
        coverEl.remove();
        return;
    }

    const title = cover.title ?? "";

    setRichText(document, "[data-cover-title]", title);

    if (imageEl && cover.imageSrc) {
        imageEl.src = cover.imageSrc;
        imageEl.hidden = false;
    }

    if (innerEl) {
        if (cover.maxWidth) {
            innerEl.style.maxWidth = cover.maxWidth;
        }

        if (cover.maxHeight) {
            innerEl.style.maxHeight = cover.maxHeight;
        }
    }

    startButton.hidden = false;
    coverEl.hidden = false;
    worksheetEl.hidden = true;

    startButton.addEventListener("click", () => {
        coverEl.remove();
        worksheetEl.hidden = false;

        const firstChapter = worksheetEl.querySelector("[data-chapter]");
        const summary = firstChapter?.querySelector("summary");

        if (!firstChapter || !summary) {
            return;
        }

        const cue = setupElementAttentionCue({
            element: summary,
            delayMs: 0
        });

        firstChapter.addEventListener("toggle", () => {
            if (firstChapter.open) {
                cue.stop();
            }
        });
    });
}