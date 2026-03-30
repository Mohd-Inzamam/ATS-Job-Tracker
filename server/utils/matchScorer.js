import { normalizeText } from "./textUtils.js";

// Common filler words to ignore during keyword extraction
const STOP_WORDS = new Set([
    "and", "the", "for", "with", "that", "this", "have", "from",
    "are", "was", "were", "will", "your", "our", "their", "you",
    "a", "an", "to", "of", "in", "is", "it", "on", "at", "be",
    "as", "by", "we", "or", "not", "but", "if", "so", "do", "has"
]);

// Extract meaningful keywords from any text block
export const extractKeywords = (text) => {
    const normalized = normalizeText(text);
    const words = normalized.split(" ");

    const keywords = words.filter(
        (word) => word.length > 2 && !STOP_WORDS.has(word)
    );

    // Return unique keywords only
    return [...new Set(keywords)];
};

// Calculate match between resume and JD
export const calculateMatch = (resumeText, jobDescription) => {
    const resumeKeywords = extractKeywords(resumeText);
    const jdKeywords = extractKeywords(jobDescription);

    // Keywords from JD that are present in resume
    const matchedKeywords = jdKeywords.filter((keyword) =>
        resumeKeywords.includes(keyword)
    );

    // Keywords from JD that are MISSING from resume
    const missingKeywords = jdKeywords.filter(
        (keyword) => !resumeKeywords.includes(keyword)
    );

    // Match percentage
    const matchPercentage =
        jdKeywords.length > 0
            ? Math.round((matchedKeywords.length / jdKeywords.length) * 100)
            : 0;

    // Top 10 missing keywords to surface as suggestions
    const topMissing = missingKeywords.slice(0, 10);

    // Generate suggestions based on gaps
    const suggestions = [];

    if (matchPercentage < 40) {
        suggestions.push(
            "Your resume has low alignment with this job description. Consider tailoring it specifically for this role."
        );
    } else if (matchPercentage < 70) {
        suggestions.push(
            "Your resume partially matches this JD. Adding missing keywords could significantly improve your chances."
        );
    } else {
        suggestions.push(
            "Great alignment! Your resume is well-matched with this job description."
        );
    }

    if (topMissing.length > 0) {
        suggestions.push(
            `Consider adding these keywords to your resume: ${topMissing.join(", ")}`
        );
    }

    return {
        matchPercentage,
        matchedKeywords,
        missingKeywords: topMissing,
        suggestions
    };
};