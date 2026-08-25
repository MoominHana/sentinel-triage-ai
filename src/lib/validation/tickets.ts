import { z } from "zod";

/**
 * Schema for validating the input data when ingesting a new ticket.
 */
export const ticketIngestBaseSchema = z
  .object({
    customerId: z.string().trim().min(1, "customerId is required"),
    ticketBody: z.string().trim().min(1, "ticketBody is required").max(10_000),
    planTier: z.enum(["FREE", "PRO", "ENTERPRISE"]).default("FREE"),
    isPriority: z.boolean().default(false),
  })
  .strict();

export type TicketIngestBaseInput = z.infer<typeof ticketIngestBaseSchema>;