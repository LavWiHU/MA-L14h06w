import "../components/task-block.js";
import { registerTemplates } from "../infrastructure/template-registry.js";
import { WorksheetApp } from "./worksheet-app.js";

async function bootstrap() {
    await registerTemplates();

    const app = new WorksheetApp({
        worksheetUrl: "./assets/data/worksheet.json",
        titleSelector: "[data-worksheet-title]",
        chaptersSelector: "[data-chapters]"
    });

    await app.mount();
}

bootstrap().catch((error) => {
    console.error(error);

    const chaptersHost = document.querySelector("[data-chapters]");
    if (chaptersHost) {
        chaptersHost.innerHTML = `
            <section class="task task--error">
                <div><strong>Fehler</strong></div>
                <div class="muted">${String(error.message ?? error)}</div>
            </section>
        `;
    }
});

export function validateManifest(manifest) {
    Object.entries(manifest).forEach(([type, config]) => {
        if (!config.template) {
            throw new Error(`Manifest Fehler: "${type}" hat kein template`);
        }

        if (typeof config.renderer !== "function") {
            throw new Error(`Manifest Fehler: "${type}" hat keinen gültigen renderer`);
        }
    });
}