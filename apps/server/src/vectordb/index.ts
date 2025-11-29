import { Pinecone } from "@pinecone-database/pinecone";

if (!process.env.PINECONE_KEY) {
  console.log("pinecone api is undefined");
  throw new Error("pinecone api is missing");
}

export const pc = new Pinecone({
  apiKey: process.env.PINECONE_KEY!,
});

const indexName = "know-your-docs";

// Initialize index (call this once during app startup)
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
    throw error; // Re-throw to prevent app from running with broken DB
  }
}

export const index = pc.index(
  indexName,
  "https://know-your-docs-x57du14.svc.aped-4627-b74a.pinecone.io"
);

export const namespace = index.namespace("example-namespace");
