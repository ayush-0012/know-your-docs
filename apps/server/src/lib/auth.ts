import { betterAuth, type BetterAuthOptions } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "../db";
import * as schema from "../db/schema/schema";

export const auth = betterAuth<BetterAuthOptions>({
  database: drizzleAdapter(db, {
    provider: "pg",

    schema: schema,
  }),
  socialProviders: {
    github: {
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
    },
  },
  trustedOrigins: [
    process.env.FRONTEND_URL_DEV,
    process.env.FRONTEND_URL_PROD,
  ].filter((url): url is string => url !== undefined),
  emailAndPassword: {
    enabled: true,
  },
  advanced: {
    defaultCookieAttributes: {
      sameSite: "none",
      secure: true,
      httpOnly: true,
    },
  },
});
