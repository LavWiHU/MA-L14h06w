import { renderTextAnswer } from "../answers/text/text-renderer.js";
import { renderSingleChoiceAnswer } from "../answers/single-choice/single-choice-renderer.js";
import { renderMultipleChoiceAnswer } from "../answers/multiple-choice/multiple-choice-renderer.js";
import { renderMatchLinesAnswer } from "../answers/match-lines/match-lines-renderer.js";
import { renderImageLabelsAnswer } from "../answers/image-labels/image-labels-renderer.js";
import { renderClozeSelectAnswer } from "../answers/cloze-select/cloze-select-renderer.js";
import { renderPictureAnswer } from "../answers/picture/picture-renderer.js";

export const ANSWER_TYPE_MANIFEST = {
    text: {
        template: "./assets/templates/answers/answer-text.html",
        renderer: renderTextAnswer
    },
    "single-choice": {
        template: "./assets/templates/answers/answer-single-choice.html",
        renderer: renderSingleChoiceAnswer
    },
    "multiple-choice": {
        template: "./assets/templates/answers/answer-multiple-choice.html",
        renderer: renderMultipleChoiceAnswer
    },
    "match-lines": {
        template: "./assets/templates/answers/answer-match-lines.html",
        renderer: renderMatchLinesAnswer
    },
    "image-labels": {
        template: "./assets/templates/answers/answer-image-labels.html",
        renderer: renderImageLabelsAnswer
    },
    "cloze-select": {
        template: "./assets/templates/answers/answer-cloze-select.html",
        renderer: renderClozeSelectAnswer
    },
    picture: {
        template: "./assets/templates/answers/answer-picture.html",
        renderer: renderPictureAnswer
    },
};

export function getAnswerTypeConfig(type) {
    const config = ANSWER_TYPE_MANIFEST[type];

    if (!config) {
        throw new Error(`Unbekannter Answer-Type: "${type}"`);
    }

    return config;
}