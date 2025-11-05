import {
  fetchChatConversation,
  fetchUserChats,
} from "@/controllers/v1/chat.controller";
import type { Router } from "express";
import express from "express";

const router: Router = express.Router();

// router.post("/v1/chat/fetch", fetchChatConversation);

router.get("/v1/chats", fetchUserChats);

router.get("/v1/chat/:chatId/messages", fetchChatConversation);

export const chatRouter: Router = router;
