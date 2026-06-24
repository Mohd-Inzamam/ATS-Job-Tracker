import {
    REQUIRED_SECTIONS,
    BONUS_SECTIONS,
    ACTION_VERB_GROUPS,
    ACTION_VERBS,
    WEAK_PHRASES,
    QUANTIFICATION_PATTERN,
    EMAIL_PATTERN,
    PHONE_PATTERN,
    STRUCTURAL_RED_FLAGS,
} from "./atsRules.js";
import { normalizeText, stripToAlnum, getBulletStats } from "./textUtils.js";

/**
 * Rule-based ATS analysis. Deterministic, instant, free — runs on every
 * request including unauthenticated public checks. This is intentionally
 * NOT where AI judgment lives: see analyzeATSWithAI in atsController for
 * the layer that adds semantic quality scoring on top of this.
 *
 * Weighting (100 total):
 *   Section structure   — 20
 *   Action verbs         — 20
 *   Quantification        — 15
 *   Weak phrase penalty   — embedded in action verb score
 *   Formatting/red flags  — 20
 *   Content length        — 15
 *   Contact info          — 10
 */
export const analyzeATS = (rawText, structure = null) => {
    const text = normalizeText(rawText);
    const flatText = stripToAlnum(rawText);
    const suggestions = [];
    let score = 0;

    // ── 1. Section structure (20 pts) ──────────────────────────────────
    const sectionResults = {};
    let sectionsFound = 0;

    for (const [key, aliases] of Object.entries(REQUIRED_SECTIONS)) {
        const found = aliases.some((alias) => flatText.includes(alias.replace(/\s+/g, "")) || text.includes(alias));
        sectionResults[key] = found;
        if (found) sectionsFound++;
    }

    const sectionScore = Math.round((sectionsFound / Object.keys(REQUIRED_SECTIONS).length) * 20);
    score += sectionScore;

    const missingSections = Object.entries(sectionResults)
        .filter(([, found]) => !found)
        .map(([key]) => key);

    if (missingSections.length > 0) {
        suggestions.push(
            `Add clearly labeled section(s) for: ${missingSections.join(", ")}`
        );
    }

    // Bonus sections — tracked for feedback but don't add to the 100-pt cap;
    // surfaced as a positive note instead.
    const bonusFound = Object.entries(BONUS_SECTIONS)
        .filter(([, aliases]) => aliases.some((a) => text.includes(a)))
        .map(([key]) => key);

    // ── 2. Action verbs & weak phrases (20 pts) ────────────────────────
    const verbGroupHits = {};
    let totalVerbHits = 0;

    for (const [group, verbs] of Object.entries(ACTION_VERB_GROUPS)) {
        const hits = verbs.filter((v) => flatText.includes(v)).length;
        verbGroupHits[group] = hits;
        totalVerbHits += hits;
    }

    const groupsRepresented = Object.values(verbGroupHits).filter((h) => h > 0).length;
    let verbScore = Math.min(15, totalVerbHits * 1.5) + Math.min(5, groupsRepresented * 1.25);
    verbScore = Math.round(verbScore);

    const weakPhraseHits = WEAK_PHRASES.filter((p) => text.includes(p));
    if (weakPhraseHits.length > 0) {
        verbScore = Math.max(0, verbScore - weakPhraseHits.length * 2);
        suggestions.push(
            `Replace passive phrasing like "${weakPhraseHits[0]}" with a strong action verb`
        );
    }

    if (totalVerbHits < 5) {
        suggestions.push("Use more varied action verbs (e.g. built, led, optimized, analyzed)");
    } else if (groupsRepresented <= 1) {
        suggestions.push("Your action verbs are repetitive — mix in verbs from different categories (leadership, building, analysis)");
    }

    score += verbScore;

    // ── 3. Quantification (15 pts) ──────────────────────────────────────
    const quantMatches = rawText.match(QUANTIFICATION_PATTERN) || [];
    const quantScore = Math.min(15, quantMatches.length * 3);
    score += quantScore;

    if (quantMatches.length < 3) {
        suggestions.push("Add measurable results (%, numbers, $, time saved) to your bullet points");
    }

    // ── 4. Formatting & structural red flags (20 pts) ───────────────────
    let formatScore = 20;
    const flaggedIssues = [];

    if (structure) {
        if (structure.multiColumnLikely) {
            formatScore -= 8;
            flaggedIssues.push(STRUCTURAL_RED_FLAGS.multiColumn);
        }
        if (structure.minFontSize > 0 && structure.minFontSize < 8) {
            formatScore -= 4;
            flaggedIssues.push(STRUCTURAL_RED_FLAGS.tinyFonts);
        }
        if (structure.fontCount > 6) {
            formatScore -= 3;
            flaggedIssues.push(STRUCTURAL_RED_FLAGS.excessiveFontVariety);
        }
        if (structure.density > 0 && structure.density < 800) {
            formatScore -= 5;
            flaggedIssues.push(STRUCTURAL_RED_FLAGS.sparseDensity);
        }
    }

    formatScore = Math.max(0, formatScore);
    score += formatScore;
    flaggedIssues.forEach((issue) => suggestions.push(issue));

    // ── 5. Content length & bullet structure (15 pts) ──────────────────
    const wordCount = text.split(/\s+/).filter(Boolean).length;
    const { bulletRatio } = getBulletStats(text);

    let lengthScore = 0;
    if (wordCount >= 300 && wordCount <= 900) {
        lengthScore = 10;
    } else if (wordCount >= 200) {
        lengthScore = 6;
        suggestions.push("Consider adding more relevant content — your resume is on the shorter side");
    } else if (wordCount > 900) {
        lengthScore = 6;
        suggestions.push("Your resume is quite long — consider tightening it to the most relevant content");
    } else {
        lengthScore = 2;
        suggestions.push("Resume content is too short for most ATS systems to evaluate well");
    }

    const bulletScore = Math.round(Math.min(5, bulletRatio * 10));
    if (bulletRatio < 0.2) {
        suggestions.push("Use bullet points for your experience and projects — they're easier for both ATS and recruiters to scan");
    }

    score += lengthScore + bulletScore;

    // ── 6. Contact info (10 pts) ─────────────────────────────────────────
    const hasEmail = EMAIL_PATTERN.test(rawText);
    const hasPhone = PHONE_PATTERN.test(rawText);
    let contactScore = 0;
    if (hasEmail) contactScore += 5;
    if (hasPhone) contactScore += 5;
    score += contactScore;

    if (!hasEmail) suggestions.push("Make sure your email address is plain text and easy to find");
    if (!hasPhone) suggestions.push("Add a phone number in plain text near the top of your resume");

    return {
        score: Math.max(0, Math.min(100, Math.round(score))),
        suggestions,
        wordCount,
        breakdown: {
            sections: sectionScore,
            actionVerbs: verbScore,
            quantification: quantScore,
            formatting: formatScore,
            length: lengthScore + bulletScore,
            contactInfo: contactScore,
        },
        meta: {
            sectionsFound: Object.entries(sectionResults).filter(([, f]) => f).map(([k]) => k),
            missingSections,
            bonusSectionsFound: bonusFound,
            verbGroupHits,
            quantifiedBulletCount: quantMatches.length,
            bulletRatio: Math.round(bulletRatio * 100) / 100,
            structuralIssues: flaggedIssues,
        },
    };
};