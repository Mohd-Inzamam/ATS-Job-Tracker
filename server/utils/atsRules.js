// Section aliases — real resumes label things differently and ATS systems
// (and recruiters) recognize all these variants as the same section.
export const REQUIRED_SECTIONS = {
    experience: ["experience", "work experience", "professional experience", "employment history", "work history"],
    education: ["education", "academic background", "qualifications"],
    skills: ["skills", "technical skills", "core competencies", "technologies", "tech stack"],
    projects: ["projects", "personal projects", "key projects", "portfolio"],
};

// Bonus sections — not required, but their presence is a positive signal
// many baseline keyword scorers ignore entirely.
export const BONUS_SECTIONS = {
    summary: ["summary", "professional summary", "objective", "profile"],
    certifications: ["certifications", "certificates", "licenses"],
    achievements: ["achievements", "awards", "honors"],
};

// Action verbs grouped by category. A resume heavy in one category but
// missing the others reads as one-dimensional — useful for targeted
// feedback, not just a raw count.
export const ACTION_VERB_GROUPS = {
    leadership: ["led", "managed", "directed", "mentored", "coordinated", "supervised", "oversaw", "spearheaded"],
    building: ["built", "developed", "designed", "implemented", "architected", "engineered", "created", "launched"],
    improving: ["optimized", "improved", "streamlined", "reduced", "increased", "enhanced", "refactored", "automated"],
    analyzing: ["analyzed", "researched", "evaluated", "investigated", "identified", "diagnosed"],
    collaborating: ["collaborated", "partnered", "presented", "communicated", "negotiated", "facilitated"],
};

// Flat list kept for backward-compat call sites.
export const ACTION_VERBS = Object.values(ACTION_VERB_GROUPS).flat();

// Weak / passive phrasing that ATS-savvy resume guides flag — these dilute
// otherwise strong bullets and are worth calling out specifically.
export const WEAK_PHRASES = [
    "responsible for",
    "duties included",
    "worked on",
    "helped with",
    "involved in",
    "tasked with",
    "assisted with",
];

// Quantification signals — numbers, percentages, currency. Bullets with
// these are dramatically more credible to both ATS ranking algorithms
// and human reviewers.
export const QUANTIFICATION_PATTERN = /\b\d+(\.\d+)?\s*%|\$\s?\d+|\b\d{1,3}(,\d{3})+\b|\b\d+\+?\s*(years?|months?|users?|customers?|clients?|projects?|hours?|days?|x\b)/gi;

// Contact-info patterns — a resume without findable contact info is an
// instant ATS reject in the real world, independent of content quality.
export const EMAIL_PATTERN = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/;
export const PHONE_PATTERN = /(\+?\d{1,3}[\s-]?)?\(?\d{3,4}\)?[\s-]?\d{3,4}[\s-]?\d{3,4}/;

// Red flags that genuinely break ATS parsing. These are detected from
// document *structure* (font/position metadata from the parser), not by
// searching for the literal word "table" in extracted text — text
// extraction discards layout, so keyword-matching for these was a no-op.
export const STRUCTURAL_RED_FLAGS = {
    multiColumn: "Resume appears to use a multi-column layout, which can scramble reading order in many ATS parsers",
    headerFooterText: "Contact details may be placed in a header/footer — some ATS systems skip these regions entirely",
    tinyFonts: "Some text is set very small (under 8pt) — a few ATS systems and most human reviewers will struggle to read it",
    excessiveFontVariety: "Resume uses many different fonts — this can be a sign of copy-pasted formatting that confuses ATS parsers",
    sparseDensity: "Text is spread very thin across the page — may indicate large images, graphics, or excessive whitespace replacing content",
};