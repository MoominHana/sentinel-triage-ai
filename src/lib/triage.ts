interface UrgencyInput {
  planTier: "FREE" | "PRO" | "ENTERPRISE";
  isPriority: boolean;
  aiUrgencyRating: number; // 1-10 rating extracted from Gemini
}

export function calculateUrgencyScore(input: UrgencyInput) {
  let score = input.aiUrgencyRating;

  // Business Logic Adjustments
  if (input.planTier === "ENTERPRISE") score += 2;
  if (input.isPriority) score += 2;

  // Clamp score between 1 and 10
  const finalScore = Math.min(Math.max(score, 1), 10);

  // Tagging Logic (>= 8 Tagging)
  const isPriorityFlagged = finalScore >= 8;
  const tags: string[] = [];

  if (isPriorityFlagged) {
    tags.push("PRIORITY_FLAGGED", "HIGH_URGENCY");
  }

  return {
    urgencyScore: finalScore,
    isPriorityFlagged,
    tags,
  };
}