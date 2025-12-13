import { toNodeHandler } from "better-auth/node";
import cors from "cors";
import "dotenv/config";
import type { Express } from "express";
import express from "express";
import { auth } from "./lib/auth";
import { chatRouter } from "./routes/v1/chat.routes";
import { fileRouter } from "./routes/v1/file.routes";
import { fileRouterv2 } from "./routes/v2/file.routes";

const app: Express = express();

const corsOptions = {
  origin: [process.env.FRONTEND_URL_DEV, process.env.FRONTEND_URL_PROD].filter(
    (url): url is string => url !== undefined
  ),
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  credentials: true,
  maxAge: 86400,
};

app.use(express.json());
app.use(cors(corsOptions));

app.use("/api/auth", toNodeHandler(auth));

// passing the field name for file upload in multer middleware`
app.use("/api", fileRouter);
app.use("/api", fileRouterv2);
app.use("/api", chatRouter);

app.get("/", (req, res) => {
  res.send("OK");
});

app.listen(3000, () => {
  console.log("server is running on 3000");
});
