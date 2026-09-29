const SNAP_POINT_COLORS = [
    "#1e88e5",
    "#43a047",
    "#fb8c00",
    "#8e24aa",
    "#00897b",
    "#6d4c41",
    "#3949ab"
];

export function createSnapPointController({
                                              task,
                                              img,
                                              mediaWrap,
                                              overlay,
                                              snapConfig
                                          }) {
    if (!hasSnapConfig(snapConfig) || !overlay) {
        return createEmptySnapPointController();
    }

    overlay.hidden = false;

    const snapLayer = createSnapLayer(overlay);
    const editableSnapPoints = snapConfig.points.map((point) => ({ ...point }));

    let snappedPointId = null;
    let editMode = false;
    let editorBar = null;
    let modeSelect = null;
    let exportCounter = 1;
    let pendingPairColor = null;
    let pendingPairId = null;

    renderSnapPoints();

    if (snapConfig.editor === true) {
        editorBar = createEditorBar({
            snapConfig,
            mediaWrap,
            onToggleEditMode
        });

        modeSelect = editorBar.querySelector("[data-snap-editor-mode]");
    }

    snapLayer.addEventListener("click", onSnapLayerClick);

    function getSnappedPosition({ x, y, imgRect, lensRadius }) {
        if (!isSnapLayerActive()) {
            clearSnap();
            return null;
        }

        const snapInRadius = lensRadius * 0.3;
        const snapOutRadius = lensRadius * 0.7;

        if (snappedPointId !== null) {
            const snappedPoint = getSnapPointById(snappedPointId);

            if (snappedPoint) {
                const snappedPx = pointToImagePx(snappedPoint, imgRect);
                const distToSnapped = distance(x, y, snappedPx.x, snappedPx.y);

                if (distToSnapped <= snapOutRadius) {
                    updateSnapHighlight();
                    return snappedPx;
                }
            }

            snappedPointId = null;
        }

        const nearest = getNearestSnapPoint(x, y, imgRect);

        if (nearest && nearest.dist <= snapInRadius) {
            snappedPointId = String(nearest.point.id);
            updateSnapHighlight();

            return {
                x: nearest.x,
                y: nearest.y,
                color: nearest.point.color
            };
        }

        updateSnapHighlight();
        return null;
    }

    function clearSnap() {
        if (snappedPointId === null) {
            return;
        }

        snappedPointId = null;
        updateSnapHighlight();
    }

    function destroy() {
        snapLayer.removeEventListener("click", onSnapLayerClick);
        snapLayer.remove();

        if (editorBar) {
            editorBar.remove();
            editorBar = null;
        }

        snappedPointId = null;
    }

    function onSnapLayerClick(event) {
        if (!editMode) {
            return;
        }

        event.preventDefault();
        event.stopPropagation();

        const position = getRelativeImagePosition(img, event.clientX, event.clientY);
        addSnapPoint(position.x, position.y);
    }

    function onToggleEditMode(button) {
        editMode = !editMode;

        if (editMode) {
            button.textContent = "Bearbeitung beenden";
            snapLayer.hidden = false;
            snapLayer.classList.add("is-edit-mode");
            return;
        }

        button.textContent = "Bearbeiten";
        snapLayer.classList.remove("is-edit-mode");

        exportSnapPoints(task.id, editableSnapPoints, getEditorMode());

        resetPendingPair();
        clearSnap();
    }

    function addSnapPoint(x, y) {
        const mode = getEditorMode();

        if (mode === "single") {
            editableSnapPoints.push({
                id: `p${editableSnapPoints.length + 1}`,
                x,
                y,
                color: getNextColor(exportCounter)
            });

            exportCounter += 1;
            renderSnapPoints();
            return;
        }

        if (!pendingPairId) {
            pendingPairId = `g${exportCounter}`;
            pendingPairColor = getNextColor(exportCounter);

            editableSnapPoints.push({
                id: `${pendingPairId}a`,
                pairId: pendingPairId,
                x,
                y,
                color: pendingPairColor
            });

            renderSnapPoints();
            return;
        }

        editableSnapPoints.push({
            id: `${pendingPairId}b`,
            pairId: pendingPairId,
            x,
            y,
            color: pendingPairColor
        });

        resetPendingPair();
        exportCounter += 1;
        renderSnapPoints();
    }

    function renderSnapPoints() {
        snapLayer.replaceChildren();

        editableSnapPoints.forEach((point) => {
            const element = document.createElement("span");
            element.className = "task-media__snap-point";
            element.dataset.snapId = String(point.id ?? "");
            element.style.left = `${point.x}%`;
            element.style.top = `${point.y}%`;

            if (typeof point.color === "string" && point.color.trim() !== "") {
                element.style.background = point.color;
            }

            snapLayer.append(element);
        });

        updateSnapHighlight();
    }

    function updateSnapHighlight() {
        snapLayer.querySelectorAll(".task-media__snap-point").forEach((element) => {
            element.classList.toggle(
                "is-snapped",
                snappedPointId !== null &&
                element.dataset.snapId === String(snappedPointId)
            );
        });
    }

    function getNearestSnapPoint(x, y, imgRect) {
        let best = null;
        let bestDist = Infinity;

        for (const point of editableSnapPoints) {
            const pointPx = pointToImagePx(point, imgRect);
            const dist = distance(x, y, pointPx.x, pointPx.y);

            if (dist < bestDist) {
                bestDist = dist;
                best = {
                    point,
                    x: pointPx.x,
                    y: pointPx.y,
                    dist
                };
            }
        }

        return best;
    }

    function getSnapPointById(id) {
        return editableSnapPoints.find((point) => String(point.id) === String(id)) ?? null;
    }

    function getEditorMode() {
        return modeSelect?.value === "pairs" ? "pairs" : "single";
    }

    function resetPendingPair() {
        pendingPairColor = null;
        pendingPairId = null;
    }

    function isSnapLayerActive() {
        return !!(snapLayer && !snapLayer.hidden);
    }

    return {
        getSnappedPosition,
        clearSnap,
        destroy
    };
}

