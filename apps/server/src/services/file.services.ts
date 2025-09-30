import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import textract from "textract";

export function extractText(file) {
  return new Promise((resolve, reject) => {
    textract.fromBufferWithName(
      file?.originalname!,
      file?.buffer!,
      (err, text) => {
        if (err) {
          console.log("error occurred while extracting file", err);
          return reject(err);
        } else {
          // console.log("file content", text);
          return resolve(text);
        }
      }
    );
  });
}

export async function createChunks(text: string) {
  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: 500, // max characters per chunk
    chunkOverlap: 50, // overlap between chunks
    separators: ["\n\n", "\n", ".", " "], // split by paragraph → line → sentence → word
  });

  const chunks = await splitter.createDocuments([text]);
  console.log(chunks.map((doc) => doc.pageContent));

  return chunks.map((doc) => doc.pageContent);
}

export function createEmbeddings() {}
