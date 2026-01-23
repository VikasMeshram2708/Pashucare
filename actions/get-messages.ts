"use server";

import { db } from "@/db";
import { currentUser } from "@clerk/nextjs/server";

export async function getMessages({ chatId }: { chatId: string }) {
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
    // check the last message
    const dbMessages = await db.query.messages.findMany({
      where: (d, { eq }) => eq(d.chatId, chatId),
      orderBy: (d, { desc }) => desc(d.createdAt),
    });

    return {
      success: true,
      message: "Ok",
      metadata: {
        dbMessages,
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
