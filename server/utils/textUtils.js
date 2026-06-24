/**
 * Normalizes text for keyword/section matching while PRESERVING signals
 * the old version destroyed: bullet markers, line breaks, and basic
 * punctuation. The old normalizeText stripped all punctuation before any
 * analysis ran, which made bullet-point detection and sentence-boundary
 * checks structurally impossible — this was a bug, not a missing feature.
 *
 * Returns the lowercase text with whitespace collapsed but bullets (•, -,
 * *, ‣, →) and line breaks intact, plus a separate fully-stripped variant
 * for pure substring/keyword checks where punctuation never matters.
 */
export const normalizeText = (text) => {
    return text
        .replace(/\r\n/g, "\n")
        .replace(/[ \t]+/g, " ")
        .replace(/\n{3,}/g, "\n\n")
        .toLowerCase()
        .trim();
};

// Fully stripped variant — used only for simple keyword/verb substring
// checks where punctuation is irrelevant. Kept separate from
// normalizeText so callers that need structure (bullets, line breaks)
// don't accidentally get the stripped version.
export const stripToAlnum = (text) => {
    return text
        .toLowerCase()
        .replace(/\s+/g, " ")
        .replace(/[^a-z0-9\s]/g, "");
};

const BULLET_CHARS = ["•", "‣", "▪", "◦", "·", "*", "-", "–", "—", "○"];

/**
 * Splits normalized text into lines and counts how many start with a
 * recognizable bullet character. Returns the bullet ratio (0–1) so the
 * scorer can reward bullet-heavy resumes — a real, strong ATS-readability
 * signal that was previously undetectable once punctuation was stripped.
 */
export const getBulletStats = (normalizedText) => {
    const lines = normalizedText.split("\n").map((l) => l.trim()).filter(Boolean);
    if (lines.length === 0) return { bulletLines: 0, totalLines: 0, bulletRatio: 0 };

    const bulletLines = lines.filter((line) =>
        BULLET_CHARS.some((b) => line.startsWith(b))
    ).length;

    return {
        bulletLines,
        totalLines: lines.length,
        bulletRatio: bulletLines / lines.length,
    };
};