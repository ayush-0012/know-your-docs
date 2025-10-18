"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
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
import { MessageSquare, Paperclip, Plus, Send, Upload } from "lucide-react";
import { useState } from "react";

interface Chat {
  id: string;
  title: string;
  timestamp: Date;
}

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

const Chat = () => {
  const [chats] = useState<Chat[]>([
    { id: "1", title: "Product Documentation Q&A", timestamp: new Date() },
    {
      id: "2",
      title: "Research Paper Analysis",
      timestamp: new Date(Date.now() - 86400000),
    },
  ]);

  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "assistant",
      content:
        "Hello! Upload a document and ask me anything about it. I'm here to help you understand your docs.",
    },
  ]);

  const [inputValue, setInputValue] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleSendMessage = () => {
    if (!inputValue.trim() && !selectedFile) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: inputValue || `Uploaded: ${selectedFile?.name}`,
    };

    setMessages([...messages, newMessage]);
    setInputValue("");
    setSelectedFile(null);

    // Simulate AI response
    setTimeout(() => {
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content:
          "I've processed your request. This is a demo response. In production, this would analyze your document using RAG technology.",
      };
      setMessages((prev) => [...prev, aiResponse]);
    }, 1000);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen w-full flex bg-background">
        {/* Sidebar */}
        <Sidebar className="border-r border-border">
          <div className="p-4 border-b border-border flex items-center justify-between">
            <h2 className="font-semibold text-lg">Chats</h2>
            <Button size="icon" variant="ghost">
              <Plus className="w-4 h-4" />
            </Button>
          </div>

          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel>Recent</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {chats.map((chat) => (
                    <SidebarMenuItem key={chat.id}>
                      <SidebarMenuButton>
                        <MessageSquare className="w-4 h-4" />
                        <span className="truncate">{chat.title}</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
        </Sidebar>

        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <header className="h-16 border-b border-border flex items-center px-6 gap-4">
            <SidebarTrigger />
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              <span className="font-semibold">Know Your Docs</span>
            </div>
          </header>

          {/* Messages Area */}
          <ScrollArea className="flex-1 p-6">
            <div className="max-w-3xl mx-auto space-y-6">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex gap-4 ${
                    message.role === "assistant"
                      ? "justify-start"
                      : "justify-end"
                  }`}
                >
                  {message.role === "assistant" && (
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <MessageSquare className="w-4 h-4 text-primary" />
                    </div>
                  )}

                  <Card
                    className={`p-4 max-w-[80%] ${
                      message.role === "assistant"
                        ? "bg-card"
                        : "bg-primary text-primary-foreground"
                    }`}
                  >
                    <p className="text-sm leading-relaxed">{message.content}</p>
                  </Card>

                  {message.role === "user" && (
                    <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center flex-shrink-0">
                      <span className="text-xs font-semibold">You</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </ScrollArea>

          {/* Input Area */}
          <div className="border-t border-border p-6">
            <div className="max-w-3xl mx-auto">
              {selectedFile && (
                <div className="mb-3 flex items-center gap-2 text-sm text-muted-foreground">
                  <Paperclip className="w-4 h-4" />
                  <span>{selectedFile.name}</span>
                  <button
                    onClick={() => setSelectedFile(null)}
                    className="ml-auto text-destructive hover:underline"
                  >
                    Remove
                  </button>
                </div>
              )}

              <div className="flex gap-2">
                <label htmlFor="file-upload">
                  <Button variant="outline" size="icon" asChild>
                    <span className="cursor-pointer">
                      <Upload className="w-4 h-4" />
                    </span>
                  </Button>
                </label>
                <input
                  id="file-upload"
                  type="file"
                  className="hidden"
                  onChange={handleFileChange}
                  accept=".pdf,.doc,.docx,.txt"
                />

                <Input
                  placeholder="Ask anything about your documents..."
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                  className="flex-1"
                />

                <Button
                  onClick={handleSendMessage}
                  size="icon"
                  className="bg-purple-600"
                >
                  <Send className="w-4 h-4 text-white" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default Chat;
