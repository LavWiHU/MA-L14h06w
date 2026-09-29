const ALLOWED_TAGS = new Set([
    "B", "STRONG", "I", "EM", "U", "BR",
    "P", "UL", "OL", "LI",
    "CODE", "SUP", "SUB",
    "A"
]);

const ALLOWED_ATTRIBUTES = {
    A: new Set(["href", "title", "target", "rel"])
};

const ALLOWED_PROTOCOLS = new Set(["http:", "https:", "mailto:"]);

export function setRichText(root, selector, value) {
    const element = root.querySelector(selector);

    if (!element) {
        return;
    }

    element.replaceChildren(createRichTextFragment(value));
}

export function createRichTextFragment(value) {
    const template = document.createElement("template");
    template.innerHTML = String(value ?? "");

    sanitizeNode(template.content);

    return template.content;
}

function sanitizeNode(root) {
    const walker = document.createTreeWalker(
        root,
        NodeFilter.SHOW_ELEMENT,
        null
    );

    const elements = [];

    while (walker.nextNode()) {
        elements.push(walker.currentNode);
    }

    for (const element of elements) {
        const tagName = element.tagName;

        if (!ALLOWED_TAGS.has(tagName)) {
            element.replaceWith(...element.childNodes);
            continue;
        }

        sanitizeAttributes(element);
    }
}

function sanitizeAttributes(element) {
    const allowedForTag = ALLOWED_ATTRIBUTES[element.tagName] ?? new Set();

    for (const attribute of Array.from(element.attributes)) {
        const name = attribute.name.toLowerCase();

        if (name.startsWith("on")) {
            element.removeAttribute(attribute.name);
            continue;
        }

        if (!allowedForTag.has(attribute.name)) {
            element.removeAttribute(attribute.name);
            continue;
        }

        if (attribute.name === "href" && !isSafeHref(attribute.value)) {
            element.removeAttribute(attribute.name);
        }
    }

    if (element.tagName === "A" && element.hasAttribute("target")) {
        element.setAttribute("rel", "noopener noreferrer");
    }
}

function isSafeHref(value) {
    try {
        const url = new URL(value, window.location.origin);
        return ALLOWED_PROTOCOLS.has(url.protocol);
    } catch {
        return false;
    }
}