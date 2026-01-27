import { db } from "@/db";
import { chats, messages } from "@/db/schema";
import { currentUser } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import * as z from "zod";
import slugify from "slugify";
import { revalidatePath } from "next/cache";

const chatSchema = z.object({
  text: z.string().min(1, "Text is required").max(100, "Text is too long"),
});
type chatSchema = z.infer<typeof chatSchema>;

export async function POST(req: NextRequest) {
  try {
    // auth check
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({
        success: false,
        message: "Unauthorized",
      });
    }
    // sanitize
    const body = await req.json();
    const parsed = chatSchema.safeParse({ text: body.text });
    if (!parsed.success) {
      return NextResponse.json({
        success: false,
        message: "Invalid payload",
        errors: z.flattenError(parsed.error).fieldErrors,
      });
    }

    const { text } = parsed.data;

    // Generate unique slug by adding random suffix
    const baseSlug = slugify(text);
    const randomSuffix = Math.random().toString(36).substring(2, 8);
    const uniqueSlug = `${baseSlug}-${randomSuffix}`;

    // store the user text
    // db operation
    const [chat] = await db
      .insert(chats)
      .values({
        title: text ?? "New title",
        slug: uniqueSlug,
        userId: user?.id,
      })
      .returning();

    await db
      .insert(messages)
      .values({
        chatId: chat.id,
        role: "user",
        text: text,
      })
      .returning();

    return NextResponse.json({
      success: true,
      message: "Ok",
      metadata: {
        chatId: chat.id,
      },
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({
      success: false,
      message: "Something went wrong.",
    });
  } finally {
    revalidatePath("/ai/chat");
  }
}
