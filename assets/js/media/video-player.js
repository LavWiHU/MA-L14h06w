import { setupCreatedAttentionCue } from "../ui/attention-cue.js";

export function renderVideoMedia(baseFrag, videoMedia) {
    const image = baseFrag.querySelector("[data-image]");
    const video = baseFrag.querySelector("[data-video]");
    const videoSource = baseFrag.querySelector("[data-video-source]");
    const caption = baseFrag.querySelector("[data-caption]");
    const mediaWrap = baseFrag.querySelector("[data-media-wrap]");
    const overlay = baseFrag.querySelector("[data-media-overlay]");

    if (image) {
        image.hidden = true;
    }

    if (overlay) {
        overlay.hidden = true;
    }

    if (!video || !videoSource) {
        return;
    }

    video.hidden = false;
    videoSource.src = videoMedia.src;
    video.load();

    renderCaption(caption, videoMedia.caption);
    setupVideoPlayer(baseFrag, video, mediaWrap);
}

export function setupVideoPlayer(baseFrag, video, mediaWrap) {
    if (!video || typeof window.Plyr !== "function") {
        return null;
    }

    const player = new window.Plyr(video, {
        controls: [
            "play",
            "progress",
            "current-time",
            "duration",
            "mute",
            "volume",
            "settings",
            "fullscreen"
        ]
    });

    if (mediaWrap) {
        setupVideoAttention(baseFrag, player, mediaWrap);
    }

    return player;
}

export function destroyVideoPlayer(baseFrag) {
    baseFrag.__videoAttentionCleanup?.();
    baseFrag.__videoAttentionCleanup = null;
}

function setupVideoAttention(baseFrag, player, mediaWrap) {
    let hasStartedPlayback = false;
    let cue = null;

    function findPlayButton() {
        return (
            mediaWrap.querySelector('.plyr__controls [data-plyr="play"]') ||
            mediaWrap.querySelector(".plyr__control--overlaid")
        );
    }

    function createVideoAttentionCue() {
        const playButton = findPlayButton();

        if (!playButton) {
            return null;
        }

        playButton.querySelector(".video-attention")?.remove();

        const overlay = document.createElement("span");
        overlay.className = "video-attention";
        overlay.hidden = true;

        const ring = document.createElement("span");
        ring.className = "video-attention__ring";

        overlay.append(ring);
        playButton.append(overlay);

        return overlay;
    }
    cue = setupCreatedAttentionCue({
        host: mediaWrap,
        shouldStart: () => !hasStartedPlayback,
        createCue() {
            return createVideoAttentionCue();
        },
        onStart(overlay) {
            if (!overlay) {
                return;
            }
            const ring = overlay.querySelector(".video-attention__ring");
            overlay.hidden = false;
            ring?.classList.add("is-active", "is-bounce");
        },
        onStop(overlay) {
            if (!overlay) {
                return;
            }
            const ring = overlay.querySelector(".video-attention__ring");
            overlay.hidden = true;
            ring?.classList.remove("is-active", "is-bounce");
        }
    });

    player.on("play", () => {
        hasStartedPlayback = true;
        cue.stop();
    });

    player.on("ended", () => {
        cue.stop();
    });

    baseFrag.__videoAttentionCleanup = () => {
        cue.destroy();
    };
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