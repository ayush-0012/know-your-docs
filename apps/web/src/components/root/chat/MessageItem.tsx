"use client";

import type { Message } from "@/lib/types/types";
import ReactMarkdown from "react-markdown";
import { markdownComponents } from "./MarkdownComp";

interface MessageItemProps {
  message: Message;
}

export const MessageItem = ({ message }: MessageItemProps) => {
  return (
    <div className="space-y-2">
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
              <ReactMarkdown components={markdownComponents}>
                {message.content}
              </ReactMarkdown>
              {message.isStreaming && (
                <span className="inline-block w-0.5 h-4 bg-neutral-400 ml-1 animate-pulse" />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
