import fs from "fs";
import mammoth from "mammoth";
import * as pdfjsLib from "pdfjs-dist/legacy/build/pdf.mjs";

/**
 * Parses a resume file and returns both the plain text (for keyword/
 * section matching) and structural metadata (for layout red-flag
 * detection). DOCX files don't expose positional data via mammoth, so
 * structure is PDF-only — DOCX falls back to text-only with structure
 * set to null, and the scorer treats null structure as "skip this
 * check" rather than penalizing it.
 *
 * @returns {Promise<{ text: string, structure: object|null }>}
 */
export const parseResume = async (filePath, fileType) => {
    if (fileType === "pdf") {
        return parsePdfWithStructure(filePath);
    }

    if (fileType === "docx") {
        const result = await mammoth.extractRawText({ path: filePath });
        return { text: result.value, structure: null };
    }

    throw new Error("Unsupported file type");
};

async function parsePdfWithStructure(filePath) {
    const data = new Uint8Array(fs.readFileSync(filePath));
    const pdf = await pdfjsLib.getDocument({ data }).promise;

    let text = "";
    const fontSizes = [];
    const fontNames = new Set();
    let totalGlyphs = 0;
    let pageWidthSum = 0;
    let multiColumnLineHits = 0;
    let totalLinesChecked = 0;

    for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const viewport = page.getViewport({ scale: 1 });
        pageWidthSum += viewport.width;

        const content = await page.getTextContent();

        // Bucket items by rounded y-position to approximate "lines", then
        // check each line for a large horizontal gap between text runs.
        // Single-column body text rarely has a 150pt+ gap mid-line; a
        // two-column layout consistently does.
        const lineBuckets = new Map();

        content.items.forEach((item) => {
            const str = item.str ?? "";
            if (!str.trim()) return;

            text += str + " ";
            totalGlyphs += str.length;

            const fontSize = Math.abs(item.transform?.[3] ?? item.height ?? 0);
            if (fontSize > 0) fontSizes.push(fontSize);
            if (item.fontName) fontNames.add(item.fontName);

            const x = item.transform?.[4] ?? 0;
            const y = Math.round(item.transform?.[5] ?? 0);

            const lineKey = Math.round(y / 3) * 3; // 3pt tolerance bucket
            if (!lineBuckets.has(lineKey)) lineBuckets.set(lineKey, []);
            lineBuckets.get(lineKey).push(x);
        });

        text += "\n";

        for (const xs of lineBuckets.values()) {
            if (xs.length < 2) continue;
            totalLinesChecked++;
            const sorted = [...xs].sort((a, b) => a - b);
            for (let j = 1; j < sorted.length; j++) {
                if (sorted[j] - sorted[j - 1] > 150) {
                    multiColumnLineHits++;
                    break;
                }
            }
        }
    }

    const avgFontSize = fontSizes.length
        ? fontSizes.reduce((a, b) => a + b, 0) / fontSizes.length
        : 0;
    const minFontSize = fontSizes.length ? Math.min(...fontSizes) : 0;
    const avgPageWidth = pageWidthSum / Math.max(pdf.numPages, 1);
    const density = totalGlyphs / Math.max(pdf.numPages, 1);

    // If more than 25% of checked lines show a big mid-line gap, this is
    // very likely a genuine multi-column layout rather than occasional
    // wide letter-spacing or a stray date-aligned-right line.
    const multiColumnLikely =
        totalLinesChecked > 0 && multiColumnLineHits / totalLinesChecked > 0.25;

    const structure = {
        pageCount: pdf.numPages,
        fontCount: fontNames.size,
        avgFontSize: Math.round(avgFontSize * 10) / 10,
        minFontSize: Math.round(minFontSize * 10) / 10,
        density: Math.round(density),
        avgPageWidth: Math.round(avgPageWidth),
        multiColumnLikely,
    };

    return { text, structure };
} 