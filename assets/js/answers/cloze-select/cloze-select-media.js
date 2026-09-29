export function renderClozeSelectMedia(answerFragment, task) {
    const figure = answerFragment.querySelector("[data-cloze-media]");
    const image = answerFragment.querySelector("[data-cloze-image]");
    const caption = answerFragment.querySelector("[data-cloze-caption]");

    const media = task.answerMedia?.image;
    const hasMedia = hasImageSource(media);

    if (figure) {
        figure.hidden = !hasMedia;
    }

    renderImage(image, media, hasMedia);
    renderCaption(caption, media, hasMedia);
}

function renderImage(image, media, hasMedia) {
    if (!image) {
        return;
    }

    image.hidden = !hasMedia;

    if (!hasMedia) {
        image.removeAttribute("src");
        image.alt = "";
        image.style.removeProperty("max-height");
        image.style.removeProperty("width");
        return;
    }

    image.src = media.src;
    image.alt = typeof media.alt === "string" ? media.alt : "";

    if (hasText(media.maxHeight)) {
        image.style.maxHeight = media.maxHeight;
        image.style.width = "auto";
    } else {
        image.style.removeProperty("max-height");
        image.style.removeProperty("width");
    }
}

function renderCaption(caption, media, hasMedia) {
    if (!caption) {
        return;
    }

    const text = hasMedia && typeof media.caption === "string"
        ? media.caption.trim()
        : "";

    caption.hidden = text.length === 0;
    caption.textContent = text;
}

function hasImageSource(media) {
    return media && typeof media.src === "string" && media.src.trim().length > 0;
}

function hasText(value) {
    return typeof value === "string" && value.trim().length > 0;
}