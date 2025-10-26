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

export async function uplaodFileContent(req: Request, res: Response) {
  const file = req.file;
  console.log("file", file);

  const { chatId } = req.body;

  if (!file) {
    return res.status(404).json({ success: false, message: "file is missing" });
  }

  if (!chatId)
    return res
      .status(404)
      .json({ success: false, message: "chatId is missing" });

  try {
    // TODO: db entry of file metadata

    console.log("filename", file.originalname);

    const doc = await storeDocMetaData(chatId, file.originalname);

    console.log("doc res", doc);

    const extractedText: string = await extractText(file);

    const chunks = await createChunks(extractedText);

    console.log("chunks", chunks);

    // const embeddings = await createEmbeddings(chunks);

    // console.log("embeddings", embeddings);

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
    });
  } catch (error) {
    return res.json({
      success: true,
      message: "Error occurred while uploading the file",
      error,
    });
  }
}

export async function respondToQuery(req: Request, res: Response) {
  const { userId, chatId, chatTitle, userQuery } = req.body;

  console.log("req body", req.body);

  if (!userId || !userQuery || !chatTitle) {
    return res.status(404).json({
      message: "some value from body is missing",
    });
  }

  let chatIdFromDB = chatId;

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
      },

      fields: ["chunk_text", "filename"],
    });

    // const hits = Array.isArray(contextResponse?.result?.hits)
    //   ? contextResponse.result.hits
    //   : [];

    console.log("context res", contextResponse);

    const contextChunks = contextResponse.result.hits
      ?.map((hit) => {
        const fields = hit?.fields as {
          chunk_text?: string;
          filename?: string;
        };

        return fields?.chunk_text;
      })
      .filter(Boolean)
      .join("\n\n---\n\n");

    // Check if context was found
    if (!contextChunks) {
      return res.status(400).json({
        success: false,
        message: "No context found for the query",
      });
    }

    //after that, we'll feed the context to gemini and generate a response for user

    if (!contextChunks) {
      return res.status(400).json({
        success: false,
        message: "No context found for the query",
      });
    }

    const prompt = `You are a helpful AI assistant that answers questions about documents.

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
      const queryRes = await storeUserQuery(userQuery, generatedText, chatId);
      console.log("query res", queryRes);
    }

    return res.status(200).json({
      success: true,
      message: "Successfully responded to the user query",
      chatId: chatIdFromDB,
      answer: generatedText,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error occurred while querying data",
      error,
    });
  }
}
