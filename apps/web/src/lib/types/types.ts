export interface Chat {
  id: string;
  chatTitle: string;
  timestamp: Date;
}

export interface FileInfo {
  id: string;
  name: string;
  fileName?: string;
}

export interface Query {
  id: string;
  query: string;
  response: string;
}

export interface ChatDetail {
  chatId: string;
  file: FileInfo;
  queries: Query[];
}

export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  isStreaming?: boolean;
}

export interface User {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  image?: string | null | undefined;
  createdAt: Date;
  updatedAt: Date;
}
