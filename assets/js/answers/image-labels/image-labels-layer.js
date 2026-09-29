import { normalizeId } from "../../components/utils.js";

export function validateImageLabelCallouts(task) {
    const callouts = Array.isArray(task.callouts) ? task.callouts : [];

    if (callouts.length === 0) {
        throw new Error(`image-labels ${task.id}: callouts[] fehlt/leer`);
    }

    return callouts;
}

export function createImageLabelsLayer({
                                           task,
                                           callouts,
                                           options,
                                           answers,
                                           onAnswerChange
                                       }) {
    const layer = document.createElement("div");
    layer.className = "ic-layer";

    const svg = createLineSvg(task.id);
    layer.append(svg);

    const inputElements = new Map();
    const targetElements = new Map();

    for (const callout of callouts) {
        const calloutId = normalizeId(callout.id);

        const input = createInputElement({
            callout,
            calloutId,
            options,
            answers,
            onAnswerChange
        });

        layer.append(input.wrap);
        inputElements.set(calloutId, input);

        const target = createTargetElement(callout, calloutId);

        layer.append(target);
        targetElements.set(calloutId, target);
    }

    return {
        layer,
        svg,
        inputElements,
        targetElements
    };
}

function createInputElement({ callout, calloutId, options, answers, onAnswerChange }) {
    const wrap = document.createElement("div");
    wrap.className = "ic-input";
    wrap.dataset.id = calloutId;
    wrap.style.left = `${callout.x}%`;
    wrap.style.top = `${callout.y}%`;

    if (callout.w != null) {
        wrap.style.width = `${callout.w}%`;
    }

    if (callout.h != null) {
        wrap.style.height = `${callout.h}%`;
    }

    const select = document.createElement("select");
    select.dataset.calloutId = calloutId;

    const currentValue = answers.get(calloutId) ?? "";

    const placeholderOption = document.createElement("option");
    placeholderOption.value = "";
    placeholderOption.textContent = callout.placeholder ?? "— auswählen —";

    if (currentValue === "") {
        placeholderOption.selected = true;
    }

    select.append(placeholderOption);

    for (const option of options) {
        const optionElement = document.createElement("option");
        optionElement.value = option.id;
        optionElement.textContent = option.label;
        optionElement.selected = option.id === currentValue;

        select.append(optionElement);
    }

    select.addEventListener("change", () => {
        onAnswerChange(calloutId, select.value);
    });

    wrap.append(select);

    return {
        wrap,
        select
    };
}

function createTargetElement(callout, calloutId) {
    const target = document.createElement("div");
    target.className = "ic-target";
    target.dataset.id = calloutId;
    target.style.left = `${callout.tx}%`;
    target.style.top = `${callout.ty}%`;

    return target;
}

function createLineSvg(taskId) {
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.classList.add("ic-svg");

    const defs = document.createElementNS("http://www.w3.org/2000/svg", "defs");
    const marker = document.createElementNS("http://www.w3.org/2000/svg", "marker");

    marker.setAttribute("id", `arrow-${taskId}`);
    marker.setAttribute("markerWidth", "10");
    marker.setAttribute("markerHeight", "10");
    marker.setAttribute("refX", "8");
    marker.setAttribute("refY", "5");
    marker.setAttribute("orient", "auto");

    const head = document.createElementNS("http://www.w3.org/2000/svg", "path");
    head.setAttribute("d", "M 0 0 L 10 5 L 0 10 z");
    head.setAttribute("fill", "currentColor");

    marker.append(head);
    defs.append(marker);
    svg.append(defs);

    return svg;
}