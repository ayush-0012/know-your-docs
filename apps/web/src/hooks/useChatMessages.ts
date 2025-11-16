"use client";

import axiosInstance from "@/lib/axiosInstance";
import type { ChatDetail, Message } from "@/lib/types/types";
import { useEffect, useState } from "react";

export const useChatMessages = (
  chatId: string | null,
  userId: string | null
) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentFile, setCurrentFile] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchChatMessages = async () => {
      if (!chatId) {
        setMessages([]);
        setCurrentFile(null);
        return;
      }

      if (!userId) return;

      setIsLoading(true);

      try {
        const response = await axiosInstance.get(
          `/api/v1/chat/${chatId}/messages`,
          {
            params: { userId },
          }
        );

        if (response.data.success) {
          const chatDetail: ChatDetail = response.data.chats;

          if (chatDetail.file) {
            setCurrentFile({
              id: chatDetail.file.id,
              name: chatDetail.file.fileName || chatDetail.file.name,
            });
          }

          const convertedMessages: Message[] = [];
          chatDetail.queries.forEach((query, index) => {
            convertedMessages.push({
              id: `${query.id}-user-${index}`,
              role: "user",
              content: query.query,
            });
            convertedMessages.push({
              id: `${query.id}-assistant-${index}`,
              role: "assistant",
              content: query.response,
            });
          });

          setMessages(convertedMessages);
        }
      } catch (error) {
        console.error("Failed to fetch chat messages:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchChatMessages();
  }, [chatId, userId]);

  return { messages, setMessages, currentFile, setCurrentFile, isLoading };
};
