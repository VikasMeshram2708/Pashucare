"use server";

import { db } from "@/db";
import { chats } from "@/db/schema";
import { count, eq } from "drizzle-orm";

export async function getChats({
  userId,
  page = 1,
  limit = 20,
}: {
  userId: string;
  page?: number;
  limit?: number;
}) {
  try {
    if (!userId) {
      return {
        success: false,
        message: "Unauthorized",
      };
    }

    const offset = (page - 1) * limit;

    const [rows, totalRows] = await Promise.all([
      db.query.chats.findMany({
        where: (d, { eq }) => eq(d.userId, userId),
        orderBy: (d, { desc }) => desc(d.createdAt),
        limit,
        offset,
      }),
      db.select({ count: count() }).from(chats).where(eq(chats.userId, userId)),
    ]);

    const hasMore = offset + rows.length < totalRows[0].count;

    return {
      success: true,
      message: "fetched",
      metadata: {
        data: rows,
        total: totalRows[0].count,
        page,
        limit,
        hasMore,
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
