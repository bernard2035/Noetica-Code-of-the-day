"use server";

import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function getAdminDashboardStats() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || (session.user as any).role !== "ADMIN") {
    throw new Error("Unauthorized: Admin access required.");
  }

  const [
    totalResidents,
    totalSecurity,
    totalCodes,
    activeCodes
  ] = await Promise.all([
    prisma.residentProfile.count(),
    prisma.securityProfile.count(),
    prisma.accessCode.count(),
    prisma.accessCode.count({ where: { status: "ACTIVE" } }),
  ]);

  return {
    totalResidents,
    totalSecurity,
    totalCodes,
    activeCodes
  };
}

export async function getAllUsers() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || (session.user as any).role !== "ADMIN") {
    throw new Error("Unauthorized: Admin access required.");
  }

  return prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      residentProfile: true,
      securityProfile: true
    }
  });
}

import bcrypt from "bcryptjs";

export async function getSecurityGuards() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || (session.user as any).role !== "ADMIN") {
    throw new Error("Unauthorized");
  }

  const guards = await prisma.user.findMany({
    where: { role: "SECURITY" },
    include: {
      securityProfile: true
    }
  });

  return { success: true, data: guards };
}

export async function createSecurityGuard(formData: FormData) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || (session.user as any).role !== "ADMIN") {
    throw new Error("Unauthorized");
  }

  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const badgeNumber = formData.get("badgeNumber") as string;

  if (!name || !email || !password || !badgeNumber) {
    return { success: false, message: "All fields are required" };
  }

  try {
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return { success: false, message: "Email is already registered" };
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const uniqueId = `SEC-${Math.floor(10000 + Math.random() * 90000)}`;

    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        passwordHash,
        role: "SECURITY",
        securityProfile: {
          create: {
            uniqueId,
            badgeNumber,
          },
        },
      },
    });

    return { success: true, message: "Security Guard created successfully" };
  } catch (error) {
    console.error("Create guard error:", error);
    return { success: false, message: "Internal server error" };
  }
}
