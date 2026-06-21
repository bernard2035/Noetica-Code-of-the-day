"use server";

import prisma from "@/lib/prisma";

export async function getVisitorPass(codeString: string) {
  const accessCode = await prisma.accessCode.findUnique({
    where: { code: codeString.toUpperCase() },
    include: {
      resident: true,
    }
  });

  if (!accessCode) {
    return { success: false, message: "Invalid access code." };
  }

  // Update status if expired but not yet marked
  if (accessCode.expirationTime < new Date() && accessCode.status === "ACTIVE") {
    await prisma.accessCode.update({
      where: { id: accessCode.id },
      data: { status: "EXPIRED" }
    });
    accessCode.status = "EXPIRED";
  }

  // Only return necessary public data
  return {
    success: true,
    data: {
      code: accessCode.code,
      status: accessCode.status,
      expirationTime: accessCode.expirationTime,
      destination: accessCode.resident.address || "Noetica Estate",
      guestName: accessCode.guestName,
    }
  };
}
