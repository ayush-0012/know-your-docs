import { fileController } from "@/lib/container";
import type { Router } from "express";
import express from "express";
import multer from "multer";

const router: Router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post("/v2/file/upload", upload.single("file"), (req, res) =>
  fileController.updloadFileContent(req, res)
);

export const fileRouterv2: Router = router;
