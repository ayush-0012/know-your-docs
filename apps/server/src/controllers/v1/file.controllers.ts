import { createChunks, extractText } from "@/services/file.services";
import { namespace, pc } from "@/vectordb";
import { GoogleGenAI } from "@google/genai";
import type { Request, Response } from "express";

export async function uplaodFileContent(req: Request, res: Response) {
  const file = req.file;
  console.log("file", file);

  if (!file) {
    return res.status(404).json({ success: false, message: "file is missing" });
  }

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

  // Format data for Pinecone upsert
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
  });
}

export async function respondToQuery(req: Request, res: Response) {
  const { userQuery } = req.body;

  if (!userQuery) {
    return res.status(404).json({
      message: "User must provide a query",
    });
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

    //after that, we'll feed the reponse to gemini and generate a better for user

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

    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

    const responseForUser = await ai.models.generateContent({
      model: "gemini-2.5-pro",
      contents: { role: "user", parts: [{ text: prompt }] },
    });

    console.log("gemini response", responseForUser);

    // extracting only text from gemini's response
    const generatedText =
      responseForUser.candidates?.[0]?.content?.parts?.[0]?.text;

    return res.status(200).json({
      success: true,
      message: "Successfully responded to the user query",
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
