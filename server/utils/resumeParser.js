import fs from "fs";
import mammoth from "mammoth";
import * as pdfjsLib from "pdfjs-dist/legacy/build/pdf.mjs";

export const parseResume = async (filePath, fileType) => {
    if (fileType === "pdf") {
        const data = new Uint8Array(fs.readFileSync(filePath));
        const pdf = await pdfjsLib.getDocument({ data }).promise;

        let text = "";

        for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const content = await page.getTextContent();
            text += content.items.map(item => item.str).join(" ") + "\n";
        }

        return text;
    }

    if (fileType === "docx") {
        const result = await mammoth.extractRawText({ path: filePath });
        return result.value;
    }

    throw new Error("Unsupported file type");
};
