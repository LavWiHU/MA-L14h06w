const DEFAULT_SESSION_TTL_MS = 2 * 60 * 60 * 1000;
const DEFAULT_SESSION_META_KEY = "worksheet.session.meta";

export class SessionStorage {
    constructor({
                    ttlMs = DEFAULT_SESSION_TTL_MS,
                    metaKey = DEFAULT_SESSION_META_KEY,
                    storage = window.localStorage
                } = {}) {
        this.ttlMs = ttlMs;
        this.metaKey = metaKey;
        this.storage = storage;
    }

    read(key) {
        const rawValue = this.storage.getItem(key);

        if (!rawValue) {
            return null;
        }

        const sessionMeta = this.#getSessionMeta();

        try {
            const parsedValue = JSON.parse(rawValue);

            if (!isSessionPayload(parsedValue)) {
                return null;
            }

            if (parsedValue.sessionId !== sessionMeta.sessionId) {
                this.storage.removeItem(key);
                return null;
            }

            return parsedValue.data;
        } catch {
            return null;
        }
    }

    write(key, data) {
        const sessionMeta = this.#getSessionMeta();

        const payload = {
            sessionId: sessionMeta.sessionId,
            data
        };

        this.storage.setItem(key, JSON.stringify(payload));
    }

    #getSessionMeta() {
        const rawMeta = this.storage.getItem(this.metaKey);

        if (!rawMeta) {
            return this.#createAndStoreSessionMeta();
        }

        try {
            const parsedMeta = JSON.parse(rawMeta);

            if (!isSessionMeta(parsedMeta)) {
                return this.#createAndStoreSessionMeta();
            }

            if (Date.now() > parsedMeta.expiresAt) {
                return this.#createAndStoreSessionMeta();
            }

            return parsedMeta;
        } catch {
            return this.#createAndStoreSessionMeta();
        }
    }

    #createAndStoreSessionMeta() {
        const meta = {
            sessionId: crypto.randomUUID(),
            expiresAt: Date.now() + this.ttlMs
        };

        this.storage.setItem(this.metaKey, JSON.stringify(meta));

        return meta;
    }
}

function isSessionMeta(value) {
    return (
        value &&
        typeof value === "object" &&
        typeof value.sessionId === "string" &&
        typeof value.expiresAt === "number"
    );
}

function isSessionPayload(value) {
    return (
        value &&
        typeof value === "object" &&
        typeof value.sessionId === "string" &&
        "data" in value
    );
}