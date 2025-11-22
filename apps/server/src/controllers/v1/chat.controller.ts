import { db } from "@/db";
import { chat } from "@/db/schema/schema";
import { fetchChatData } from "@/services/file.services";
import { desc, eq } from "drizzle-orm";
import type { Request, Response } from "express";

export async function fetchChatConversation(req: Request, res: Response) {
  const { chatId } = req.params;
  const { userId } = req.query;

  if (!userId || !chatId)
    return res.status(404).json({ message: "required fields are missing" });

  try {
    const userIdStr = userId.toString();
    const chats = await fetchChatData(chatId, userIdStr);

    console.log("chats data", chats);

    return res.status(200).json({
      success: true,
      message: "Fetched chat successfully",
      chats,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error occurred while fetching chat",
      error,
    });
  }
}

export async function fetchUserChats(req: Request, res: Response) {
  const { userId } = req.query;

  console.log("userid", userId);

  if (!userId) {
    return res.status(404).json({
      message: "userId is required to fetchig chats",
    });
  }

  try {
    // Casting userId as string
    const userIdStr = userId.toString();
    const userChats = await db
      .select()
      .from(chat)
      .where(eq(chat.userId, userIdStr))
      .orderBy(desc(chat.createdAt));

    console.log("userchats by latest", userChats);

    return res.status(200).json({
      success: true,
      message: "Successfully fetched user chats",
      userChats,
    });
  } catch (error) {
    return res.status(500).json({
      success: true,
      message: "Error occurred while fetching user chats",
      error,
    });
  }
}
