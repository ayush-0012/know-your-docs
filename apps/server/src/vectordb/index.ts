import { Pinecone } from "@pinecone-database/pinecone";

if (!process.env.PINECONE_KEY) {
  console.log("pincone api is undefined");
  throw new Error("pinecone api is missing");
}

export const pc = new Pinecone({
  apiKey: process.env.PINECONE_KEY!,
});

const indexname = "know-your-docs";

try {
  await pc.createIndexForModel({
    name: indexname,
    cloud: "aws",
    region: "us-east-1",
    embed: {
      model: "llama-text-embed-v2",
      fieldMap: { text: "chunk_text" },
    },
    waitUntilReady: true,
  });
} catch (error) {
  console.log("pincone db error", error);
}

export const namespace = pc
  .index(
    indexname,
    "https://know-your-docs-x57du14.svc.aped-4627-b74a.pinecone.io"
  )
  .namespace("example-namespace");
