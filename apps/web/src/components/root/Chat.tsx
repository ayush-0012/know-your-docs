"use client";

import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { getCurrUser } from "@/lib/actions/general.actions";
import axiosInstance from "@/lib/axiosInstance";
import type {
  Chat,
  ChatDetail,
  FileInfo,
  Message,
  User,
} from "@/lib/types/types";
import { AnimatePresence, motion } from "framer-motion";
import { FileText, Loader2, Plus, Send, X } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";

const Chat = () => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [chats, setChats] = useState<Chat[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentFile, setCurrentFile] = useState<FileInfo | null>(null);
  const [inputValue, setInputValue] = useState("");
  const [streamingText, setStreamingText] = useState("");
  const [isCenteredInput, setIsCenteredInput] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadingFile, setUploadingFile] = useState<File | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isUserLoading, setIsUserLoading] = useState(true);

  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const streamingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const isAtBottomRef = useRef(true);

  const chatId = searchParams?.get("chatId");
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

  // Fetch all chats when user is available
  useEffect(() => {
    const fetchChats = async () => {
      if (!user?.id) return;

      try {
        const response = await axiosInstance.get(
          `/api/v1/chats?userId=${user.id}`
        );

        console.log("user chats", response.data);

        if (response.data.success) {
          setChats(response.data.userChats);
        }
      } catch (error) {
        console.error("Failed to fetch chats:", error);
      }
    };

    fetchChats();
  }, [user?.id]);

  // Fetch messages when chatId changes
  useEffect(() => {
    const fetchChatMessages = async () => {
      if (!chatId) {
        setMessages([]);
        setCurrentFile(null);
        setIsCenteredInput(true);
        setUploadingFile(null);
        return;
      }

      if (!user?.id) return;

      console.log(chatId);
      console.log(user?.id);

      try {
        const response = await axiosInstance.get(
          `/api/v1/chat/${chatId}/messages`,
          {
            params: { userId: user.id },
          }
        );

        console.log("conversation", response.data);

        if (response.data.success) {
          const chatDetail: ChatDetail = response.data.chats;

          // Set current file - handle both name and fileName properties
          if (chatDetail.file) {
            setCurrentFile({
              id: chatDetail.file.id,
              name: chatDetail.file.fileName || chatDetail.file.name,
            });
          }

          // Convert queries to messages with unique IDs
          const convertedMessages: Message[] = [];
          chatDetail.queries.forEach((query, index) => {
            // Add user message with unique ID
            convertedMessages.push({
              id: `${query.id}-user-${index}`,
              role: "user",
              content: query.query,
            });
            // Add assistant response with unique ID
            convertedMessages.push({
              id: `${query.id}-assistant-${index}`,
              role: "assistant",
              content: query.response,
            });
          });

          setMessages(convertedMessages);

          // Only set centered input to false if there are messages
          if (convertedMessages.length > 0 || chatDetail.file) {
            setIsCenteredInput(false);
          }
          setUploadingFile(null);
        }
      } catch (error) {
        console.error("Failed to fetch chat messages:", error);
      }
    };

    fetchChatMessages();
  }, [chatId, user?.id]);

  // Cleanup streaming interval on unmount
  useEffect(() => {
    return () => {
      if (streamingIntervalRef.current) {
        clearInterval(streamingIntervalRef.current);
      }
    };
  }, []);

  // Track if user is at bottom for auto-scroll
  const handleScroll = useCallback(() => {
    if (scrollAreaRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = scrollAreaRef.current;
      isAtBottomRef.current = scrollHeight - scrollTop - clientHeight < 100;
    }
  }, []);

  // Auto-scroll only if user is at bottom
  useEffect(() => {
    const scrollToBottom = () => {
      if (messagesEndRef.current && isAtBottomRef.current) {
        messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
      }
    };

    const timeoutId = setTimeout(scrollToBottom, 100);
    return () => clearTimeout(timeoutId);
  }, [messages, streamingText]);

  const simulateStreaming = useCallback(
    (text: string, messageId: string, newChatId?: string) => {
      let index = 0;

      // Clear any existing interval
      if (streamingIntervalRef.current) {
        clearInterval(streamingIntervalRef.current);
      }

      streamingIntervalRef.current = setInterval(() => {
        if (index < text.length) {
          // Increase chunk size for faster streaming
          const chunkSize = 3;
          setStreamingText(text.slice(0, index + chunkSize));
          index += chunkSize;
        } else {
          if (streamingIntervalRef.current) {
            clearInterval(streamingIntervalRef.current);
            streamingIntervalRef.current = null;
          }

          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === messageId
                ? { ...msg, content: text, isStreaming: false }
                : msg
            )
          );
          setStreamingText("");

          // Update URL if new chat was created
          if (newChatId && !chatId) {
            const params = new URLSearchParams(searchParams?.toString() || "");
            params.set("chatId", newChatId);
            router.push(`/chat?${params.toString()}`, { scroll: false });
          }
        }
      }, 10);
    },
    [chatId, router, searchParams]
  );

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isProcessing || !user?.id) return;

    setIsCenteredInput(false);
    setIsProcessing(true);

    const newMessage: Message = {
      id: `temp-user-${Date.now()}`,
      role: "user",
      content: inputValue,
    };

    setMessages((prev) => [...prev, newMessage]);
    const query = inputValue;
    setInputValue("");

    try {
      // Generate chat title from first few words of query
      const chatTitle =
        query.length > 50 ? query.substring(0, 50) + "..." : query;

      const response = await axiosInstance.post("/api/v1/file/query", {
        userId: user.id,
        chatId: chatId || undefined,
        chatTitle: chatTitle,
        userQuery: query,
      });

      if (response.data.success) {
        const aiMessageId = `temp-assistant-${Date.now()}`;
        const aiResponse: Message = {
          id: aiMessageId,
          role: "assistant",
          content: "",
          isStreaming: true,
        };

        setMessages((prev) => [...prev, aiResponse]);
        simulateStreaming(
          response.data.answer,
          aiMessageId,
          response.data.chatId
        );

        // If new chat was created, fetch and add to sidebar
        if (response.data.chatId && !chatId) {
          try {
            // Fetch all chats to get the new one
            const chatResponse = await axiosInstance.get(
              `/api/v1/chats?userId=${user.id}`
            );
            if (chatResponse.data.success) {
              // Find the newly created chat
              const newChat = chatResponse.data.userChats.find(
                (chat: Chat) => chat.id === response.data.chatId
              );

              if (newChat) {
                setChats((prev) => [newChat, ...prev]);

                // Set current file if available
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
      }
    } catch (error) {
      console.error("Query failed:", error);
      const errorMessageId = `temp-error-${Date.now()}`;
      const errorMessage: Message = {
        id: errorMessageId,
        role: "assistant",
        content:
          "Sorry, I encountered an error processing your request. Please try again.",
        isStreaming: false,
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user?.id) return;

    e.target.value = "";

    // Validate file type
    const allowedTypes = [".pdf", ".doc", ".docx", ".txt"];
    const fileExtension = "." + file.name.split(".").pop()?.toLowerCase();
    if (!allowedTypes.includes(fileExtension)) {
      alert("Please upload a valid file type: PDF, DOC, DOCX, or TXT");
      return;
    }

    // Validate file size (e.g., max 10MB)
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

      console.log("file upload res", response.data);

      if (response.data.success) {
        const fileInfo = {
          id: response.data.docDetails.id,
          name: response.data.docDetails.fileName,
        };

        // Set the current file info from docDetails
        if (response.data.docDetails && response.data.docDetails.fileName) {
          setCurrentFile(fileInfo);
          setIsCenteredInput(false);
        }

        // If new chat was created, navigate to it and add to sidebar
        if (response.data.docDetails.chatId && !chatId) {
          const newChatId = response.data.docDetails.chatId;

          // Create a new chat object for the sidebar using the filename as title
          const newChat: Chat = {
            id: newChatId,
            chatTitle: response.data.docDetails.fileName || "New Chat",
            timestamp: new Date(),
          };

          // Add to sidebar immediately
          setChats((prev) => [newChat, ...prev]);

          // Navigate to the new chat
          router.push(`/chat?chatId=${newChatId}`);
        } else if (chatId) {
          // If uploading to existing chat, just update the file info
          setCurrentFile(fileInfo);
        }

        // Clear upload state after successful upload
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

  const removeFile = () => {
    setUploadingFile(null);
    setIsUploading(false);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  // Render input component (DRY principle)
  const renderInputBox = (isCentered: boolean) => (
    <div
      className={`bg-[#1c1c1c]/95 backdrop-blur-md border border-[#2a2a2a] rounded-2xl shadow-2xl transition-all duration-300 ${
        uploadingFile ? "py-3" : "py-2"
      }`}
    >
      <div className="flex flex-col gap-2 px-3">
        <AnimatePresence>
          {uploadingFile && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="flex items-center justify-between bg-[#242424] border border-neutral-700 rounded-xl px-3 py-2">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-6 h-6 bg-neutral-800 rounded-md flex items-center justify-center flex-shrink-0">
                    <FileText className="w-4 h-4 text-neutral-400" />
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-[13px] text-neutral-200">
                      {uploadingFile.name}
                    </p>
                    <p className="text-xs text-neutral-500">
                      {formatFileSize(uploadingFile.size)}{" "}
                      {isUploading && (
                        <span className="text-blue-400 ml-1">Uploading...</span>
                      )}
                      {!isUploading && (
                        <span className="text-green-400 ml-1">✓ Ready</span>
                      )}
                    </p>
                  </div>
                </div>
                <button
                  onClick={removeFile}
                  className="p-1 rounded-md hover:bg-neutral-700 transition flex-shrink-0"
                >
                  <X className="w-4 h-4 text-neutral-400 hover:text-neutral-200" />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex items-center gap-3">
          <input
            type="file"
            id={isCentered ? "file-upload-center" : "file-upload"}
            hidden
            onChange={handleFileUpload}
            disabled={isUploading || isUserLoading}
            accept=".pdf,.doc,.docx,.txt"
          />

          <button
            onClick={() =>
              document
                .getElementById(
                  isCentered ? "file-upload-center" : "file-upload"
                )
                ?.click()
            }
            disabled={isUploading || isUserLoading}
            className="text-neutral-400 hover:text-white transition disabled:opacity-50 flex-shrink-0"
          >
            {isUploading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Plus className="w-5 h-5" />
            )}
          </button>

          <input
            placeholder="Ask anything..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
            disabled={isProcessing || isUserLoading}
            className="flex-1 bg-transparent border-0 text-neutral-100 placeholder-neutral-500 outline-none text-[15px] py-3 px-1 disabled:opacity-50"
          />

          <button
            onClick={handleSendMessage}
            disabled={!inputValue.trim() || isProcessing || isUserLoading}
            className={`p-2.5 rounded-full transition flex-shrink-0 ${
              inputValue.trim() && !isProcessing && !isUserLoading
                ? "bg-purple-600 hover:bg-purple-700 text-white"
                : "bg-[#2a2a2a] text-neutral-500 cursor-not-allowed"
            }`}
          >
            {isProcessing ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>
    </div>
  );

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
        {/* Sidebar */}
        <Sidebar className="border-r border-neutral-800 bg-neutral-900">
          <div className="p-4 border-b border-neutral-800 flex items-center justify-between">
            <h2 className="font-semibold text-lg text-neutral-100">Chats</h2>
            <Button
              size="icon"
              variant="ghost"
              className="text-neutral-400 hover:text-neutral-100"
              onClick={handleNewChat}
            >
              <Plus className="w-4 h-4" />
            </Button>
          </div>

          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel className="text-neutral-400">
                Recent
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {chats.map((chat) => (
                    <SidebarMenuItem key={chat.id}>
                      <SidebarMenuButton
                        className={`text-neutral-300 hover:text-neutral-100 hover:bg-neutral-800 ${
                          chatId === chat.id ? "bg-neutral-800" : ""
                        }`}
                        onClick={() => handleChatClick(chat.id)}
                      >
                        <span className="truncate text-white">
                          {chat.chatTitle}
                        </span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
        </Sidebar>

        {/* Main Chat Section */}
        <div className="flex-1 flex flex-col h-screen">
          {/* Fixed Header - Outside ScrollArea */}
          <header className="h-14 border-b border-neutral-800 flex items-center px-6 gap-4 bg-neutral-900 flex-shrink-0 z-20">
            <SidebarTrigger className="text-neutral-400" />

            {/* Pinned File Indicator */}
            {currentFile && !isEmptyChat && (
              <div className="flex items-center gap-2 px-4 py-2 bg-neutral-800/50 rounded-lg border border-neutral-700/50">
                <FileText className="w-4 h-4 text-purple-400" />
                <span className="text-sm font-medium text-neutral-100">
                  {currentFile.name}
                </span>
              </div>
            )}
          </header>

          {/* Chat Messages Container - This is the scrollable area */}
          <div className="flex-1 relative overflow-hidden">
            <ScrollArea
              className="h-full bg-neutral-900"
              ref={scrollAreaRef}
              onScroll={handleScroll}
            >
              <div className={`${!isEmptyChat ? "pt-8" : ""}`}>
                <div className="max-w-3xl mx-auto space-y-6 px-6 pb-[200px]">
                  {messages.map((message) => (
                    <div key={message.id} className="space-y-2">
                      {message.role === "user" ? (
                        <div className="flex justify-end">
                          <div className="bg-neutral-800 rounded-2xl px-5 py-3 max-w-[80%]">
                            <p className="text-neutral-100 text-sm leading-relaxed">
                              {message.content}
                            </p>
                          </div>
                        </div>
                      ) : (
                        <div className="flex justify-start">
                          <div className="max-w-[85%]">
                            <div className="prose prose-invert prose-sm max-w-none">
                              <ReactMarkdown
                                components={{
                                  p: ({ children }) => (
                                    <p className="text-neutral-200 leading-relaxed mb-4 last:mb-0">
                                      {children}
                                    </p>
                                  ),
                                  ul: ({ children }) => (
                                    <ul className="text-neutral-200 space-y-2 my-4 list-disc pl-6">
                                      {children}
                                    </ul>
                                  ),
                                  ol: ({ children }) => (
                                    <ol className="text-neutral-200 space-y-2 my-4 list-decimal pl-6">
                                      {children}
                                    </ol>
                                  ),
                                  li: ({ children }) => (
                                    <li className="text-neutral-200 leading-relaxed">
                                      {children}
                                    </li>
                                  ),
                                  strong: ({ children }) => (
                                    <strong className="text-neutral-100 font-semibold">
                                      {children}
                                    </strong>
                                  ),
                                  code: ({ children }) => (
                                    <code className="bg-neutral-800 text-orange-400 px-1.5 py-0.5 rounded text-sm font-mono">
                                      {children}
                                    </code>
                                  ),
                                  pre: ({ children }) => (
                                    <pre className="bg-neutral-800 rounded-lg p-4 overflow-x-auto my-4">
                                      {children}
                                    </pre>
                                  ),
                                  h1: ({ children }) => (
                                    <h1 className="text-neutral-100 text-2xl font-bold mt-6 mb-4">
                                      {children}
                                    </h1>
                                  ),
                                  h2: ({ children }) => (
                                    <h2 className="text-neutral-100 text-xl font-bold mt-5 mb-3">
                                      {children}
                                    </h2>
                                  ),
                                  h3: ({ children }) => (
                                    <h3 className="text-neutral-100 text-lg font-semibold mt-4 mb-2">
                                      {children}
                                    </h3>
                                  ),
                                }}
                              >
                                {message.isStreaming
                                  ? streamingText
                                  : message.content}
                              </ReactMarkdown>
                              {message.isStreaming && (
                                <span className="inline-block w-0.5 h-4 bg-neutral-400 ml-1 animate-pulse" />
                              )}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}

                  {/* Loading indicator */}
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

            {/* Empty Chat Screen */}
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

            {/* Centered Input for empty state */}
            {isCenteredInput && (
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-3xl px-6 z-10">
                {renderInputBox(true)}
              </div>
            )}
          </div>

          {/* Input Box - Fixed at bottom */}
          {!isCenteredInput && (
            <div className="border-t border-neutral-800 bg-neutral-900 flex-shrink-0 z-20">
              <div className="max-w-3xl mx-auto px-6 py-4">
                {renderInputBox(false)}
              </div>
            </div>
          )}
        </div>
      </div>
    </SidebarProvider>
  );
};

export default Chat;
