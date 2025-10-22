// import { db } from "@/db";
// import { chat } from "@/db/schema/schema";
// import type { Request, Response } from "express";

// export async function createNewChat(req: Request, res: Response) {
//   const { userId, chatTitle } = req.body;

//   console.log("chat body", req.body);

//   if (!userId) {
//     return res
//       .status(404)
//       .json({ userId: false, message: "userId is missing" });
//   }

//   try {
//     const chatResult = await db
//       .insert(chat)
//       .values({
//         chatTitle,
//         userId,
//       })
//       .returning();

//     return res.status(200).json({
//       sucess: true,
//       messgae: "chat created succesfully",
//       chatId: chatResult[0].id,
//     });
//   } catch (error) {
//     return res.status(500).json({
//       success: false,
//       message: "error occurred while creating a chat",
//       error,
//     });
//   }
// }
