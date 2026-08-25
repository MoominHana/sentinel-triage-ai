/** 
 * POST /api/tickets
 * Ingest a new ticket
 */
import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { prisma } from "@/lib/prisma"; // Adjust path to your Prisma client instance
import { ticketIngestBaseSchema } from "@/lib/validation/tickets"; // Adjust path to your schema

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
      data: validatedData,
    });

    // 4. Return success response with 201 Created status
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