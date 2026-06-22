"use server";

import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { revalidatePath } from "next/cache";

export async function getResidentProfile() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) throw new Error("Unauthorized");

  const profile = await prisma.residentProfile.findUnique({
    where: { userId: session.user.id },
  });

  return profile;
}

export async function updateResidentProfile(data: {
  landlord?: string;
  address?: string;
  lat?: number;
  lng?: number;
  occupantCount?: number;
}) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) throw new Error("Unauthorized");

  const profile = await prisma.residentProfile.update({
    where: { userId: session.user.id },
    data,
  });

  revalidatePath("/resident/profile");
  return profile;
}

export async function generateAccessCode(data: {
  guestName: string;
  guestVehicleInfo?: string;
  expiresInHours: number;
}) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) throw new Error("Unauthorized");

  const residentProfile = await prisma.residentProfile.findUnique({
    where: { userId: session.user.id },
  });

  if (!residentProfile) throw new Error("Resident profile not found");

  const code = Math.random().toString(36).substring(2, 8).toUpperCase();
  const expirationTime = new Date();
  expirationTime.setHours(expirationTime.getHours() + data.expiresInHours);

  const newCode = await prisma.accessCode.create({
    data: {
      code,
      residentId: residentProfile.id,
      guestName: data.guestName,
      guestVehicleInfo: data.guestVehicleInfo,
      expirationTime,
    },
  });

  revalidatePath("/resident/history");
  revalidatePath("/resident");
  return newCode;
}

export async function getAccessHistory() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) throw new Error("Unauthorized");

  const residentProfile = await prisma.residentProfile.findUnique({
    where: { userId: session.user.id },
  });

  if (!residentProfile) return [];

  const history = await prisma.accessCode.findMany({
    where: { residentId: residentProfile.id },
    orderBy: { creationTime: "desc" },
  });

  return history;
}

export async function getPaymentHistory() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) throw new Error("Unauthorized");

  const residentProfile = await prisma.residentProfile.findUnique({
    where: { userId: session.user.id },
  });

  if (!residentProfile) return { payments: [], feeStatus: "PENDING", defaultFee: 50000 };

  const [payments, settings] = await Promise.all([
    prisma.payment.findMany({
      where: { residentId: residentProfile.id },
      orderBy: { date: "desc" },
    }),
    prisma.estateSettings.findFirst(),
  ]);

  return {
    payments,
    feeStatus: residentProfile.securityFeeStatus,
    defaultFee: settings?.defaultSecurityFee || 50000,
  };
}

export async function cancelAccessCode(codeId: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) throw new Error("Unauthorized");

  const residentProfile = await prisma.residentProfile.findUnique({
    where: { userId: session.user.id },
  });

  if (!residentProfile) throw new Error("Resident profile not found");

  // Only cancel codes belonging to this resident
  await prisma.accessCode.updateMany({
    where: { id: codeId, residentId: residentProfile.id, status: "ACTIVE" },
    data: { status: "CANCELLED" },
  });

  revalidatePath("/resident/history");
  revalidatePath("/resident");
  return { success: true };
}
