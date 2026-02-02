import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  server: {
    CLERK_JWT_ISSUER_DOMAIN: z
      .string()
      .min(1, "CLERK_JWT_ISSUER_DOMAIN is required"),
    RESEND_API_KEY: z.string().min(1, "RESEND_API_KEY is required"),
    CONVEX_DEPLOYMENT: z
      .string()
      .min(1, "CONVEX_DEPLOYMENT, is requried")
      .optional(),
    MOONSHOTAI_API_KEY: z.string().min(1, "MOONSHOTAI_API_KEY is required"),
  },
  client: {
    NEXT_PUBLIC_CONVEX_URL: z
      .string()
      .min(1, "NEXT_PUBLIC_CONVEX_URL is required"),
    NEXT_PUBLIC_CONVEX_SITE_URL: z
      .string()
      .min(1, "NEXT_PUBLIC_CONVEX_SITE_URL is required")
      .optional(),
  },
  // If you're using Next.js < 13.4.4, you'll need to specify the runtimeEnv manually
  runtimeEnv: {
    RESEND_API_KEY: process.env.RESEND_API_KEY,
    MOONSHOTAI_API_KEY: process.env.MOONSHOTAI_API_KEY,
    CONVEX_DEPLOYMENT: process.env.CONVEX_DEPLOYMENT,
    NEXT_PUBLIC_CONVEX_URL: process.env.NEXT_PUBLIC_CONVEX_URL,
    NEXT_PUBLIC_CONVEX_SITE_URL: process.env.NEXT_PUBLIC_CONVEX_SITE_URL,
    CLERK_JWT_ISSUER_DOMAIN: process.env.CLERK_JWT_ISSUER_DOMAIN,
  },
  onValidationError: (issues) => {
    console.error("❌ Invalid environment variables:", issues);
    throw new Error("Invalid environment variables");
  },
  // Called when server variables are accessed on the client.
  // onInvalidAccess: () => {
  //   throw new Error(
  //     "❌ Attempted to access a server-side environment variable on the client",
  //   );
  // },
});
