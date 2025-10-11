export type PineconeHit = {
  _id: string;
  _score: number;
  fields: {
    chunk_text: string;
    filename?: string;
    [key: string]: any;
  };
};
