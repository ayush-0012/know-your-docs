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
import { AnimatePresence, motion } from "framer-motion";
import { FileText, Loader2, Plus, Send, X } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";

interface Chat {
  id: string;
  chatTitle: string;
  timestamp: Date;
}

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  isStreaming?: boolean;
}

interface User {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  image?: string | null | undefined;
  createdAt: Date;
  updatedAt: Date;
}

const Chat = () => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [chats, setChats] = useState<Chat[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [streamingText, setStreamingText] = useState("");
  const [isCenteredInput, setIsCenteredInput] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadingFile, setUploadingFile] = useState<File | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const chatId = searchParams.get("chatId");
  const isEmptyChat = messages.length === 0;

  useEffect(() => {
    async function fetchSession() {
      const currUser = await getCurrUser();
      if (currUser?.user) {
        setUser(currUser.user);
      }
    }
    fetchSession();
  }, []);

  // Fetch all chats on mount
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

        console.log(response.data.userChats);
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
        setIsCenteredInput(true);
        return;
      }

      try {
        const response = await axiosInstance.get(
          `/api/v1/chat/${chatId}/messages`
        );
        if (response.data.success) {
          setMessages(response.data.messages);
          setIsCenteredInput(false);
        }
      } catch (error) {
        console.error("Failed to fetch chat messages:", error);
      }
    };

    fetchChatMessages();
  }, [chatId]);

  // Auto-scroll with proper handling
  useEffect(() => {
    const scrollToBottom = () => {
      if (messagesEndRef.current) {
        messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
      }
    };

    const timeoutId = setTimeout(scrollToBottom, 100);
    return () => clearTimeout(timeoutId);
  }, [messages, streamingText]);

  const simulateStreaming = (
    text: string,
    messageId: string,
    newChatId?: string
  ) => {
    let index = 0;
    const interval = setInterval(() => {
      if (index < text.length) {
        setStreamingText(text.slice(0, index + 1));
        index++;
      } else {
        clearInterval(interval);
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === messageId
              ? { ...msg, content: text, isStreaming: false }
              : msg
          )
        );
        setStreamingText("");

        if (newChatId && !chatId) {
          const params = new URLSearchParams(searchParams.toString());
          params.set("chatId", newChatId);
          router.push(`?${params.toString()}`, { scroll: false });
        }
      }
    }, 20);
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isProcessing) return;

    setIsCenteredInput(false);
    setIsProcessing(true);

    const newMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: inputValue,
    };

    setMessages((prev) => [...prev, newMessage]);
    setInputValue("");

    try {
      const response = await axiosInstance.post("/api/v1/file/query", {
        userId: user?.id,
        chatId: chatId || undefined,
        chatTitle: "something",
        userQuery: inputValue,
      });

      if (response.data.success) {
        const aiMessageId = (Date.now() + 1).toString();
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

        // If new chat was created, fetch it and add to sidebar
        if (response.data.chatId && !chatId) {
          try {
            const chatResponse = await axiosInstance.get(
              `/api/v1/chat/${response.data.chatId}`
            );
            if (chatResponse.data.success) {
              setChats((prev) => [chatResponse.data.chat, ...prev]);
            }
          } catch (error) {
            console.error("Failed to fetch new chat:", error);
          }
        }
      }
    } catch (error) {
      console.error("query failed:", error);
      const errorMessageId = (Date.now() + 1).toString();
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
    if (!file) return;
    e.target.value = "";

    setUploadingFile(file);
    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("userId", user?.id || "");
      formData.append("chatId", chatId ?? "");

      const response = await axiosInstance.post(
        "/api/v1/file/upload",
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      // If a new chat was created, update the URL
      if (response.data.success && response.data.chatId && !chatId) {
        router.push(`/chat?chatId=${response.data.chatId}`);
      }
    } catch (error) {
      console.error("Upload failed:", error);
      alert("Failed to upload file.");
      setUploadingFile(null);
    } finally {
      setTimeout(() => setIsUploading(false), 1000);
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
                        className="text-neutral-300 hover:text-neutral-100 hover:bg-neutral-800"
                        onClick={() => handleChatClick(chat.id)}
                      >
                        {/* <MessageSquare className="w-4 h-4" /> */}
                        <span className="truncate text-white  ">
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
        <div className="flex-1 flex flex-col relative">
          <header className="h-14 border-b border-neutral-800 flex items-center px-6 gap-4 bg-neutral-900">
            <SidebarTrigger className="text-neutral-400" />
          </header>

          {/* Chat Messages */}
          <ScrollArea className="flex-1 bg-neutral-900" ref={scrollAreaRef}>
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

          {/* Input Box - Fixed at bottom */}
          <div
            className={`fixed bottom-0 left-0 right-0 flex items-center justify-center transition-all duration-500 bg-gradient-to-t from-neutral-900 via-neutral-900/95 to-transparent pt-8 ${
              isCenteredInput ? "hidden" : ""
            }`}
            style={{
              marginLeft: "var(--sidebar-width, 0px)",
            }}
          >
            <div className="w-full max-w-3xl px-6 pb-6">
              <div
                className={`bg-[#1c1c1c]/95 backdrop-blur-md border border-[#2a2a2a] rounded-2xl shadow-2xl transition-all duration-300 ${
                  uploadingFile ? "py-3" : "py-2"
                }`}
              >
                <div className="flex flex-col gap-2 px-3">
                  {/* File Chip */}
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
                                  <span className="text-blue-400 ml-1">
                                    Uploading...
                                  </span>
                                )}
                                {!isUploading && (
                                  <span className="text-green-400 ml-1">
                                    ✓ Ready
                                  </span>
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

                  {/* Input Row */}
                  <div className="flex items-center gap-3">
                    <input
                      type="file"
                      id="file-upload"
                      hidden
                      onChange={handleFileUpload}
                      disabled={isUploading}
                      accept=".pdf,.doc,.docx,.txt"
                    />

                    <button
                      onClick={() =>
                        document.getElementById("file-upload")?.click()
                      }
                      disabled={isUploading}
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
                      disabled={isProcessing}
                      className="flex-1 bg-transparent border-0 text-neutral-100 placeholder-neutral-500 outline-none text-[15px] py-3 px-1 disabled:opacity-50"
                    />

                    <button
                      onClick={handleSendMessage}
                      disabled={!inputValue.trim() || isProcessing}
                      className={`p-2.5 rounded-full transition flex-shrink-0 ${
                        inputValue.trim() && !isProcessing
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
            </div>
          </div>

          {/* Centered Input for empty state */}
          {isCenteredInput && (
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-3xl px-6">
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
                                  <span className="text-blue-400 ml-1">
                                    Uploading...
                                  </span>
                                )}
                                {!isUploading && (
                                  <span className="text-green-400 ml-1">
                                    ✓ Ready
                                  </span>
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
                      id="file-upload-center"
                      hidden
                      onChange={handleFileUpload}
                      disabled={isUploading}
                      accept=".pdf,.doc,.docx,.txt"
                    />

                    <button
                      onClick={() =>
                        document.getElementById("file-upload-center")?.click()
                      }
                      disabled={isUploading}
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
                      disabled={isProcessing}
                      className="flex-1 bg-transparent border-0 text-neutral-100 placeholder-neutral-500 outline-none text-[15px] py-3 px-1 disabled:opacity-50"
                    />

                    <button
                      onClick={handleSendMessage}
                      disabled={!inputValue.trim() || isProcessing}
                      className={`p-2.5 rounded-full transition flex-shrink-0 ${
                        inputValue.trim() && !isProcessing
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
            </div>
          )}
        </div>
      </div>
    </SidebarProvider>
  );
};

export default Chat;
