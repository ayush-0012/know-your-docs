import {
  respondToQuery,
  uplaodFileContent,
} from "@/controllers/v1/file.controller";
import type { Router } from "express";
import express from "express";
import multer from "multer";

const router: Router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post("/v1/file/upload", upload.single("file"), uplaodFileContent);

router.get("/v1/file/query", respondToQuery);

export const fileRouter: Router = router;
