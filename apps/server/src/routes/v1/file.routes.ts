import { fetchChats } from "@/controllers/v1/chat.controller";
import {
  respondToQuery,
  uplaodFileContent,
} from "@/controllers/v1/file.controller";
import type { Router } from "express";
import express from "express";

const router: Router = express.Router();

router.post("/v1/file/upload", uplaodFileContent);

router.post("/v1/file/query", respondToQuery);

router.post("/v1/chat/fetch", fetchChats);

export const fileRouter: Router = router;