export function toggleSnapPoints(fromElement) {
    const taskElement = fromElement.closest(".task");
    const overlay = taskElement?.querySelector("[data-media-overlay]");
    const snapLayer = overlay?.querySelector(".task-media__snap-layer");

    if (!overlay || !snapLayer) {
        console.warn("SnapPoints konnten nicht angezeigt werden: Snap-Layer fehlt.");
        return null;
    }

    const willShow = snapLayer.hidden;

    overlay.hidden = false;
    snapLayer.hidden = !willShow;

    if (willShow) {
        taskElement.querySelector("[data-media-zoom-lens]")?.setAttribute("hidden", "");
    }

    return willShow;
}

export function createEmptySnapPointController() {
    return {
        getSnappedPosition() {
            return null;
        },
        clearSnap() {},
        destroy() {}
    };
}

function hasSnapConfig(snapConfig) {
    return (
        snapConfig &&
        snapConfig.enabled === true &&
        Array.isArray(snapConfig.points) &&
        snapConfig.points.length > 0
    );
}

function createSnapLayer(overlay) {
    overlay.querySelector(".task-media__snap-layer")?.remove();

    const snapLayer = document.createElement("div");
    snapLayer.className = "task-media__snap-layer";
    snapLayer.hidden = true;

    overlay.append(snapLayer);

    return snapLayer;
}

function createEditorBar({ snapConfig, mediaWrap, onToggleEditMode }) {
    const editorBar = document.createElement("div");
    editorBar.className = "task-media__editor-bar";

    const modeSelect = document.createElement("select");
    modeSelect.className = "task-media__editor-select";
    modeSelect.dataset.snapEditorMode = "true";

    const singleOption = document.createElement("option");
    singleOption.value = "single";
    singleOption.textContent = "Einzelpunkte";

    const pairOption = document.createElement("option");
    pairOption.value = "pairs";
    pairOption.textContent = "Paare";

    modeSelect.append(singleOption, pairOption);
    modeSelect.value = snapConfig.mode === "pairs" ? "pairs" : "single";

    const editButton = document.createElement("button");
    editButton.type = "button";
    editButton.className = "task-media__editor-button";
    editButton.textContent = "Bearbeiten";

    editButton.addEventListener("click", () => {
        onToggleEditMode(editButton);
    });

    editorBar.append(modeSelect, editButton);
    mediaWrap.parentElement?.insertBefore(editorBar, mediaWrap);

    return editorBar;
}

function exportSnapPoints(taskId, editableSnapPoints, mode) {
    const payload = {
        enabled: true,
        editor: true,
        mode,
        points: editableSnapPoints
    };

    const text = `"snapPoints": ${JSON.stringify(payload, null, 2)}`;
    const blob = new Blob([text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = `snap-points-${taskId}.txt`;

    document.body.append(link);
    link.click();
    link.remove();

    URL.revokeObjectURL(url);
}

function getRelativeImagePosition(img, clientX, clientY) {
    const imgRect = img.getBoundingClientRect();

    const x = ((clientX - imgRect.left) / imgRect.width) * 100;
    const y = ((clientY - imgRect.top) / imgRect.height) * 100;

    return {
        x: clamp(Number(x.toFixed(2)), 0, 100),
        y: clamp(Number(y.toFixed(2)), 0, 100)
    };
}

function pointToImagePx(point, imgRect) {
    return {
        x: (point.x / 100) * imgRect.width,
        y: (point.y / 100) * imgRect.height
    };
}

function distance(ax, ay, bx, by) {
    return Math.hypot(ax - bx, ay - by);
}

function getNextColor(counter) {
    return SNAP_POINT_COLORS[(counter - 1) % SNAP_POINT_COLORS.length];
}

function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
}