import { z } from "zod";

/**
 * Schema for validating the output of the LLM Analysis before writing to the database.
 */
export const createAnalysisSchema = z
  .object({
    sentiment: z.enum(["POSITIVE", "NEUTRAL", "NEGATIVE", "URGENT"]),
    category: z.enum(["BILLING", "BUG", "FEATURE_REQUEST", "OUTAGE", "GENERAL_INQUIRY"]),
    urgencyScore: z.number().min(0).optional(),
    summary: z.string().trim().max(1000).optional(),
  })
  .strict();

export type CreateAnalysisInput = z.infer<typeof createAnalysisSchema>;