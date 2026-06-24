import { analyzeATS } from "../utils/atsScorer.js";
import { parseResume } from "../utils/resumeParser.js";
import { generateATSQualityInsightWithAI } from "../utils/aiUtils.js";

/**
 * Public ATS checker — hybrid scoring.
 *
 * Final score = 70% rule-based score + 30% AI quality score.
 * Rules stay the majority weight deliberately: this endpoint is
 * unauthenticated and called by anyone, so the score must stay
 * deterministic and free of AI-availability flakiness. The AI layer adds
 * judgment on writing quality that rules structurally cannot assess
 * (vague vs. specific bullets), and if Groq is unavailable the AI call
 * soft-fails to a fallback derived from the rule score — the endpoint
 * never breaks, it just loses the bonus nuance.
 */
export const publicATSCheck = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: "Resume file is required" });
        }

        const fileType = req.file.originalname.split(".").pop().toLowerCase();
        const { text: parsedText, structure } = await parseResume(req.file.path, fileType);

        const ruleAnalysis = analyzeATS(parsedText, structure);

        const aiInsight = await generateATSQualityInsightWithAI({
            resumeText: parsedText,
            ruleScore: ruleAnalysis.score,
        });

        const blendedScore = Math.round(
            ruleAnalysis.score * 0.7 + aiInsight.qualityScore * 0.3
        );

        // Merge suggestions: rule suggestions are deterministic facts about
        // the document, AI strengths/weak-bullet rewrites are nuance on top.
        const combinedSuggestions = [...ruleAnalysis.suggestions];
        if (aiInsight.weakBullets?.length > 0) {
            aiInsight.weakBullets.forEach((wb) => {
                if (wb.rewriteSuggestion) {
                    combinedSuggestions.push(
                        `Consider rewriting: "${wb.original}" → "${wb.rewriteSuggestion}"`
                    );
                }
            });
        }

        const sections = [
            {
                title: "Section Structure",
                feedback:
                    ruleAnalysis.meta.missingSections.length > 0
                        ? `Missing or unclear section(s): ${ruleAnalysis.meta.missingSections.join(", ")}`
                        : "✓ Your resume has clear, well-defined sections.",
                passed: ruleAnalysis.meta.missingSections.length === 0,
            },
            {
                title: "Action Verbs & Impact",
                feedback:
                    ruleAnalysis.breakdown.actionVerbs < 12
                        ? "Use more varied, strong action verbs across your bullet points."
                        : "✓ Good use of action verbs throughout your resume.",
                passed: ruleAnalysis.breakdown.actionVerbs >= 12,
            },
            {
                title: "Quantified Results",
                feedback:
                    ruleAnalysis.meta.quantifiedBulletCount < 3
                        ? "Add more measurable results — numbers, percentages, or dollar amounts."
                        : `✓ Good use of quantified results (${ruleAnalysis.meta.quantifiedBulletCount} found).`,
                passed: ruleAnalysis.meta.quantifiedBulletCount >= 3,
            },
            {
                title: "ATS Formatting",
                feedback:
                    ruleAnalysis.meta.structuralIssues.length > 0
                        ? ruleAnalysis.meta.structuralIssues[0]
                        : "✓ No ATS-breaking formatting detected.",
                passed: ruleAnalysis.meta.structuralIssues.length === 0,
            },
            {
                title: "Content Length & Structure",
                feedback:
                    ruleAnalysis.wordCount < 300 || ruleAnalysis.wordCount > 900
                        ? `Resume is ${ruleAnalysis.wordCount} words — aim for 300–900 for ideal ATS density.`
                        : `✓ Good content density (${ruleAnalysis.wordCount} words).`,
                passed: ruleAnalysis.wordCount >= 300 && ruleAnalysis.wordCount <= 900,
            },
            {
                title: "Writing Quality (AI)",
                feedback:
                    aiInsight.overallTone ||
                    "AI quality review unavailable right now — rule-based score still applies.",
                passed: aiInsight.qualityScore >= 60,
            },
        ];

        res.json({
            atsScore: blendedScore,
            ruleScore: ruleAnalysis.score,
            qualityScore: aiInsight.qualityScore,
            wordCount: ruleAnalysis.wordCount,
            suggestions: combinedSuggestions,
            sections,
            aiStrengths: aiInsight.strengths,
            breakdown: ruleAnalysis.breakdown,
        });
    } catch (error) {
        console.error("Error during ATS check:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};