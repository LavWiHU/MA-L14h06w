export async function fetchText(url) {
    const response = await fetch(url);

    if (!response.ok) {
        throw new Error(`Datei konnte nicht geladen werden: ${url} (${response.status})`);
    }

    return response.text();
}

export async function fetchJSON(url) {
    const response = await fetch(url);

    if (!response.ok) {
        throw new Error(`JSON konnte nicht geladen werden: ${url} (${response.status})`);
    }

    return response.json();
}