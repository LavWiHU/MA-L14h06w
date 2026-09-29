import { destroyImageZoom } from "./image-zoom.js";
import { destroyVideoPlayer } from "./video-player.js";
import { renderImageMedia } from "./image-renderer.js";
import { renderVideoMedia } from "./video-player.js";

export function setupTaskMedia(baseFrag, task) {
    destroyImageZoom(baseFrag);
    destroyVideoPlayer(baseFrag);
    baseFrag.__snapPointsCleanup?.();
    baseFrag.__snapPointsCleanup = null;

    const imageMedia = task.media?.image;
    const videoMedia = task.media?.video;

    const hasImage = hasMediaSource(imageMedia);
    const hasVideo = hasMediaSource(videoMedia);

    const figure = baseFrag.querySelector("[data-media]");

    if (figure) {
        figure.hidden = !(hasImage || hasVideo);
    }

    if (hasVideo) {
        renderVideoMedia(baseFrag, videoMedia);
        return;
    }

    if (hasImage) {
        renderImageMedia(baseFrag, task, imageMedia);
    }
}

function hasMediaSource(media) {
    return media && typeof media.src === "string" && media.src.trim().length > 0;
}