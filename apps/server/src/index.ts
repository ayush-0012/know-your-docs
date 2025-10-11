import "dotenv/config";
import type { Express } from "express";
import express from "express";
import multer from "multer";
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

app.get("/", (req, res) => {
  res.send("jfdkjf");
});

// passing the field name for file upload in multer middleware`
app.use("/api", upload.single("file"), fileRouter);

app.listen(3000, () => {
  console.log("server is running");
});
