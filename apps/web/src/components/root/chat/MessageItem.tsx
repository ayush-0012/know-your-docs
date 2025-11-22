"use client";

import type { Message } from "@/lib/types/types";
import ReactMarkdown from "react-markdown";
import { markdownComponents } from "./MarkdownComp";

interface MessageItemProps {
  message: Message;
}

export const MessageItem = ({ message }: MessageItemProps) => {
  // Debug logging
  console.log("MessageItem render:", {
    id: message.id,
    isStreaming: message.isStreaming,
    contentLength: message.content.length,
    role: message.role,
  });

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
              {message.isStreaming ? (
                // Showing raw text during streaming to avoid broken markdown
                <div
                  className="text-neutral-200 leading-relaxed"
                  style={{ whiteSpace: "pre-wrap" }}
                >
                  {message.content}
                  {/* <span className="text-red-500 text-xs ml-2">[STREAMING]</span> */}
                </div>
              ) : (
                // Parsing markdown only after streaming is complete
                <>
                  <ReactMarkdown components={markdownComponents}>
                    {message.content}
                  </ReactMarkdown>
                  {/* <span className="text-green-500 text-xs">[FORMATTED]</span> */}
                </>
              )}
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
