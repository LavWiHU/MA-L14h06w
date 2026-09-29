export function renderImageLabelsMedia(answerFragment, task) {
    const overlay = answerFragment.querySelector("[data-answer-media-overlay]");
    const figure = answerFragment.querySelector("[data-answer-media]");
    const image = answerFragment.querySelector("[data-answer-image]");
    const caption = answerFragment.querySelector("[data-answer-caption]");

    const media = task.answerMedia?.image;

    if (!overlay || !figure || !image) {
        throw new Error("image-labels: eigener Answer-Media-Block fehlt im Answer-Template");
    }

    if (!media?.src) {
        throw new Error(`image-labels ${task.id}: answerMedia.image.src fehlt`);
    }

    figure.hidden = false;
    image.src = media.src;
    image.alt = typeof media.alt === "string" ? media.alt : "";

    if (hasText(media.maxHeight)) {
        image.style.maxHeight = media.maxHeight;
        image.style.width = "auto";
    } else {
        image.style.removeProperty("max-height");
        image.style.removeProperty("width");
    }

    if (caption) {
        const hasCaption = hasText(media.caption);
        caption.hidden = !hasCaption;
        caption.textContent = hasCaption ? media.caption : "";
    }

    return {
        overlay,
        figure,
        image,
        caption
    };
}

function hasText(value) {
    return typeof value === "string" && value.trim().length > 0;
}