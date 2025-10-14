import { z } from "zod";

/* ----------------------------- USER SCHEMA ----------------------------- */
export const userSchema = z.object({
  id: z.uuid(),
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  emailVerified: z.boolean(),
  image: z.string().nullable().optional(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});

/* ---------------------------- SESSION SCHEMA ---------------------------- */
export const sessionSchema = z.object({
  id: z.uuid(),
  expiresAt: z.coerce.date(),
  token: z.string(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  ipAddress: z.string().nullable().optional(),
  userAgent: z.string().nullable().optional(),
  userId: z.uuid(), // references user.id
});

/* ---------------------------- ACCOUNT SCHEMA ---------------------------- */
export const accountSchema = z.object({
  id: z.uuid(),
  accountId: z.string(),
  providerId: z.string(),
  userId: z.uuid(), // references user.id
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
  id: z.uuid(),
  identifier: z.string(),
  value: z.string(),
  expiresAt: z.coerce.date(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
});

/* ----------------------------- TYPES EXPORT ----------------------------- */
export type User = z.infer<typeof userSchema>;
export type Session = z.infer<typeof sessionSchema>;
export type Account = z.infer<typeof accountSchema>;
export type Verification = z.infer<typeof verificationSchema>;
