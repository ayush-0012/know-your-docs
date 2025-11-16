"use client";

import { ScrollArea } from "@/components/ui/scroll-area";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { useEventSource } from "@/hooks/eventSource";
import { useChatMessages } from "@/hooks/useChatMessages";
import { getCurrUser } from "@/lib/actions/general.actions";
import axiosInstance from "@/lib/axiosInstance";
import type { Chat, Message, User } from "@/lib/types/types";
import { FileText, Loader2 } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { ChatInput } from "./chat/ChatInput";
import { ChatSidebar } from "./chat/ChatSidebar";
import { MessageItem } from "./chat/MessageItem";

const Chat = () => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [chats, setChats] = useState<Chat[]>([]);
  const [isCenteredInput, setIsCenteredInput] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadingFile, setUploadingFile] = useState<File | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isUserLoading, setIsUserLoading] = useState(true);

  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const isAtBottomRef = useRef(true);

  const chatId = searchParams?.get("chatId");
  const { messages, setMessages, currentFile, setCurrentFile } =
    useChatMessages(chatId, user?.id || null);
  const { eventSourceRef, closeEventSource } = useEventSource();

  const isEmptyChat = messages.length === 0;

  // Fetch user session
  useEffect(() => {
    async function fetchSession() {
      try {
        setIsUserLoading(true);
        const currUser = await getCurrUser();
        if (currUser?.user) {
          setUser(currUser.user);
        }
      } catch (error) {
        console.error("Failed to fetch user:", error);
      } finally {
        setIsUserLoading(false);
      }
    }
    fetchSession();
  }, []);

  // Fetch all chats
  useEffect(() => {
    const fetchChats = async () => {
      if (!user?.id) return;

      try {
        const response = await axiosInstance.get(
          `/api/v1/chats?userId=${user.id}`
        );

        if (response.data.success) {
          setChats(response.data.userChats);
        }
      } catch (error) {
        console.error("Failed to fetch chats:", error);
      }
    };

    fetchChats();
  }, [user?.id]);

  // Update centered input state
  useEffect(() => {
    if (!chatId) {
      setIsCenteredInput(true);
      setUploadingFile(null);
    } else if (messages.length > 0 || currentFile) {
      setIsCenteredInput(false);
    }
  }, [chatId, messages.length, currentFile]);

  // Track scroll position
  const handleScroll = useCallback(() => {
    if (scrollAreaRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = scrollAreaRef.current;
      isAtBottomRef.current = scrollHeight - scrollTop - clientHeight < 100;
    }
  }, []);

  // Auto-scroll
  useEffect(() => {
    const scrollToBottom = () => {
      if (messagesEndRef.current && isAtBottomRef.current) {
        messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
      }
    };

    const timeoutId = setTimeout(scrollToBottom, 100);
    return () => clearTimeout(timeoutId);
  }, [messages]);

  const handleSendMessage = useCallback(
    async (inputMessage: string) => {
      if (!inputMessage.trim() || isProcessing || !user?.id) return;

      setIsCenteredInput(false);
      setIsProcessing(true);

      const newMessage: Message = {
        id: `temp-user-${Date.now()}`,
        role: "user",
        content: inputMessage,
      };

      setMessages((prev) => [...prev, newMessage]);

      const aiMessageId = `temp-assistant-${Date.now()}`;
      const aiResponse: Message = {
        id: aiMessageId,
        role: "assistant",
        content: "",
        isStreaming: true,
      };
      setMessages((prev) => [...prev, aiResponse]);

      try {
        const chatTitle =
          inputMessage.length > 50
            ? inputMessage.substring(0, 50) + "..."
            : inputMessage;

        const baseUrl = axiosInstance.defaults.baseURL;
        const url = new URL(`${baseUrl}/api/v1/file/query`);
        url.searchParams.set("userId", user.id);
        url.searchParams.set("chatId", chatId || "");
        url.searchParams.set("chatTitle", chatTitle || "");
        url.searchParams.set("userQuery", inputMessage);

        closeEventSource();

        const eventSource = new EventSource(url.toString());
        eventSourceRef.current = eventSource;

        let newChatId: string | null = null;
        let accumulatedText = "";

        eventSource.onmessage = (event) => {
          const chunk = event.data;
          accumulatedText += chunk;

          // Update immediately - backend already throttles at 25ms
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === aiMessageId
                ? { ...msg, content: accumulatedText, isStreaming: true }
                : msg
            )
          );
        };

        eventSource.addEventListener("chatId", (event) => {
          newChatId = event.data;
          console.log("Received new chatId:", newChatId);
        });

        eventSource.addEventListener("end", async () => {
          console.log("Stream ended");

          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === aiMessageId ? { ...msg, isStreaming: false } : msg
            )
          );

          setIsProcessing(false);
          closeEventSource();

          if (newChatId && !chatId) {
            const params = new URLSearchParams(searchParams?.toString() || "");
            params.set("chatId", newChatId);
            router.push(`/chat?${params.toString()}`, { scroll: false });

            try {
              const chatResponse = await axiosInstance.get(
                `/api/v1/chats?userId=${user.id}`
              );
              if (chatResponse.data.success) {
                const newChat = chatResponse.data.userChats.find(
                  (chat: Chat) => chat.id === newChatId
                );

                if (newChat) {
                  setChats((prev) => [newChat, ...prev]);

                  if (newChat.file) {
                    setCurrentFile({
                      id: newChat.file.id,
                      name: newChat.file.fileName || newChat.file.name,
                    });
                  }
                }
              }
            } catch (error) {
              console.error("Failed to fetch new chat:", error);
            }
          }
        });

        eventSource.addEventListener("error", (event: any) => {
          console.error("EventSource error:", event);

          const errorMessage =
            event.data || "An error occurred while processing your request.";

          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === aiMessageId
                ? {
                    ...msg,
                    content: `Sorry, ${errorMessage}`,
                    isStreaming: false,
                  }
                : msg
            )
          );

          setIsProcessing(false);
          closeEventSource();
        });

        eventSource.onerror = () => {
          console.error("EventSource connection error");

          if (accumulatedText === "") {
            setMessages((prev) =>
              prev.map((msg) =>
                msg.id === aiMessageId
                  ? {
                      ...msg,
                      content:
                        "Sorry, I encountered a connection error. Please try again.",
                      isStreaming: false,
                    }
                  : msg
              )
            );
          }

          setIsProcessing(false);
          closeEventSource();
        };
      } catch (error) {
        console.error("Query failed:", error);
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === aiMessageId
              ? {
                  ...msg,
                  content:
                    "Sorry, I encountered an error processing your request. Please try again.",
                  isStreaming: false,
                }
              : msg
          )
        );
        setIsProcessing(false);
      }
    },
    [
      isProcessing,
      user?.id,
      chatId,
      router,
      searchParams,
      setMessages,
      closeEventSource,
      eventSourceRef,
      setCurrentFile,
    ]
  );

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user?.id) return;

    e.target.value = "";

    const allowedTypes = [".pdf", ".doc", ".docx", ".txt"];
    const fileExtension = "." + file.name.split(".").pop()?.toLowerCase();
    if (!allowedTypes.includes(fileExtension)) {
      alert("Please upload a valid file type: PDF, DOC, DOCX, or TXT");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      alert("File size must be less than 10MB");
      return;
    }

    setUploadingFile(file);
    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("userId", user.id);
      if (chatId) {
        formData.append("chatId", chatId);
      }

      const response = await axiosInstance.post(
        "/api/v1/file/upload",
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      if (response.data.success) {
        const fileInfo = {
          id: response.data.docDetails.id,
          name: response.data.docDetails.fileName,
        };

        if (response.data.docDetails && response.data.docDetails.fileName) {
          setCurrentFile(fileInfo);
          setIsCenteredInput(false);
        }

        if (response.data.docDetails.chatId && !chatId) {
          const newChatId = response.data.docDetails.chatId;

          const newChat: Chat = {
            id: newChatId,
            chatTitle: response.data.docDetails.fileName || "New Chat",
            timestamp: new Date(),
          };

          setChats((prev) => [newChat, ...prev]);
          router.push(`/chat?chatId=${newChatId}`);
        } else if (chatId) {
          setCurrentFile(fileInfo);
        }

        setTimeout(() => {
          setUploadingFile(null);
        }, 1500);
      }
    } catch (error) {
      console.error("Upload failed:", error);
      alert("Failed to upload file. Please try again.");
      setUploadingFile(null);
    } finally {
      setIsUploading(false);
    }
  };

  const handleChatClick = (chatId: string) => {
    router.push(`/chat?chatId=${chatId}`);
  };

  const handleNewChat = () => {
    router.push("/chat");
  };

  const removeFile = useCallback(() => {
    setUploadingFile(null);
    setIsUploading(false);
  }, []);

  const formatFileSize = useCallback((bytes: number) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  }, []);

  if (isUserLoading) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-neutral-900">
        <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
      </div>
    );
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen w-full flex bg-neutral-900">
        <ChatSidebar
          chats={chats}
          currentChatId={chatId}
          onChatClick={handleChatClick}
          onNewChat={handleNewChat}
        />

        <div className="flex-1 flex flex-col h-screen">
          <header className="h-14 border-b border-neutral-800 flex items-center px-6 gap-4 bg-neutral-900 flex-shrink-0 z-20">
            <SidebarTrigger className="text-neutral-400" />

            {currentFile && !isEmptyChat && (
              <div className="flex items-center gap-2 px-4 py-2 bg-neutral-800/50 rounded-lg border border-neutral-700/50">
                <FileText className="w-4 h-4 text-purple-400" />
                <span className="text-sm font-medium text-neutral-100">
                  {currentFile.name}
                </span>
              </div>
            )}
          </header>

          <div className="flex-1 relative overflow-hidden">
            <ScrollArea
              className="h-full bg-neutral-900"
              ref={scrollAreaRef}
              onScroll={handleScroll}
            >
              <div className={`${!isEmptyChat ? "pt-8" : ""}`}>
                <div className="max-w-3xl mx-auto space-y-6 px-6 pb-[200px]">
                  {messages.map((message) => (
                    <MessageItem key={message.id} message={message} />
                  ))}

                  {isProcessing &&
                    messages[messages.length - 1]?.role === "user" && (
                      <div className="flex justify-start">
                        <div className="bg-neutral-800/50 rounded-2xl px-5 py-3">
                          <div className="flex items-center gap-2">
                            <Loader2 className="w-4 h-4 animate-spin text-neutral-400" />
                            <span className="text-neutral-400 text-sm">
                              Thinking...
                            </span>
                          </div>
                        </div>
                      </div>
                    )}

                  <div ref={messagesEndRef} />
                </div>
              </div>
            </ScrollArea>

            {isEmptyChat && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="text-center mb-32">
                  <h1 className="text-3xl font-light text-neutral-200 mb-2">
                    Upload and know your docs
                  </h1>
                  <p className="text-neutral-500 text-sm">
                    Upload documents and start asking questions
                  </p>
                </div>
              </div>
            )}

            {isCenteredInput && (
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-3xl px-6 z-10">
                <ChatInput
                  onSend={handleSendMessage}
                  isProcessing={isProcessing}
                  isUserLoading={isUserLoading}
                  uploadingFile={uploadingFile}
                  isUploading={isUploading}
                  onFileUpload={handleFileUpload}
                  onRemoveFile={removeFile}
                  formatFileSize={formatFileSize}
                  isCentered={true}
                />
              </div>
            )}
          </div>

          {!isCenteredInput && (
            <div className="border-t border-neutral-800 bg-neutral-900 flex-shrink-0 z-20">
              <div className="max-w-3xl mx-auto px-6 py-4">
                <ChatInput
                  onSend={handleSendMessage}
                  isProcessing={isProcessing}
                  isUserLoading={isUserLoading}
                  uploadingFile={uploadingFile}
                  isUploading={isUploading}
                  onFileUpload={handleFileUpload}
                  onRemoveFile={removeFile}
                  formatFileSize={formatFileSize}
                  isCentered={false}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </SidebarProvider>
  );
};

export default Chat;
