import { NextResponse } from "next/server";
import { successResponse } from "@/lib/api-handler";

export async function GET() {
  return successResponse({ serverTime: new Date().toISOString() });
}
