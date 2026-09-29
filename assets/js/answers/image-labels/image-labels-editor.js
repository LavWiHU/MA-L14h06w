import { normalizeId } from "../../components/utils.js";

export function createImageLabelsEditor({
                                            answerFragment,
                                            layer,
                                            overlay,
                                            editableCallouts,
                                            taskId,
                                            lineDrawer
                                        }) {
    let editMode = false;

    function makeDraggable(element, calloutId, type) {
        element.style.cursor = "move";

        element.addEventListener("pointerdown", (event) => {
            if (!editMode) {
                return;
            }

            event.preventDefault();

            const overlayRect = overlay.getBoundingClientRect();

            const move = (moveEvent) => {
                const xPercent = ((moveEvent.clientX - overlayRect.left) / overlayRect.width) * 100;
                const yPercent = ((moveEvent.clientY - overlayRect.top) / overlayRect.height) * 100;

                const callout = editableCallouts.find(
                    (item) => normalizeId(item.id) === calloutId
                );

                if (!callout) {
                    return;
                }

                if (type === "box") {
                    callout.x = Number(xPercent.toFixed(2));
                    callout.y = Number(yPercent.toFixed(2));
                } else {
                    callout.tx = Number(xPercent.toFixed(2));
                    callout.ty = Number(yPercent.toFixed(2));
                }

                element.style.left = `${type === "box" ? callout.x : callout.tx}%`;
                element.style.top = `${type === "box" ? callout.y : callout.ty}%`;

                lineDrawer.scheduleDraw();
            };

            const up = () => {
                window.removeEventListener("pointermove", move);
                window.removeEventListener("pointerup", up);
            };

            window.addEventListener("pointermove", move);
            window.addEventListener("pointerup", up);
        });
    }

    function mountEditorButton() {
        const button = document.createElement("button");
        button.type = "button";
        button.textContent = "Bearbeiten";
        button.style.marginTop = "12px";

        answerFragment.prepend(button);

        button.addEventListener("click", () => {
            editMode = !editMode;

            if (editMode) {
                button.textContent = "Bearbeitung beenden";
                layer.classList.add("ic-edit-mode");
            } else {
                button.textContent = "Bearbeiten";
                layer.classList.remove("ic-edit-mode");
                exportCallouts(taskId, editableCallouts);
            }
        });
    }

    return {
        makeDraggable,
        mountEditorButton
    };
}

function exportCallouts(taskId, editableCallouts) {
    const lines = editableCallouts.map((callout) => {
        const id = JSON.stringify(callout.id);

        const parts = [
            `{ "id": ${id}`,
            ` "x": ${callout.x}`,
            ` "y": ${callout.y}`,
            ` "w": ${callout.w ?? 22}`,
            ` "tx": ${callout.tx}`,
            ` "ty": ${callout.ty}`
        ];

        return parts.join(",") + " }";
    });

    const text =
        `"callouts": [\n  ` +
        lines.join(",\n  ") +
        `\n],`;

    const blob = new Blob([text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = `callouts-${taskId}.txt`;

    document.body.append(link);
    link.click();
    link.remove();

    URL.revokeObjectURL(url);
}