import { fetchChatData } from "@/services/file.services";
import type { Request, Response } from "express";

export async function fetchChats(req: Request, res: Response) {
  const { userId, chatId } = req.body;

  try {
    const chats = await fetchChatData(chatId, userId);

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
