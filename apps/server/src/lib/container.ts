// ALL THE CLASS INSTANCES

import { FileController } from "@/controllers/v2/file.controller";
import { ChatOperations } from "@/services/file.services";
import { AiServices } from "@/services/general.services";
import { VectorDBService } from "@/services/vectordb";

if (!process.env.GEMINI_API_KEY) throw new Error("Gemini api is missing");
if (!process.env.PINECONE_KEY) throw new Error("Gemini api is missing");

const chatOperations = new ChatOperations();
const aiServices = new AiServices(process.env.GEMINI_API_KEY);
const vectorDBService = new VectorDBService(
  process.env.PINECONE_KEY,
  "know-your-docs",
  "https://know-your-docs-x57du14.svc.aped-4627-b74a.pinecone.io",
  "example-namespace "
);

const fileController = new FileController(vectorDBService);
