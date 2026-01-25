"use server";

import { db } from "@/db";
import { messages } from "@/db/schema";
import { currentUser } from "@clerk/nextjs/server";
import { count, eq } from "drizzle-orm";

export async function getMessages({
  chatId,
  page = 1,
  limit = 50,
}: {
  chatId: string;
  page?: number;
  limit?: number;
}) {
  try {
    // auth check
    const user = await currentUser();
    if (!user) {
      return {
        success: false,
        message: "Unauthorized",
      };
    }
    // get the chatId
    console.log("chatId-[]", chatId);

    const offset = (page - 1) * limit;

    // check the last message
    const dbMessages = await db.query.messages.findMany({
      where: (d, { eq }) => eq(d.chatId, chatId),
      orderBy: (d, { desc }) => desc(d.createdAt),
      limit,
      offset,
    });

    // Get total count for pagination
    const [totalCount] = await db
      .select({ count: count() })
      .from(messages)
      .where(eq(messages.chatId, chatId));

    const hasMore = offset + dbMessages.length < totalCount.count;

    return {
      success: true,
      message: "Ok",
      metadata: {
        dbMessages,
        page,
        limit,
        hasMore,
        total: totalCount.count,
      },
    };
  } catch (error) {
    console.error(error);
    return {
      success: false,
      message: "Something went wrong.",
    };
  }
}
