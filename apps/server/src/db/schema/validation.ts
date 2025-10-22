import { z } from "zod";

/* ----------------------------- USER SCHEMA ----------------------------- */
export const userSchema = z.object({
  id: z.string(),
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  emailVerified: z.boolean(),
  image: z.string().nullable().optional(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});

/* ----------------------------- CHAT SCHEMA ----------------------------- */
export const chatSchema = z.object({
  id: z.uuid(),
  chatTitle: z.string(),
  userId: z.string(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});

/* ----------------------------- CHAT SCHEMA ----------------------------- */
export const querySchema = z.object({
  id: z.string(),
  query: z.string(),
  response: z.string(),
  chatId: z.string(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});

/* ----------------------------- CHAT SCHEMA ----------------------------- */
export const docSchema = z.object({
  id: z.string(),
  fileName: z.string(),
  chatId: z.string(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});

/* ---------------------------- SESSION SCHEMA ---------------------------- */
export const sessionSchema = z.object({
  id: z.string(),
  expiresAt: z.coerce.date(),
  token: z.string(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  ipAddress: z.string().nullable().optional(),
  userAgent: z.string().nullable().optional(),
  userId: z.string(), // references user.id
});

/* ---------------------------- ACCOUNT SCHEMA ---------------------------- */
export const accountSchema = z.object({
  id: z.string(),
  accountId: z.string(),
  providerId: z.string(),
  userId: z.string(), // references user.id
  accessToken: z.string().nullable().optional(),
  refreshToken: z.string().nullable().optional(),
  idToken: z.string().nullable().optional(),
  accessTokenExpiresAt: z.coerce.date().nullable().optional(),
  refreshTokenExpiresAt: z.coerce.date().nullable().optional(),
  scope: z.string().nullable().optional(),
  password: z.string().nullable().optional(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});

/* -------------------------- VERIFICATION SCHEMA ------------------------- */
export const verificationSchema = z.object({
  id: z.string(),
  identifier: z.string(),
  value: z.string(),
  expiresAt: z.coerce.date(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
});

/* ----------------------------- TYPES EXPORT ----------------------------- */
export type userSchemaVal = z.infer<typeof userSchema>;
export type chatSchemaVal = z.infer<typeof chatSchema>;
export type querySchemaVal = z.infer<typeof querySchema>;
export type docsSchemaVal = z.infer<typeof docSchema>;
export type sessionSchemaVal = z.infer<typeof sessionSchema>;
export type accountSchemaVal = z.infer<typeof accountSchema>;
export type verificationSchemaVal = z.infer<typeof verificationSchema>;
