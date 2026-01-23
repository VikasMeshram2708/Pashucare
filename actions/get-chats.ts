"use server";

import { db } from "@/db";
import { chats } from "@/db/schema";
import { count, eq } from "drizzle-orm";

export async function getChats({ userId }: { userId: string }) {
  try {
    if (!userId) {
      return {
        success: false,
        message: "Unauthorized",
      };
    }

    const [rows, totalRows] = await Promise.all([
      await db.query.chats.findMany({
        where: (d, { eq }) => eq(d.userId, userId),
      }),
      await db
        .select({ count: count() })
        .from(chats)
        .where(eq(chats.userId, userId)),
    ]);

    return {
      success: true,
      message: "fetched",
      metadata: {
        data: rows,
        total: totalRows[0].count,
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
