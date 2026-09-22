import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import Category from "@/models/Category";
import { signToken, setAuthCookie } from "@/lib/auth";
import { successResponse, errorResponse, handleApiError } from "@/lib/api-handler";
import { DEFAULT_CATEGORIES } from "@/lib/constants";

const signupSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(100),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters").max(100),
});

export async function POST(request: Request) {
  try {
    await connectDB();

    const body = await request.json();
    const parsed = signupSchema.safeParse(body);
    if (!parsed.success) {
      return errorResponse("VALIDATION_ERROR", parsed.error.issues[0].message, 400);
    }

    const { name, email, password } = parsed.data;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return errorResponse("USER_EXISTS", "An account with this email already exists", 409);
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
    });

    const categories = DEFAULT_CATEGORIES.map((cat) => ({
      userId: user._id,
      ...cat,
      isActive: true,
    }));
    await Category.insertMany(categories);

    const token = await signToken({ userId: user._id.toString(), email: user.email });
    await setAuthCookie(token);

    return successResponse({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        timezone: user.timezone,
      },
    }, 201);
  } catch (error) {
    return handleApiError(error);
  }
}
