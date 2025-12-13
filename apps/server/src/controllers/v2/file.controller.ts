import {
  ChatOperations,
  createChunks,
  extractText,
} from "@/services/file.services";
import type { VectorDBService } from "@/services/vectordb/index";
import type { Request, Response } from "express";

export class FileController {
  constructor(
    private vectorDBService: VectorDBService,
    private chatController: ChatOperations
  ) {
    console.log("file controller constructor ran");
  }

  async updloadFileContent(req: Request, res: Response) {
    console.log("Request received:", {
      file: req.file,
      body: req.body,
      headers: req.headers["content-type"],
    });

    const file = req.file;
    let { userId, chatId } = req.body;

    if (!file)
      return res
        .status(404)
        .json({ success: false, message: "file is missing" });

    if (!userId)
      return res
        .status(404)
        .json({ success: false, message: "userId is missing for file upload" });

    if (!chatId) {
      try {
        chatId = await this.chatController.createNewChat(
          userId,
          file.originalname
        );
      } catch (error) {
        return res
          .status(500)
          .json({ success: false, message: "Failed to create chat" });
      }
    }

    try {
      // these two can run parallely
      const document = await this.chatController.storeDocMetaData(
        chatId,
        file.originalname
      );
      const extractedText = await extractText(file);

      // dependent on extractedText
      const chunks = await createChunks(extractedText as any);

      const embeddingRes = await this.vectorDBService.createEmbeddings(chunks);

      console.log("embedding res", embeddingRes);

      const vectors = chunks.map((chunk, index) => ({
        id: `${file.originalname}-chunk-${index}-${Date.now()}`,
        values: (embeddingRes.data[index] as { values: number[] }).values,
        metadata: {
          chunk_text: chunk,
          filename: file.originalname,
          userId,
          chatId,
          chunkIndex: index,
        },
      }));

      const upsertRes = await this.vectorDBService.upsertData(vectors);
      console.log("upsertRes", upsertRes);

      return res.json({
        success: true,
        chunksProcessed: chunks.length,
        message: "File content successfully uploaded to Pinecone",
        docDetails: document,
        chatId, // Return chatId so frontend can use it
      });
    } catch (error) {
      return res.json({
        success: false,
        message: "Error occurred while uploading the file",
        error,
      });
    }
  }
}
