import {
  respondToQuery,
  uplaodFileContent,
} from "@/controllers/v1/file.controller";
import type { Router } from "express";
import express from "express";

const router: Router = express.Router();

router.post("/v1/file/upload", uplaodFileContent);

router.post("/v1/file/query", respondToQuery);

// router.post("/v1/chat/create", createNewChat);

export const fileRouter: Router = router;
