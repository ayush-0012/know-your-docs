"use client";

import { Button } from "@/components/ui/button";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import type { Chat } from "@/lib/types/types";
import { Plus } from "lucide-react";

interface ChatSidebarProps {
  chats: Chat[];
  currentChatId: string | null;
  onChatClick: (chatId: string) => void;
  onNewChat: () => void;
}

export const ChatSidebar = ({
  chats,
  currentChatId,
  onChatClick,
  onNewChat,
}: ChatSidebarProps) => {
  return (
    <Sidebar className="border-r border-neutral-800 bg-neutral-900">
      <div className="p-4 border-b border-neutral-800 flex items-center justify-between">
        <h2 className="font-semibold text-lg text-neutral-100">Chats</h2>
        <Button
          size="icon"
          variant="ghost"
          className="text-neutral-400 hover:text-neutral-100"
          onClick={onNewChat}
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
                      currentChatId === chat.id ? "bg-neutral-800" : ""
                    }`}
                    onClick={() => onChatClick(chat.id)}
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
  );
};
