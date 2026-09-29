import { fetchText } from "./http-client.js";
import { ANSWER_TYPE_MANIFEST } from "../config/answer-type-manifest.js";

const BASE_TEMPLATES = [
    "./assets/templates/base-task.html"
];

export async function registerTemplates({ hostSelector = "[data-template-host]"} = {}) {
    const host = document.querySelector(hostSelector) || document.body;

    const answerTemplates = Object.values(ANSWER_TYPE_MANIFEST)
        .map((entry) => entry.template);

    const templateFiles = [...BASE_TEMPLATES, ...answerTemplates];

    const htmlList = await Promise.all(templateFiles.map(fetchText));

    const template = document.createElement("template");
    template.innerHTML = htmlList.join("\n");

    host.append(template.content);
}

export function cloneTemplateById(templateId) {
    const template = document.querySelector(`#${CSS.escape(templateId)}`);

    if (!template) {
        throw new Error(`Template nicht gefunden: #${templateId}`);
    }

    return template.content.cloneNode(true);
}

export function cloneAnswerTemplate(answerType) {
    const template = document.querySelector(
        `template[data-answer-type="${CSS.escape(answerType)}"]`
    );

    if (!template) {
        throw new Error(`Kein Answer-Template für type="${answerType}" gefunden`);
    }

    return template.content.cloneNode(true);
}