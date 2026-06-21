"use server";

import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function signupResident(formData: FormData) {
  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const address = formData.get("address") as string;

  if (!name || !email || !password || !address) {
    return { success: false, message: "All fields are required" };
  }

  try {
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return { success: false, message: "A user with this email address already exists. Please go back to the sign in page." };
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const uniqueId = `RES-${Math.floor(10000 + Math.random() * 90000)}`;

    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        passwordHash,
        role: "RESIDENT",
        residentProfile: {
          create: {
            uniqueId,
            address,
            securityFeeStatus: "PENDING",
          },
        },
      },
    });

    return { success: true, message: "Signup successful! You can now log in." };
  } catch (error) {
    console.error("Signup error:", error);
    return { success: false, message: "Internal server error" };
  }
}
