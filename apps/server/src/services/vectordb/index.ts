import { Pinecone } from "@pinecone-database/pinecone";

export class VectorDBService {
  private pc;
  private index;
  private indexName;
  private namespace;

  constructor(
    apiKey: string,
    indexName: string,
    host: string,
    namespace: string
  ) {
    if (!process.env.PINECONE_KEY) {
      console.log("pinecone api is undefined");
      throw new Error("pinecone api is missing");
    }

    this.pc = new Pinecone({
      apiKey,
    });
    this.indexName = indexName;
    this.index = this.pc.index(this.indexName, host);
    this.namespace = this.index.namespace(namespace);
  }

  async initVectorDB() {
    try {
      const existingIndexes = await this.pc.listIndexes();
      const indexExists = existingIndexes.indexes?.some(
        (index) => index.name === this.indexName
      );

      if (!indexExists) {
        await this.pc.createIndexForModel({
          name: this.indexName,
          cloud: "aws",
          region: "us-east-1",
          embed: {
            model: "llama-text-embed-v2",
            fieldMap: { text: "chunk_text" },
          },
          waitUntilReady: true,
        });
        console.log("VectorDB index created successfully");
      }
    } catch (error) {
      console.error("Pinecone DB initialization error:", error);
      throw error;
    }
  }

  async createEmbeddings(chunks: string[]) {
    const res = await this.pc.inference.embed("llama-text-embed-v2", chunks, {
      inputType: "passage",
    });

    return res;
  }

  async upsertData(vectors) {
    try {
      console.log("Upserting vectors:", vectors.length);
      const res = await this.namespace.upsert(vectors);
      console.log("Upsert response:", res); // ← Add this
      return res;
    } catch (error) {
      console.error("Upsert error:", error); // ← Add this
      throw error; // ← Should throw, not return
    }
  }

  async contextSearch(userQuery: string, userId: string, chatIdFromDB: string) {
    const contextRes = await this.namespace.searchRecords({
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

    return contextRes;
  }
}

if (!process.env.PINECONE_KEY) {
  console.log("pinecone api is undefined");
  throw new Error("pinecone api is missing");
}

export const pc = new Pinecone({
  apiKey: process.env.PINECONE_KEY!,
});

const indexName = "know-your-docs";

export async function initVectorDB() {
  try {
    const existingIndexes = await pc.listIndexes();
    const indexExists = existingIndexes.indexes?.some(
      (index) => index.name === indexName
    );

    if (!indexExists) {
      await pc.createIndexForModel({
        name: indexName,
        cloud: "aws",
        region: "us-east-1",
        embed: {
          model: "llama-text-embed-v2",
          fieldMap: { text: "chunk_text" },
        },
        waitUntilReady: true,
      });
      console.log("VectorDB index created successfully");
    }
  } catch (error) {
    console.error("Pinecone DB initialization error:", error);
    throw error;
  }
}

export const index = pc.index(
  indexName,
  "https://know-your-docs-x57du14.svc.aped-4627-b74a.pinecone.io"
);

export const namespace = index.namespace("example-namespace");
