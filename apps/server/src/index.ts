import { toNodeHandler } from "better-auth/node";
import cors from "cors";
import "dotenv/config";
import type { Express } from "express";
import express from "express";
import multer from "multer";
import { auth } from "./lib/auth";
import { fileRouter } from "./routes/v1/file.routes";

const app: Express = express();
const upload = multer({ storage: multer.memoryStorage() });

const corsOptions = {
  origin: process.env.CORS_ORIGIN || "",
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  credentials: true,
  maxAge: 86400,
};

app.use(express.json());
app.use(cors(corsOptions));

app.use("/api/auth", toNodeHandler(auth));

// passing the field name for file upload in multer middleware`
app.use("/api", upload.single("file"), fileRouter);

app.listen(3000, () => {
  console.log("server is running on 3000");
});
