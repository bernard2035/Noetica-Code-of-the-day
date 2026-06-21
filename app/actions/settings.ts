"use server";

import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function getEstateSettings() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || (session.user as any).role !== "ADMIN") {
    throw new Error("Unauthorized");
  }

  let settings = await prisma.estateSettings.findFirst();
  if (!settings) {
    settings = await prisma.estateSettings.create({
      data: {
        defaultSecurityFee: 0,
      }
    });
  }

  return { success: true, data: settings };
}

export async function updateEstateSettings(formData: FormData) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || (session.user as any).role !== "ADMIN") {
    throw new Error("Unauthorized");
  }

  const defaultSecurityFee = parseFloat(formData.get("defaultSecurityFee") as string);
  const estateAddress = formData.get("estateAddress") as string;
  const estateLat = parseFloat(formData.get("estateLat") as string);
  const estateLng = parseFloat(formData.get("estateLng") as string);

  const settings = await prisma.estateSettings.findFirst();

  if (settings) {
    await prisma.estateSettings.update({
      where: { id: settings.id },
      data: {
        defaultSecurityFee: isNaN(defaultSecurityFee) ? 0 : defaultSecurityFee,
        estateAddress,
        estateLat: isNaN(estateLat) ? null : estateLat,
        estateLng: isNaN(estateLng) ? null : estateLng,
      }
    });
  } else {
    await prisma.estateSettings.create({
      data: {
        defaultSecurityFee: isNaN(defaultSecurityFee) ? 0 : defaultSecurityFee,
        estateAddress,
        estateLat: isNaN(estateLat) ? null : estateLat,
        estateLng: isNaN(estateLng) ? null : estateLng,
      }
    });
  }

  return { success: true };
}
