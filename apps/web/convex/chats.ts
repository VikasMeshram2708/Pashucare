// convex/chats.ts
import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// ==================== QUERIES ====================

export const getUserChats = query({
  args: {
    userId: v.string(),
    paginationOpts: paginationOptsValidator,
  },
  handler: async (ctx, { userId, paginationOpts }) => {
    return ctx.db
      .query("chats")
      .withIndex("by_user_active", (q) =>
        q.eq("userId", userId).eq("isDeleted", false),
      )
      .order("desc")
      .paginate(paginationOpts);
  },
});

export const getChatById = query({
  args: {
    chatId: v.id("chats"),
    userId: v.string(),
  },
  handler: async (ctx, { chatId, userId }) => {
    const chat = await ctx.db.get(chatId);
    console.log("getChatById check:", {
      chatId,
      userId,
      foundUserId: chat?.userId,
    });
    if (!chat || chat.userId !== userId || chat.isDeleted) {
      return null;
    }
    return chat;
  },
});

// ---------------------------------------------------------------------
// IMPORTANT: Updated for usePaginatedQuery
// ---------------------------------------------------------------------

import { paginationOptsValidator } from "convex/server";

export const getChatMessages = query({
  args: {
    chatId: v.id("chats"),
    userId: v.string(),
    paginationOpts: paginationOptsValidator,
  },
  handler: async (ctx, { chatId, userId, paginationOpts }) => {
    // Verify ownership
    const chat = await ctx.db.get(chatId);
    console.log("getChatMessages check:", {
      chatId,
      userId,
      foundChatId: chat?._id,
      foundUserId: chat?.userId,
      isDeleted: chat?.isDeleted,
    });

    if (!chat || chat.userId !== userId || chat.isDeleted) {
      throw new Error(
        `Chat not found or unauthorized (Requested: ${userId}, Found: ${chat?.userId})`,
      );
    }

    return ctx.db
      .query("messages")
      .withIndex("by_chat", (q) => q.eq("chatId", chatId))
      .order("desc")
      .paginate(paginationOpts);
  },
});

// ==================== MUTATIONS ====================

export const createChat = mutation({
  args: {
    name: v.string(),
    userId: v.string(),
    initialMessage: v.optional(v.string()),
  },
  returns: v.id("chats"),
  handler: async (ctx, { name, userId, initialMessage }) => {
    console.log("createChat for userId:", userId);
    const now = Date.now();

    const chatId = await ctx.db.insert("chats", {
      name,
      userId,
      createdAt: now,
      updatedAt: now,
      isDeleted: false,
      messageCount: initialMessage ? 1 : 0,
    });

    if (initialMessage) {
      await ctx.db.insert("messages", {
        chatId,
        role: "user",
        content: initialMessage,
        status: "sent",
        createdAt: now,
        tokens: Math.ceil(initialMessage.length / 4),
      });
    }

    return chatId;
  },
});

export const createMessage = mutation({
  args: {
    chatId: v.id("chats"),
    userId: v.string(),
    role: v.union(
      v.literal("user"),
      v.literal("assistant"),
      v.literal("system"),
    ),
    content: v.string(),
  },
  returns: v.id("messages"),
  handler: async (ctx, { chatId, userId, role, content }) => {
    const chat = await ctx.db.get(chatId);
    if (!chat || chat.userId !== userId || chat.isDeleted) {
      throw new Error("Unauthorized or chat not found");
    }

    const now = Date.now();

    // Insert message
    const messageId = await ctx.db.insert("messages", {
      chatId,
      role,
      content,
      status: role === "user" ? "sent" : "pending",
      createdAt: now,
      tokens: Math.ceil(content.length / 4),
    });

    // Update chat metadata
    await ctx.db.patch(chatId, {
      updatedAt: now,
      messageCount: chat.messageCount + 1,
    });

    return messageId;
  },
});

export const updateMessage = mutation({
  args: {
    messageId: v.id("messages"),
    userId: v.string(),
    content: v.optional(v.string()),
    status: v.optional(
      v.union(
        v.literal("pending"),
        v.literal("streaming"),
        v.literal("sent"),
        v.literal("error"),
      ),
    ),
    append: v.optional(v.boolean()),
  },
  returns: v.null(),
  handler: async (ctx, { messageId, userId, content, status, append }) => {
    const message = await ctx.db.get(messageId);
    if (!message) throw new Error("Message not found");

    const chat = await ctx.db.get(message.chatId);
    if (!chat || chat.userId !== userId) {
      throw new Error("Unauthorized");
    }

    const updates: Partial<typeof message> = {};

    if (status) updates.status = status;

    if (content !== undefined) {
      if (append && message.content) {
        updates.content = message.content + content;
      } else {
        updates.content = content;
      }
      updates.updatedAt = Date.now();
    }

    await ctx.db.patch(messageId, updates);

    // If completing, update chat timestamp
    if (status === "sent" && message.status !== "sent") {
      await ctx.db.patch(message.chatId, {
        updatedAt: Date.now(),
      });
    }
  },
});

export const softDeleteChat = mutation({
  args: {
    chatId: v.id("chats"),
    userId: v.string(),
  },
  returns: v.null(),
  handler: async (ctx, { chatId, userId }) => {
    const chat = await ctx.db.get(chatId);
    if (!chat || chat.userId !== userId) {
      throw new Error("Unauthorized");
    }

    await ctx.db.patch(chatId, {
      isDeleted: true,
      updatedAt: Date.now(),
      name: "",
    });
  },
});

export const renameChat = mutation({
  args: {
    chatId: v.id("chats"),
    userId: v.string(),
    name: v.string(),
  },
  returns: v.null(),
  handler: async (ctx, { chatId, userId, name }) => {
    const chat = await ctx.db.get(chatId);
    if (!chat || chat.userId !== userId) {
      throw new Error("Unauthorized");
    }

    await ctx.db.patch(chatId, {
      name: name.trim(),
      updatedAt: Date.now(),
    });
  },
});
