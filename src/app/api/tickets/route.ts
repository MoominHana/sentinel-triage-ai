/** 
 * POST /api/tickets
 * Ingest a new ticket
 */
import { NextResponse } from "next/server";
import { ZodError } from "zod";
import type { Category } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { GoogleGenAI } from "@google/genai";

import { ticketIngestBaseSchema } from "@/lib/validation/tickets"; // Adjust path to your schema
import { createAnalysisSchema } from "@/lib/validation/analysis"; // Adjust path to your schema
import { calculateUrgencyScore } from "@/lib/triage"; // Adjust path to your triage logic

/**
 * Returns the ticket queue with any available analysis.
 */
export async function GET() {
  try {
    const tickets = await prisma.ticket.findMany({
      include: { analysis: true },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ success: true, data: tickets });
  } catch (error) {
    console.error("Failed to fetch tickets:", error);
    return NextResponse.json(
      { success: false, error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

/**
 * Handles the POST request to ingest a new ticket.
 * 
 * @param request 
 * @returns 
 */
export async function POST(request: Request) {
  try {
    // 1. Parse the incoming JSON body
    const body = await request.json();

    // 2. Validate body against your Zod schema 
    const validatedData = ticketIngestBaseSchema.parse(body);

    // 3. Insert record into Neon database via Prisma
    const newTicket = await prisma.ticket.create({
      data: { 
        ...validatedData,
        status: "PENDING_ANALYSIS",
       },
    });

    // 4. Trigger background analysis
    runBackgroundAnalysis(newTicket.id, validatedData);

    // 4. trigger analysis using Google GenAI
    // const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    // const prompt = `Analyze the following ticket data and provide insights: ${JSON.stringify(validatedData)}`;
    // const interaction = await genAI.interactions.create({
    //   model: "gemini-3.5-flash-lite",
    //   input: prompt,
    //   response_format: {
    //     type: "object", // replaced json_schema with type: "object" to match the expected response format
    //     properties: {   // replaced json_schema with properties to define the expected structure of the response
    //       sentiment: { type: "string", enum: ["POSITIVE", "NEUTRAL", "NEGATIVE", "URGENT"] },
    //       category: { type: "string", enum: ["BILLING", "BUG", "FEATURE_REQUEST", "OUTAGE"] },
    //       urgencyScore: { type: "number", minimum: 0 },
    //       summary: { type: "string", maxLength: 1000 },
    //     },
    //     required: ["sentiment", "category"],
    //     additionalProperties: false,
    //   },
    // });

    // const result = createAnalysisSchema.parse(JSON.parse(interaction.output_text ?? ""));


    // // 5. Calculate urgency score and tags using the triage logic
    // const { urgencyScore, isPriorityFlagged, tags } = calculateUrgencyScore({
    //   planTier: validatedData.planTier,
    //   isPriority: validatedData.isPriority,
    //   aiUrgencyRating: result.urgencyScore ?? 0,
    // });

    // await prisma.analysis.create({
    //   data: {
    //     ticketId: newTicket.id,
    //     sentiment: result.sentiment,
    //     category: result.category as unknown as Category,
    //     summary: result.summary ?? "",
    //     urgencyScore,
    //     isPriorityFlagged,
    //     tags,
    //   },
    // });

    
    // 5. Return success response with 201 Created status
    return NextResponse.json(
      { success: true, data: newTicket },
      { status: 201 }
    );
  } catch (error) {
    // Catch Zod validation errors
    if (error instanceof ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid request payload",
          details: error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    // Catch general/database errors
    console.error("Failed to ingest ticket:", error);
    return NextResponse.json(
      { success: false, error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

async function runBackgroundAnalysis(ticketId: string, validatedData: any) {
  try {
    const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    const prompt = `Analyze the following ticket data and provide insights: ${JSON.stringify(validatedData)}`;
    const interaction = await genAI.interactions.create({
      model: "gemini-3.5-flash-lite",
      input: prompt,
      response_format: {
        type: "object", // replaced json_schema with type: "object" to match the expected response format
        properties: {   // replaced json_schema with properties to define the expected structure of the response
          sentiment: { type: "string", enum: ["POSITIVE", "NEUTRAL", "NEGATIVE", "URGENT"] },
          category: { type: "string", enum: ["BILLING", "BUG", "FEATURE_REQUEST", "OUTAGE"] },
          urgencyScore: { type: "number", minimum: 0 },
          summary: { type: "string", maxLength: 1000 },
        },
        required: ["sentiment", "category"],
        additionalProperties: false,
      },
    });

    const result = createAnalysisSchema.parse(JSON.parse(interaction.output_text ?? ""));


    // 5. Calculate urgency score and tags using the triage logic
    const { urgencyScore, isPriorityFlagged, tags } = calculateUrgencyScore({
      planTier: validatedData.planTier,
      isPriority: validatedData.isPriority,
      aiUrgencyRating: result.urgencyScore ?? 0,
    });

    await prisma.analysis.create({
      data: {
        ticketId: ticketId,
        sentiment: result.sentiment,
        category: result.category as unknown as Category,
        summary: result.summary ?? "",
        urgencyScore,
        isPriorityFlagged,
        tags,
      },
    });

    // Update ticket status
    await prisma.ticket.update({
      where: { id: ticketId },
      data: { status: "ANALYZED" },
    });

    console.log(`Background analysis completed for ticket ID: ${ticketId}`);

  } catch (error) {
    console.error("Failed to run background analysis:", error);
  }

}