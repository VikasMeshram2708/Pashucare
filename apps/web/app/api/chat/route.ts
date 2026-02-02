import { NextRequest, NextResponse } from "next/server";
import { fetchMutation } from "convex/nextjs";
import * as z from "zod";
import { api } from "@/convex/_generated/api";
import { auth } from "@clerk/nextjs/server";

const chatSchema = z.object({
  text: z.string().min(1, "Text is required"),
});

export async function POST(req: NextRequest) {
  try {
    const { userId, getToken } = await auth();

    if (!userId) {
      return NextResponse.json({
        success: false,
        message: "Unauthorized",
      });
    }

    const token = await getToken({ template: "convex" });

    if (!token) {
      throw new Error("Missing Convex token");
    }
    const body = await req.json();
    // sanitize
    const parsed = chatSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({
        success: false,
        message: "Invalid payload",
        errors: z.flattenError(parsed.error).fieldErrors,
      });
    }
    const { text } = parsed.data;
    // db operation
    const result = await fetchMutation(
      api.chats.createChat,
      {
        name: text.substring(0, 40) + (text.length > 40 ? "..." : ""),
        initialMessage: text,
      },
      { token },
    );

    return new Response(
      JSON.stringify({
        success: true,
        message: "Saved",
        metadata: { data: result },
      }),
      {
        headers: {
          "Content-Type": "application/json",
        },
        status: 200,
      },
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      {
        success: false,
        message: "Something went wrong.",
      },
      {
        status: 500,
      },
    );
  }
}
