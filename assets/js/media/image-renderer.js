import { setupImageZoom } from "./image-zoom.js";
import { createSnapPointController } from "./snap-points.js";

export function renderImageMedia(baseFrag, task, imageMedia) {
    const mediaWrap = baseFrag.querySelector("[data-media-wrap]");
    const image = baseFrag.querySelector("[data-image]");
    const video = baseFrag.querySelector("[data-video]");
    const caption = baseFrag.querySelector("[data-caption]");
    const overlay = baseFrag.querySelector("[data-media-overlay]");

    if (!image) {
        return;
    }

    if (video) {
        video.hidden = true;
    }

    image.hidden = false;
    image.src = imageMedia.src;
    image.alt = typeof imageMedia.alt === "string" ? imageMedia.alt : "";

    if (hasText(imageMedia.maxHeight)) {
        image.style.maxHeight = imageMedia.maxHeight;
        image.style.objectFit = "contain";
    } else {
        image.style.removeProperty("max-height");
        image.style.removeProperty("object-fit");
    }

    renderCaption(caption, imageMedia.caption);

    const zoomConfig = imageMedia.zoom ?? {};
    const zoomEnabled = zoomConfig.enabled === true;
    const hasSnapPoints = hasImageSnapPoints(imageMedia);

    setupZoomControls(baseFrag, zoomEnabled);

    if (overlay) {
        overlay.hidden = !(zoomEnabled || hasSnapPoints);
    }

    let snapController = null;

    baseFrag.__snapPointsCleanup?.();
    baseFrag.__snapPointsCleanup = null;

    if (hasSnapPoints && mediaWrap && overlay) {
        snapController = createSnapPointController({
            task,
            img: image,
            mediaWrap,
            overlay,
            snapConfig: imageMedia.snapPoints
        });

        baseFrag.__snapPointsCleanup = () => {
            snapController?.destroy();
        };
    }

    if (zoomEnabled && mediaWrap) {
        const zoomFactor = Number(zoomConfig.factor);

        setupImageZoom(baseFrag, image, mediaWrap, {
            factor: Number.isFinite(zoomFactor) && zoomFactor > 1 ? zoomFactor : 5,
            lensSize: 180,
            snapController
        });
    }
}

function setupZoomControls(baseFrag, enabled) {
    const zoomToggle = baseFrag.querySelector("[data-media-zoom-toggle]");
    const zoomLens = baseFrag.querySelector("[data-media-zoom-lens]");

    if (zoomToggle) {
        zoomToggle.hidden = !enabled;
        zoomToggle.classList.remove("is-active");
        zoomToggle.setAttribute("aria-pressed", "false");
    }

    if (zoomLens) {
        zoomLens.hidden = true;
        zoomLens.style.backgroundImage = "";
        zoomLens.style.backgroundSize = "";
        zoomLens.style.backgroundPosition = "";
    }
}

function renderCaption(caption, text) {
    if (!caption) {
        return;
    }

    caption.hidden = !hasText(text);
    caption.textContent = hasText(text) ? text : "";
}

function hasText(value) {
    return typeof value === "string" && value.trim().length > 0;
}

function hasImageSnapPoints(imageMedia) {
    const snapPoints = imageMedia?.snapPoints;

    return (
        snapPoints?.enabled === true &&
        Array.isArray(snapPoints.points) &&
        snapPoints.points.length > 0
    );
}