import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import { signToken, setAuthCookie } from "@/lib/auth";
import { successResponse, errorResponse, handleApiError } from "@/lib/api-handler";

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export async function POST(request: Request) {
  try {
    await connectDB();

    const body = await request.json();
    const parsed = loginSchema.safeParse(body);
    if (!parsed.success) {
      return errorResponse("VALIDATION_ERROR", parsed.error.issues[0].message, 400);
    }

    const { email, password } = parsed.data;

    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      return errorResponse("INVALID_CREDENTIALS", "Invalid email or password", 401);
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return errorResponse("INVALID_CREDENTIALS", "Invalid email or password", 401);
    }

    const token = await signToken({ userId: user._id.toString(), email: user.email });
    await setAuthCookie(token);

    return successResponse({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        timezone: user.timezone,
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}
