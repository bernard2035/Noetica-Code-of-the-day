"use server";

import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function validateAccessCode(codeString: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || (session.user as any).role !== "SECURITY" && (session.user as any).role !== "ADMIN") {
    throw new Error("Unauthorized");
  }

  const accessCode = await prisma.accessCode.findUnique({
    where: { code: codeString.toUpperCase() },
    include: {
      resident: {
        include: { user: true }
      }
    }
  });

  if (!accessCode) {
    return { success: false, message: "Invalid access code." };
  }

  if (accessCode.status === "USED") {
    return { success: false, message: "This code has already been used." };
  }

  if (accessCode.expirationTime < new Date() && accessCode.status !== "USED") {
    // Optionally update status to EXPIRED
    await prisma.accessCode.update({
      where: { id: accessCode.id },
      data: { status: "EXPIRED" }
    });
    return { success: false, message: "This access code has expired." };
  }

  return { success: true, data: accessCode };
}

export async function markCodeAsUsed(codeId: string, vehicleInfo?: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || (session.user as any).role !== "SECURITY" && (session.user as any).role !== "ADMIN") {
    throw new Error("Unauthorized");
  }

  const updateData: any = { status: "USED" };
  if (vehicleInfo) {
    updateData.vehicleInfo = vehicleInfo;
  }

  await prisma.accessCode.update({
    where: { id: codeId },
    data: updateData
  });

  return { success: true };
}
