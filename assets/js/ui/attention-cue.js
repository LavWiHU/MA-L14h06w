export function setupElementAttentionCue({
                                             element,
                                             delayMs = 10000,
                                             activeClass = "is-attention-bounce",
                                             visibleRatio = 0.25,
                                             shouldStart = () => true
                                         }) {
    let timeout = null;
    let observer = null;
    let started = false;
    let stopped = false;

    function startTimer() {
        if (started || stopped || !shouldStart()) {
            return;
        }

        started = true;

        timeout = window.setTimeout(() => {
            if (!stopped && shouldStart()) {
                element.classList.add(activeClass);
            }
        }, delayMs);
    }

    function startWhenVisible() {
        if (!("IntersectionObserver" in window)) {
            if (isActuallyVisible(element)) {
                startTimer();
            }
            return;
        }

        observer = new IntersectionObserver((entries) => {
            const entry = entries[0];

            if (
                entry?.isIntersecting &&
                entry.intersectionRatio >= visibleRatio &&
                isActuallyVisible(element)
            ) {
                observer.disconnect();
                observer = null;
                startTimer();
            }
        }, {
            threshold: [visibleRatio]
        });

        observer.observe(element);
    }

    window.requestAnimationFrame(() => {
        window.requestAnimationFrame(startWhenVisible);
    });

    return {
        stop() {
            stopped = true;
            clearTimeout(timeout);
            observer?.disconnect();
            observer = null;
            element.classList.remove(activeClass);
        }
    };
}

export function setupCreatedAttentionCue({
                                             host,
                                             createCue,
                                             delayMs = 15000,
                                             visibleRatio = 0.25,
                                             shouldStart = () => true,
                                             onStart = () => {},
                                             onStop = () => {}
                                         }) {
    let cue = null;
    let timeout = null;
    let observer = null;
    let started = false;
    let stopped = false;

    function ensureCue() {
        if (!cue) {
            cue = createCue();
        }

        return cue;
    }

    function startTimer() {
        if (started || stopped || !shouldStart()) {
            return;
        }

        started = true;

        timeout = window.setTimeout(() => {
            if (!stopped && shouldStart()) {
                const cueElement = ensureCue();
                onStart(cueElement);
            }
        }, delayMs);
    }

    function startWhenVisible() {
        if (!("IntersectionObserver" in window)) {
            if (isActuallyVisible(host)) {
                startTimer();
            }
            return;
        }

        observer = new IntersectionObserver((entries) => {
            const entry = entries[0];

            if (
                entry?.isIntersecting &&
                entry.intersectionRatio >= visibleRatio &&
                isActuallyVisible(host)
            ) {
                observer.disconnect();
                observer = null;
                startTimer();
            }
        }, {
            threshold: [visibleRatio]
        });

        observer.observe(host);
    }

    window.requestAnimationFrame(() => {
        window.requestAnimationFrame(startWhenVisible);
    });

    return {
        stop() {
            stopped = true;
            clearTimeout(timeout);
            observer?.disconnect();
            observer = null;

            if (cue) {
                onStop(cue);
            }
        },

        destroy() {
            this.stop();
            cue?.remove();
            cue = null;
        }
    };
}

function isActuallyVisible(element) {
    if (!element || !element.isConnected || element.hidden) {
        return false;
    }

    const rect = element.getBoundingClientRect();
    return rect.width > 0 && rect.height > 0;
}