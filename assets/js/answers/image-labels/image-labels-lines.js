export function createImageLabelLineDrawer({ overlay, svg, inputElements, editableCallouts, taskId }) {
    const calloutById = new Map(
        editableCallouts.map((callout) => [String(callout.id), callout])
    );

    let queued = false;

    const resizeObserver = new ResizeObserver(() => scheduleDraw());
    resizeObserver.observe(overlay);

    window.addEventListener("scroll", scheduleDraw, { passive: true });
    window.addEventListener("resize", scheduleDraw);

    function scheduleDraw() {
        if (queued) {
            return;
        }

        queued = true;

        requestAnimationFrame(() => {
            queued = false;
            draw();
        });
    }

    function draw() {
        while (svg.childNodes.length > 1) {
            svg.removeChild(svg.lastChild);
        }

        const rect = overlay.getBoundingClientRect();
        const width = Math.max(1, Math.floor(rect.width));
        const height = Math.max(1, Math.floor(rect.height));

        svg.setAttribute("width", String(width));
        svg.setAttribute("height", String(height));
        svg.setAttribute("viewBox", `0 0 ${width} ${height}`);

        for (const [calloutId, { wrap }] of inputElements.entries()) {
            const callout = calloutById.get(calloutId);

            if (!callout) {
                continue;
            }

            const targetPoint = {
                x: (callout.tx / 100) * width,
                y: (callout.ty / 100) * height
            };

            const anchor = getClosestInputAnchor(wrap, targetPoint, rect);
            const path = createConnectionPath({
                anchor,
                targetPoint,
                taskId
            });

            svg.append(path);
        }
    }

    function destroy() {
        resizeObserver.disconnect();
        window.removeEventListener("scroll", scheduleDraw);
        window.removeEventListener("resize", scheduleDraw);
    }

    scheduleDraw();

    return {
        scheduleDraw,
        destroy
    };
}

function getClosestInputAnchor(wrap, targetPoint, overlayRect) {
    const rect = wrap.getBoundingClientRect();

    const leftAnchor = {
        x: rect.left - overlayRect.left,
        y: (rect.top + rect.bottom) / 2 - overlayRect.top
    };

    const rightAnchor = {
        x: rect.right - overlayRect.left,
        y: (rect.top + rect.bottom) / 2 - overlayRect.top
    };

    const leftDistance = Math.abs(targetPoint.x - leftAnchor.x);
    const rightDistance = Math.abs(targetPoint.x - rightAnchor.x);

    return leftDistance < rightDistance ? leftAnchor : rightAnchor;
}

function createConnectionPath({ anchor, targetPoint, taskId }) {
    const deltaX = Math.max(
        40,
        Math.min(200, Math.abs(targetPoint.x - anchor.x) * 0.4)
    );

    const direction = targetPoint.x >= anchor.x ? 1 : -1;

    const c1x = anchor.x + direction * deltaX;
    const c1y = anchor.y;
    const c2x = targetPoint.x - direction * deltaX;
    const c2y = targetPoint.y;

    const path = document.createElementNS("http://www.w3.org/2000/svg", "path");

    path.setAttribute(
        "d",
        `M ${anchor.x} ${anchor.y} C ${c1x} ${c1y}, ${c2x} ${c2y}, ${targetPoint.x} ${targetPoint.y}`
    );

    path.setAttribute("fill", "none");
    path.setAttribute("stroke", "currentColor");
    path.setAttribute("stroke-width", "2");
    path.setAttribute("opacity", "0.8");
    path.setAttribute("stroke-linecap", "round");
    path.setAttribute("marker-end", `url(#arrow-${taskId})`);

    return path;
}