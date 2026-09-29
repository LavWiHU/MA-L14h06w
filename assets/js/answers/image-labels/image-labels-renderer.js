import { renderImageLabelsMedia } from "./image-labels-media.js";
import {
    loadIdBoundAnswers,
    saveIdBoundAnswers
} from "../../components/utils.js";

import {
    normalizeImageLabelOptions,
    updateOptionAvailability
} from "./image-labels-options.js";

import {
    createImageLabelsLayer,
    validateImageLabelCallouts
} from "./image-labels-layer.js";

import { createImageLabelLineDrawer } from "./image-labels-lines.js";
import { createImageLabelsEditor } from "./image-labels-editor.js";

import {
    evaluateImageLabelsAnswer,
    isImageLabelsComplete
} from "./image-labels-evaluator.js";

import {
    applyImageLabelsFeedback,
} from "./image-labels-feedback.js";

export function renderImageLabelsAnswer(answerFragment, task) {
    const { overlay } = renderImageLabelsMedia(answerFragment, task);

    const callouts = validateImageLabelCallouts(task);
    const editableCallouts = callouts.map((callout) => ({ ...callout }));

    const options = normalizeImageLabelOptions(task);
    const optionById = new Map(options.map((option) => [option.id, option]));

    const answers = loadIdBoundAnswers(task.id);
    const enableEditor = task.config?.enableEditor === true;

    let lineDrawer = null;

    const layerResult = createImageLabelsLayer({
        task,
        callouts,
        options,
        answers,
        onAnswerChange(calloutId, value) {
            answers.set(calloutId, value);
            saveIdBoundAnswers(task.id, answers);
            updateOptionAvailability(layerResult.inputElements, answers);
        }
    });

    overlay.replaceChildren(layerResult.layer);

    lineDrawer = createImageLabelLineDrawer({
        overlay,
        svg: layerResult.svg,
        inputElements: layerResult.inputElements,
        editableCallouts,
        taskId: task.id
    });

    let editorApi = null;

    if (enableEditor) {
        editorApi = createImageLabelsEditor({
            answerFragment,
            layer: layerResult.layer,
            overlay,
            editableCallouts,
            taskId: task.id,
            lineDrawer
        });

        editorApi.mountEditorButton();

        layerResult.inputElements.forEach(({ wrap }, calloutId) => {
            editorApi.makeDraggable(wrap, calloutId, "box");
        });

        layerResult.targetElements.forEach((target, calloutId) => {
            editorApi.makeDraggable(target, calloutId, "target");
        });
    }

    updateOptionAvailability(layerResult.inputElements, answers);

    window.requestAnimationFrame(() => {
        updateOptionAvailability(layerResult.inputElements, answers);
        lineDrawer.scheduleDraw();
    });

    return {
        isComplete() {
            return isImageLabelsComplete(callouts, answers);
        },

        onChange(callback) {
            layerResult.inputElements.forEach(({ select }) => {
                select.addEventListener("change", callback);
            });
        },

        checkAnswer() {
            return evaluateImageLabelsAnswer({
                task,
                callouts,
                answers,
                inputElements: layerResult.inputElements
            });
        },

        applyCheckResult(result) {
            applyImageLabelsFeedback({
                result,
                inputElements: layerResult.inputElements,
                optionById,
                answers
            });

            updateOptionAvailability(layerResult.inputElements, answers);
            saveIdBoundAnswers(task.id, answers);
        },

        destroy() {
            lineDrawer?.destroy();
        }
    };
}