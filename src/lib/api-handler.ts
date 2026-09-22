import { NextResponse } from "next/server";
import { ZodError, ZodSchema } from "zod";
import { getAuthUser, JwtPayload } from "./auth";

export interface HandlerContext {
  userId: string;
  user: JwtPayload;
}

type HandlerFn = (
  request: Request,
  context?: { params: Promise<Record<string, string>> }
) => Promise<NextResponse>;

export function withAuth(handler: HandlerFn): HandlerFn {
  return async (request: Request, context?) => {
    try {
      const user = await getAuthUser();
      if (!user) {
        return NextResponse.json(
          { success: false, data: null, error: { code: "UNAUTHORIZED", message: "Authentication required" } },
          { status: 401 }
        );
      }

      const ctx: HandlerContext = { userId: user.userId, user };
      return await handler(request, context);
    } catch (error) {
      console.error("Auth middleware error:", error);
      return NextResponse.json(
        { success: false, data: null, error: { code: "INTERNAL_ERROR", message: "Internal server error" } },
        { status: 500 }
      );
    }
  };
}

export function validateBody<T>(schema: ZodSchema<T>, data: unknown): T {
  try {
    return schema.parse(data);
  } catch (error) {
    if (error instanceof ZodError) {
      throw new ValidationError(error.issues[0].message);
    }
    throw error;
  }
}

export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ValidationError";
  }
}

export class AppError extends Error {
  constructor(
    public code: string,
    message: string,
    public statusCode: number = 400
  ) {
    super(message);
    this.name = "AppError";
  }
}

export function successResponse<T>(data: T, status: number = 200): NextResponse {
  return NextResponse.json({ success: true, data, error: null }, { status });
}

export function errorResponse(code: string, message: string, status: number = 400): NextResponse {
  return NextResponse.json({ success: false, data: null, error: { code, message } }, { status });
}

export function handleApiError(error: unknown): NextResponse {
  console.error("API Error:", error);

  if (error instanceof AppError) {
    return errorResponse(error.code, error.message, error.statusCode);
  }

  if (error instanceof ValidationError) {
    return errorResponse("VALIDATION_ERROR", error.message, 400);
  }

  return errorResponse("INTERNAL_ERROR", "Internal server error", 500);
}
