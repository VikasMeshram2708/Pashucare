"use server";

import { db } from "@/db";
import { chats } from "@/db/schema";
import { currentUser } from "@clerk/nextjs/server";
import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import slugify from "slugify";
import * as z from "zod";

// Delete action
export const deleteChat = async ({ chatId }: { chatId: string }) => {
  try {
    // auth check
    const user = await currentUser();
    if (!user) {
      return {
        success: false,
        message: "Unauthorized",
      };
    }

    // check if the id exists
    const chatExists = await db.query.chats.findFirst({
      where: (d, { eq }) => eq(d.id, chatId),
    });

    if (chatExists) {
      await db
        .delete(chats)
        .where(and(eq(chats.id, chatId), eq(chats.userId, user.id)));

      return {
        success: true,
        message: "Chat deleted successfully",
      };
    }

    return {
      success: false,
      message: "Chat not found",
    };
  } catch (error) {
    console.error(error);
    return {
      success: false,
      message: "Something went wrong.",
    };
  } finally {
    revalidatePath("/ai/chat");
  }
};

// rename action
const renameChatSchema = z.object({
  chatId: z.string().min(1, "Chat id is required"),
  name: z.string().min(1, "Name is required").max(255, "Name is too long"),
});

export const renameChat = async ({
  chatId,
  name,
}: z.infer<typeof renameChatSchema>) => {
  try {
    // auth check
    const user = await currentUser();
    if (!user) {
      return {
        success: false,
        message: "Unauthorized",
      };
    }

    // sanitize
    const parsed = renameChatSchema.safeParse({ chatId, name });

    if (!parsed.success) {
      return {
        success: false,
        message: "Invalid payload",
        errors: z.flattenError(parsed.error).fieldErrors,
      };
    }

    // check if the id exists
    const chatExists = await db.query.chats.findFirst({
      where: (d, { eq }) => eq(d.id, chatId),
    });

    if (chatExists) {
      await db
        .update(chats)
        .set({ title: name, slug: slugify(name) })
        .where(and(eq(chats.id, chatId), eq(chats.userId, user.id)));

      return {
        success: true,
        message: "Chat renamed successfully",
      };
    }

    return {
      success: false,
      message: "Chat not found",
    };
  } catch (error) {
    console.error(error);
    return {
      success: false,
      message: "Something went wrong.",
    };
  } finally {
    revalidatePath("/ai/chat");
  }
};
