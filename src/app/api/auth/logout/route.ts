import { NextResponse } from "next/server";
import { removeAuthCookie } from "@/lib/auth";
import { successResponse, handleApiError } from "@/lib/api-handler";

export async function POST() {
  try {
    await removeAuthCookie();
    return successResponse({ message: "Logged out successfully" });
  } catch (error) {
    return handleApiError(error);
  }
}
