import {
  createChunks,
  createEmbeddings,
  extractText,
} from "@/services/file.services";
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
  // console.log("extracted text", extractedText);

  const embeddings = await createEmbeddings(chunks);

  console.log("embeddings", embeddings);

  //now a db call will be made(to pinecone) to store the data

  return res.send("done");
}
