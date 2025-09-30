import { uplaodFileContent } from "@/controllers/v1/file.controllers";
import type { Router } from "express";
import express from "express";

const router: Router = express.Router();

router.post("/v1/file/upload", uplaodFileContent);

export const fileRouter: Router = router;
