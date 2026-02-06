import {
    REQUIRED_SECTIONS,
    ACTION_VERBS,
    ATS_RED_FLAGS
} from "./atsRules.js";
import { normalizeText } from "./textUtils.js";

export const analyzeATS = (rawText) => {
    const text = normalizeText(rawText);
    let score = 0;
    const suggestions = [];

    // 1️⃣ Section Structure (20)
    let sectionScore = 0;
    REQUIRED_SECTIONS.forEach((section) => {
        if (text.includes(section)) sectionScore += 5;
    });
    if (sectionScore < 20) {
        suggestions.push(
            "Use clear standard sections like Experience, Education, Skills, Projects"
        );
    }
    score += sectionScore;

    // 2️⃣ Action Verbs & Keywords (25)
    let verbCount = 0;
    ACTION_VERBS.forEach((verb) => {
        if (text.includes(verb)) verbCount++;
    });

    const verbScore = Math.min(25, verbCount * 3);
    if (verbScore < 15) {
        suggestions.push(
            "Use more action verbs like developed, built, implemented"
        );
    }
    score += verbScore;

    // 3️⃣ Formatting Compatibility (20)
    let formatScore = 20;
    ATS_RED_FLAGS.forEach((flag) => {
        if (text.includes(flag)) {
            formatScore -= 5;
        }
    });
    if (formatScore < 20) {
        suggestions.push(
            "Avoid tables, images, columns, or text boxes for ATS compatibility"
        );
    }
    score += Math.max(formatScore, 0);

    // 4️⃣ Content Length & Density (20)
    const wordCount = text.split(" ").length;
    let lengthScore = 0;

    if (wordCount >= 300 && wordCount <= 900) {
        lengthScore = 20;
    } else if (wordCount >= 200) {
        lengthScore = 12;
        suggestions.push("Consider adding more relevant content to your resume");
    } else {
        lengthScore = 5;
        suggestions.push("Resume content is too short for ATS systems");
    }

    score += lengthScore;

    // 5️⃣ ATS Red Flags (15)
    let redFlagScore = 15;
    ATS_RED_FLAGS.forEach((flag) => {
        if (text.includes(flag)) redFlagScore -= 3;
    });
    if (redFlagScore < 15) {
        suggestions.push("Remove complex formatting elements for better parsing");
    }
    score += Math.max(redFlagScore, 0);

    return {
        score: Math.min(score, 100),
        suggestions,
        wordCount
    };
};
