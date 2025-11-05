import {
  createChunks,
  createNewChat,
  extractText,
  storeDocMetaData,
  storeUserQuery,
} from "@/services/file.services";
import { namespace, pc } from "@/vectordb";
import { GoogleGenAI } from "@google/genai";
import type { Request, Response } from "express";

let defaultChatTitle: string;

export async function uplaodFileContent(req: Request, res: Response) {
  const file = req.file;
  console.log("file", file);

  let { userId, chatId } = req.body;

  console.log("req body for file upload", req.body);

  if (!file) {
    return res.status(404).json({ success: false, message: "file is missing" });
  }

  if (!userId)
    return res
      .status(404)
      .json({ success: false, message: "userId is missing for file upload" });

  try {
    // Create a new chat if chatId is not provided
    if (!chatId) {
      defaultChatTitle = file.originalname;
      chatId = await createNewChat(userId, defaultChatTitle);

      console.log("created chat for file upload, id:", chatId);

      // Validate chat creation
      if (
        !chatId ||
        chatId.startsWith("error") ||
        chatId === "userId is missing"
      ) {
        return res.status(500).json({
          success: false,
          message: "Failed to create chat for file upload",
        });
      }
    }

    console.log("filename", file.originalname);

    const doc = await storeDocMetaData(chatId, file.originalname);

    console.log("doc res", doc);

    const extractedText: string = await extractText(file);

    const chunks = await createChunks(extractedText);

    console.log("chunks", chunks);

    // using pincone's interface api for embeddings
    const embeddingResponse = await pc.inference.embed(
      "llama-text-embed-v2",
      chunks,
      { inputType: "passage" }
    );

    console.log("Generated embeddings:", embeddingResponse.data);

    // Formatting data for Pinecone upsert
    const vectors = chunks.map((chunk, index) => ({
      id: `${file.originalname}-chunk-${index}-${Date.now()}`,
      values: (embeddingResponse.data[index] as { values: number[] }).values,
      metadata: {
        chunk_text: chunk,
        filename: file.originalname,
        userId,
        chatId,
        chunkIndex: index,
      },
    }));

    // Upsert to Pinecone
    await namespace.upsert(vectors);

    return res.json({
      success: true,
      chunksProcessed: chunks.length,
      message: "File content successfully uploaded to Pinecone",
      docDetails: doc,
      chatId: chatId, // Return chatId so frontend can use it
    });
  } catch (error) {
    return res.json({
      success: false,
      message: "Error occurred while uploading the file",
      error,
    });
  }
}

export async function respondToQuery(req: Request, res: Response) {
  const { userId, chatId, chatTitle, userQuery } = req.body;

  console.log("req body", req.body);

  if (!userId || !userQuery) {
    return res.status(404).json({
      message: "userId or userQuery is missing",
    });
  }

  let chatIdFromDB = chatId;

  // Create new chat if chatId is not provided
  if (!chatId) {
    if (!chatTitle) {
      return res.status(400).json({
        success: false,
        message: "chatTitle is required for new chats",
      });
    }

    chatIdFromDB = await createNewChat(userId, chatTitle);
    console.log("created chat, id:", chatIdFromDB);

    // Validate chat creation
    if (
      !chatIdFromDB ||
      chatIdFromDB.startsWith("error") ||
      chatIdFromDB === "userId is missing"
    ) {
      return res.status(500).json({
        success: false,
        message: "Failed to create chat",
      });
    }
  }

  try {
    const contextResponse = await namespace.searchRecords({
      query: {
        topK: 5,
        inputs: { text: userQuery },
        filter: {
          $and: [
            { userId: { $eq: userId } },
            { chatId: { $eq: chatIdFromDB } },
          ],
        },
      },
      fields: ["chunk_text", "filename", "userId", "chatId"],
    });

    const contextChunks = contextResponse.result.hits
      ?.map((hit) => {
        const fields = hit?.fields as {
          chunk_text?: string;
          filename?: string;
          userId?: string;
          chatId?: string;
        };
        return fields?.chunk_text;
      })
      .filter(Boolean)
      .join("\n\n---\n\n");

    // Prepare prompt based on whether context exists or not
    let prompt: string;

    if (!contextChunks || contextChunks.trim() === "") {
      // No documents uploaded - respond conversationally
      prompt = `You are a helpful AI assistant. You can only answer questions related to the documents the user uploads in this chat.

If the user asks anything that is not related to their uploaded documents, respond politely with:
"That’s not in the context. I can only answer questions related to your uploaded document."

If the user talks about or asks something related to their documents but has not uploaded any yet, respond with:
"Please upload a document first so I can assist you with it."

Otherwise, if the user’s message is about their uploaded document, respond naturally and helpfully.

USER MESSAGE: ${userQuery}

RESPONSE:`;
    } else {
      // Documents exist - use RAG approach
      prompt = `You are a helpful AI assistant that answers questions about documents.

Your task is to provide detailed and comprehensive answers based solely on the information in the context below.

Rules:
- Use ONLY the information provided in the context
- Be thorough and detailed in your explanations
- If the answer requires multiple pieces of information, combine them into a complete response
- If the information is not in the context, clearly state that
- Maintain a natural, conversational tone

CONTEXT:
${contextChunks}

QUESTION: ${userQuery}

ANSWER:`;
    }

    console.log("Has context:", !!contextChunks);

    if (!process.env.GEMINI_API_KEY) {
      console.log("gemini api is missing");
      throw new Error("gemini api is missing");
    }

    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

    const responseForUser = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: { role: "user", parts: [{ text: prompt }] },
    });

    console.log("gemini response", responseForUser);

    if (!responseForUser) console.log("gemini failed to generate");

    // extracting only text from gemini's response
    const generatedText =
      responseForUser.candidates?.[0]?.content?.parts?.[0]?.text;

    if (generatedText) {
      const queryRes = await storeUserQuery(
        userQuery,
        generatedText,
        chatIdFromDB // Use chatIdFromDB instead of chatId
      );
      console.log("query res", queryRes);
    }

    return res.status(200).json({
      success: true,
      message: "Successfully responded to the user query",
      chatId: chatIdFromDB,
      answer: generatedText,
      hasDocuments: !!contextChunks, // Let frontend know if documents exist
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error occurred while querying data",
      error,
    });
  }
}
