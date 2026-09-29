import { setupElementAttentionCue } from "../ui/attention-cue.js";
import { createEmptySnapPointController } from "./snap-points.js";

export function destroyImageZoom(baseFrag) {
    const pending = baseFrag.__mediaZoomPendingLoad;

    if (pending?.img && pending?.handler) {
        pending.img.removeEventListener("load", pending.handler);
        baseFrag.__mediaZoomPendingLoad = null;
    }

    const cleanup = baseFrag.__mediaZoomCleanup;

    if (typeof cleanup === "function") {
        cleanup();
        baseFrag.__mediaZoomCleanup = null;
    }
}

export function setupImageZoom(baseFrag, img, mediaWrap, options = {}) {
    const toggle = mediaWrap.querySelector("[data-media-zoom-toggle]");
    const lens = mediaWrap.querySelector("[data-media-zoom-lens]");

    if (!toggle || !lens || !img || !mediaWrap) {
        return;
    }

    if (!isImageReady(img)) {
        waitForImageLoad(baseFrag, img, mediaWrap, options);
        return;
    }

    let active = false;
    let hasInteracted = false;

    const zoomFactor = getZoomFactor(options.factor);
    const lensSize = getLensSize(options.lensSize);

    lens.style.width = `${lensSize}px`;
    lens.style.height = `${lensSize}px`;

    const snapController = options.snapController ?? createEmptySnapPointController();

    const attentionCue = setupElementAttentionCue({
        element: toggle,
        shouldStart: () => !hasInteracted
    });

    function updateBackground() {
        lens.style.backgroundImage = `url("${img.currentSrc || img.src}")`;
        lens.style.backgroundSize = `${img.clientWidth * zoomFactor}px ${img.clientHeight * zoomFactor}px`;
    }

    function updateLens(clientX, clientY) {
        const imgRect = img.getBoundingClientRect();
        const wrapRect = mediaWrap.getBoundingClientRect();
        const defaultOutlineColor = getComputedStyle(lens).getPropertyValue("--lens-outline-color").trim();

        const rawX = clamp(clientX - imgRect.left, 0, imgRect.width);
        const rawY = clamp(clientY - imgRect.top, 0, imgRect.height);

        let x = rawX;
        let y = rawY;

        const snappedPosition = snapController.getSnappedPosition({
            x: rawX,
            y: rawY,
            imgRect,
            lensRadius: lensSize / 2
        });

        if (snappedPosition) {
            x = snappedPosition.x;
            y = snappedPosition.y;
            lens.style.outlineColor = snappedPosition.color;
        } else {
            lens.style.outlineColor = defaultOutlineColor;
        }

        const bgX = -(x * zoomFactor - lensSize / 2);
        const bgY = -(y * zoomFactor - lensSize / 2);

        let lensLeft = (imgRect.left - wrapRect.left) + x - lensSize / 2;
        let lensTop = (imgRect.top - wrapRect.top) + y - lensSize / 2;

        lensLeft = clamp(lensLeft, 0, wrapRect.width - lensSize);
        lensTop = clamp(lensTop, 0, wrapRect.height - lensSize);

        lens.style.left = `${lensLeft}px`;
        lens.style.top = `${lensTop}px`;
        lens.style.backgroundPosition = `${bgX}px ${bgY}px`;
    }

    function onPointerMove(event) {
        if (!active) {
            return;
        }

        updateBackground();
        lens.hidden = false;
        updateLens(event.clientX, event.clientY);
    }

    function onPointerEnter(event) {
        if (!active) {
            return;
        }

        updateBackground();
        lens.hidden = false;
        updateLens(event.clientX, event.clientY);
    }

    function onPointerLeave() {
        lens.hidden = true;
    }

    function onToggleClick() {
        active = !active;
        hasInteracted = true;

        attentionCue.stop()

        syncToggleState(toggle, active);

        if (active) {
            updateBackground();
        } else {
            lens.hidden = true;
            snapController.clearSnap();
        }
    }

    function onResize() {
        if (!img.hidden) {
            updateBackground();
        }
    }

    updateBackground();

    toggle.addEventListener("click", onToggleClick);
    mediaWrap.addEventListener("pointermove", onPointerMove);
    mediaWrap.addEventListener("pointerenter", onPointerEnter);
    mediaWrap.addEventListener("pointerleave", onPointerLeave);
    window.addEventListener("resize", onResize);

    baseFrag.__mediaZoomCleanup = () => {

        attentionCue.stop()
        toggle.removeEventListener("click", onToggleClick);
        mediaWrap.removeEventListener("pointermove", onPointerMove);
        mediaWrap.removeEventListener("pointerenter", onPointerEnter);
        mediaWrap.removeEventListener("pointerleave", onPointerLeave);
        window.removeEventListener("resize", onResize);

        active = false;
        syncToggleState(toggle, false);
        lens.hidden = true;
    };
}

function waitForImageLoad(baseFrag, img, mediaWrap, options) {
    const pending = baseFrag.__mediaZoomPendingLoad;

    if (pending?.img && pending?.handler) {
        pending.img.removeEventListener("load", pending.handler);
    }

    const onLoad = () => {
        baseFrag.__mediaZoomPendingLoad = null;

        if (!img.isConnected || !mediaWrap.isConnected || img.hidden) {
            return;
        }

        setupImageZoom(baseFrag, img, mediaWrap, options);
    };

    baseFrag.__mediaZoomPendingLoad = { img, handler: onLoad };
    img.addEventListener("load", onLoad, { once: true });

    if (isImageReady(img)) {
        img.removeEventListener("load", onLoad);
        onLoad();
    }
}

function isImageReady(img) {
    return img.complete && img.naturalWidth > 0 && img.naturalHeight > 0;
}

function syncToggleState(toggle, active) {
    toggle.classList.toggle("is-active", active);
    toggle.setAttribute("aria-pressed", String(active));
}

function getZoomFactor(value) {
    return Number.isFinite(value) ? value : 5;
}

function getLensSize(value) {
    return Number.isFinite(value) ? value : 180;
}

function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
}