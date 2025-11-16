"use client";

import { AnimatePresence, motion } from "framer-motion";
import { FileText, Loader2, Plus, Send, X } from "lucide-react";
import { memo, useCallback, useState } from "react";

interface ChatInputProps {
  onSend: (message: string) => void;
  isProcessing: boolean;
  isUserLoading: boolean;
  uploadingFile: File | null;
  isUploading: boolean;
  onFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemoveFile: () => void;
  formatFileSize: (bytes: number) => string;
  isCentered: boolean;
}

export const ChatInput = memo(
  ({
    onSend,
    isProcessing,
    isUserLoading,
    uploadingFile,
    isUploading,
    onFileUpload,
    onRemoveFile,
    formatFileSize,
    isCentered,
  }: ChatInputProps) => {
    const [inputValue, setInputValue] = useState("");

    const handleSend = useCallback(() => {
      if (inputValue.trim() && !isProcessing) {
        onSend(inputValue);
        setInputValue("");
      }
    }, [inputValue, isProcessing, onSend]);

    return (
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
                          <span className="text-green-400 ml-1">✓ Ready</span>
                        )}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={onRemoveFile}
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
              onChange={onFileUpload}
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
                  handleSend();
                }
              }}
              disabled={isProcessing || isUserLoading}
              className="flex-1 bg-transparent border-0 text-neutral-100 placeholder-neutral-500 outline-none text-[15px] py-3 px-1 disabled:opacity-50"
            />

            <button
              onClick={handleSend}
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
  }
);

ChatInput.displayName = "ChatInput";
