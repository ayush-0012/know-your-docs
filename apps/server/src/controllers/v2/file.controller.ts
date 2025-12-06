import type { ChatOperations } from "@/services/file.services";
import type { AiServices } from "@/services/general.services";
import type { VectorDBService } from "@/services/vectordb/index";

export class FileController {
  constructor(
    private vectorDBService: VectorDBService,
    private chatController: ChatOperations
  ) {}
}

export class ChatController {
  constructor(
    private vectorDBService: VectorDBService,
    private aiServices: AiServices
  ) {}
}
