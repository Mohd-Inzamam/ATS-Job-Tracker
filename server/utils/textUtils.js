export const normalizeText = (text) => {
    return text
        .toLowerCase()
        .replace(/\s+/g, " ")
        .replace(/[^a-z0-9\s]/g, "");
};
