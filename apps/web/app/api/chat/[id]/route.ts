import { env } from "@/app/env";
import { systemPrompt } from "@/app/prompts/system-prompt";
import { Id } from "@/convex/_generated/dataModel";
// import { Id } from "@/convex/_generated/dataModel";
import { NextRequest, NextResponse } from "next/server";
import { OpenAI } from "openai";
import * as z from "zod";

const messageSchema = z.object({
  role: z.enum(["user", "assistant", "system"]),
  content: z.string(),
});

const chatRequestSchema = z.object({
  messages: z.array(messageSchema).min(1, "At least one message required"),
});

export const client = new OpenAI({
  apiKey: env.MOONSHOTAI_API_KEY,
  baseURL: "https://api.moonshot.ai/v1",
});

const SYSTEM_PROMPT = {
  role: "system" as const,
  content: systemPrompt,
};

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const chatId = id as Id<"chats">;
    const body = await req.json();

    console.log("Chat ID:", chatId);
    console.log("Request body:", body);

    // Validate request body
    const parsed = chatRequestSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid payload",
          errors: parsed.error.flatten().fieldErrors,
        },
        { status: 400 },
      );
    }

    const { messages } = parsed.data;

    // Prepend system prompt if not present
    const fullMessages =
      messages[0]?.role === "system" ? messages : [SYSTEM_PROMPT, ...messages];

    const stream = await client.chat.completions.create({
      model: "kimi-k2-turbo-preview",
      messages: fullMessages,
      temperature: 0.6,
      stream: true,
    });

    const encoder = new TextEncoder();

    const readableStream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of stream) {
            const content = chunk.choices?.[0]?.delta?.content || "";
            if (content) {
              controller.enqueue(encoder.encode(content));
            }
          }
          controller.close();
        } catch (error) {
          console.error("Stream error:", error);
          controller.error(error);
        }
      },
      cancel() {
        // Handle client disconnect
        stream.controller.abort();
      },
    });

    return new Response(readableStream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-cache, no-transform",
        Connection: "keep-alive",
      },
    });
  } catch (error) {
    console.error("API error:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          message: "Validation failed",
          errors: error.flatten().fieldErrors,
        },
        { status: 400 },
      );
    }

    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 },
    );
  }
}
