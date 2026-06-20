import { NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma";

export const dynamic = "force-dynamic";

function isConfigured(value: string | undefined) {
  return Boolean(value && value.trim().length > 0);
}

export async function GET() {
  const checks = {
    authSecret: isConfigured(process.env.AUTH_SECRET),
    authUrl: isConfigured(process.env.AUTH_URL),
    authTrustHost:
      process.env.AUTH_TRUST_HOST === "true" || process.env.VERCEL === "1",
    databaseUrl: isConfigured(process.env.DATABASE_URL),
    googleClientId: isConfigured(process.env.AUTH_GOOGLE_ID),
    googleClientSecret: isConfigured(process.env.AUTH_GOOGLE_SECRET),
  };

  let database = false;
  let databaseError: string | null = null;

  if (checks.databaseUrl) {
    try {
      await prisma.$queryRaw`SELECT 1`;
      database = true;
    } catch (error) {
      databaseError = error instanceof Error ? error.message : "Unknown database error";
    }
  }

  const ok = Object.values(checks).every(Boolean) && database;

  return NextResponse.json(
    {
      ok,
      checks,
      database,
      databaseError,
    },
    { status: ok ? 200 : 500 },
  );
}
