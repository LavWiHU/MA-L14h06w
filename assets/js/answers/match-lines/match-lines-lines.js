export function createMatchLineDrawer({
                                          root,
                                          svg,
                                          leftElements,
                                          rightElements,
                                          leftToRightMap,
                                          onLineClick
                                      }) {
    let redrawQueued = false;

    const resizeObserver = new ResizeObserver(() => {
        scheduleRedraw();
    });

    resizeObserver.observe(root);

    window.addEventListener("scroll", scheduleRedraw, { passive: true });
    window.addEventListener("resize", scheduleRedraw);

    function scheduleRedraw() {
        if (redrawQueued) {
            return;
        }

        redrawQueued = true;

        requestAnimationFrame(() => {
            redrawQueued = false;
            redrawLines();
        });
    }

    function redrawLines() {
        svg.replaceChildren();

        const rootRect = root.getBoundingClientRect();
        const width = Math.max(1, Math.floor(rootRect.width));
        const height = Math.max(1, Math.floor(rootRect.height));

        svg.setAttribute("width", String(width));
        svg.setAttribute("height", String(height));
        svg.setAttribute("viewBox", `0 0 ${width} ${height}`);

        for (const [leftId, rightId] of leftToRightMap.entries()) {
            const leftButton = leftElements.get(leftId);
            const rightButton = rightElements.get(rightId);

            if (!leftButton || !rightButton) {
                continue;
            }

            const start = getAnchor(leftButton, "left", rootRect);
            const end = getAnchor(rightButton, "right", rootRect);
            const path = createLinePath(start, end);

            path.addEventListener("click", (event) => {
                event.stopPropagation();
                onLineClick(leftId);
            });

            svg.append(path);
        }
    }

    function destroy() {
        resizeObserver.disconnect();
        window.removeEventListener("scroll", scheduleRedraw);
        window.removeEventListener("resize", scheduleRedraw);
    }

    return {
        scheduleRedraw,
        destroy
    };
}

function getAnchor(button, side, rootRect) {
    const rect = button.getBoundingClientRect();

    return {
        x: side === "left"
            ? rect.right - rootRect.left
            : rect.left - rootRect.left,
        y: (rect.top + rect.bottom) / 2 - rootRect.top
    };
}

function createLinePath(start, end) {
    const deltaX = Math.max(
        40,
        Math.min(180, Math.abs(end.x - start.x) * 0.35)
    );

    const path = document.createElementNS("http://www.w3.org/2000/svg", "path");

    path.setAttribute(
        "d",
        `M ${start.x} ${start.y} C ${start.x + deltaX} ${start.y}, ${end.x - deltaX} ${end.y}, ${end.x} ${end.y}`
    );

    path.setAttribute("fill", "none");
    path.setAttribute("stroke", "currentColor");
    path.setAttribute("stroke-width", "2");
    path.setAttribute("opacity", "0.8");
    path.setAttribute("stroke-linecap", "round");

    return path;
}