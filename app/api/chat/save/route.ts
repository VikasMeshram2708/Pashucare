import { db } from "@/db";
import { messages } from "@/db/schema";
import { currentUser } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { NextRequest, NextResponse } from "next/server";
import * as z from "zod";

const messageSchema = z.object({
  role: z.enum(["user", "assistant"]),
  text: z.string().min(1, "Text is required"),
});

const saveChatSchema = z.object({
  chatId: z.string().min(1, "Chat id is required"),
  message: z.array(messageSchema).min(1, "At least one message is required"),
});

export async function POST(req: NextRequest) {
  try {
    // Auth check
    const user = await currentUser();
    if (!user) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 },
      );
    }

    const body: unknown = await req.json();
    // console.log("RAW BODY:", body);

    const parsed = saveChatSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid payload",
          errors: z.flattenError(parsed.error).fieldErrors,
        },
        { status: 400 },
      );
    }
    const { chatId, message } = parsed.data;
    // At this point payload is fully validated
    const rows = message.map((msg) => ({
      chatId,
      role: msg.role,
      text: msg.text as string,
    }));
    const [dbInsert] = await db.insert(messages).values(rows).returning();

    return NextResponse.json({
      success: true,
      message: "Saved",
      metadata: {
        data: dbInsert.id,
      },
    });
  } catch (error) {
    console.error("API ERROR:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Something went wrong.",
      },
      { status: 500 },
    );
  } finally {
    revalidatePath("/ai/chat");
  }
}
