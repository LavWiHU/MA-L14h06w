import { normalizeId } from "../../components/utils.js";

export function normalizeImageLabelOptions(task) {
    const rawOptions = Array.isArray(task.options) ? task.options : [];

    if (rawOptions.length === 0) {
        throw new Error(`image-labels ${task.id}: options[] fehlt/leer`);
    }

    return rawOptions.map((option, index) => {
        if (option && typeof option === "object") {
            const id = option.id ?? `o${index + 1}`;
            const label = option.label ?? String(id);

            return {
                id: normalizeId(id),
                label: String(label)
            };
        }

        return {
            id: `o${index + 1}`,
            label: String(option)
        };
    });
}

export function updateOptionAvailability(inputElements, answers) {
    const usedValues = new Set(
        Array.from(answers.values()).filter((value) => value && value !== "")
    );

    inputElements.forEach(({ select }) => {
        const currentValue = select.value;

        const defaultOption = Array
            .from(select.options)
            .find((option) => option.value === "");

        const regularOptions = Array
            .from(select.options)
            .filter((option) => option.value !== "");

        regularOptions.forEach((option) => {
            option.disabled =
                usedValues.has(option.value) &&
                option.value !== currentValue;
        });

        regularOptions.sort((a, b) => {
            if (a.value === currentValue) return -1;
            if (b.value === currentValue) return 1;

            if (a.disabled !== b.disabled) {
                return a.disabled ? 1 : -1;
            }

            return a.textContent.localeCompare(b.textContent, "de");
        });

        select.innerHTML = "";

        if (defaultOption) {
            select.append(defaultOption);
        }

        regularOptions.forEach((option) => {
            select.append(option);
        });

        select.value = currentValue;
    });
}