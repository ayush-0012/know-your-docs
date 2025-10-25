import { db } from "@/db";
import { chat, docs, userQuery } from "@/db/schema/schema";
import { GoogleGenAI } from "@google/genai";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import textract from "textract";

export function extractText(file) {
  return new Promise((resolve, reject) => {
    textract.fromBufferWithName(
      file?.originalname!,
      file?.buffer!,
      (err, text) => {
        if (err) {
          console.log("error occurred while extracting file", err);
          return reject(err);
        } else {
          // console.log("file content", text);
          return resolve(text);
        }
      }
    );
  });
}

export async function createChunks(text: string) {
  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: 1000, // ~150-200 words per chunk, good balance for context
    chunkOverlap: 200, // ~20% overlap to preserve continuity
    separators: ["\n\n", "\n", ".", " "], // split by paragraph → line → sentence → word
  });

  const chunks = await splitter.createDocuments([text]);

  return chunks.map((doc) => doc.pageContent);
}

export async function createEmbeddings(chunks) {
  if (!process.env.GEMINI_API_KEY) {
    console.log("api is missing");
    throw new Error("google api is missingg");
  }
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

  const response = await ai.models.embedContent({
    model: "gemini-embedding-001",
    contents: chunks,
  });

  return response.embeddings;
}

export async function createNewChat(
  userId: string,
  chatTitle: string
): Promise<string> {
  if (!userId) {
    return "userId is missing";
  }

  try {
    const chatResult = await db
      .insert(chat)
      .values({
        chatTitle,
        userId,
      })
      .returning();

    const chatId = chatResult[0].id;

    return chatId;
  } catch (error) {
    console.log("chat error", error);
    return "error occurred while creating a chat";
  }
}

export async function storeDocMetaData(chatId: string, fileName: string) {
  try {
    const docResult = await db
      .insert(docs)
      .values({
        fileName,
        chatId,
      })
      .returning();

    const doc = docResult[0];

    return doc;
  } catch (error) {
    console.log("doc error", error);
    return "error occurred while storing doc";
  }
}

export async function storeUserQuery(
  query: string,
  response: string,
  chatId: string
) {
  try {
    const queryResult = await db
      .insert(userQuery)
      .values({
        query,
        response,
        chatId,
      })
      .returning();

    const queryRes = queryResult[0];

    return queryRes;
  } catch (error) {
    console.log("doc error", error);
    return "error occurred while storing doc";
  }
}
