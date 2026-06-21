"use server";

import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function getUserNotifications() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) throw new Error("Unauthorized");

  return prisma.notification.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
  });
}

export async function markNotificationAsRead(notificationId: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) throw new Error("Unauthorized");

  // ensure the notification belongs to user
  const notif = await prisma.notification.findUnique({
    where: { id: notificationId }
  });
  
  if (notif?.userId !== session.user.id) throw new Error("Unauthorized");

  return prisma.notification.update({
    where: { id: notificationId },
    data: { isRead: true }
  });
}

export async function deleteNotification(notificationId: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) throw new Error("Unauthorized");

  const notif = await prisma.notification.findUnique({
    where: { id: notificationId }
  });
  
  if (notif?.userId !== session.user.id) throw new Error("Unauthorized");

  return prisma.notification.delete({
    where: { id: notificationId }
  });
}

export async function clearAllNotifications() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) throw new Error("Unauthorized");

  return prisma.notification.deleteMany({
    where: { userId: session.user.id }
  });
}

export async function createNotification(userId: string, data: {
  title: string;
  message: string;
  category?: string;
}) {
  return prisma.notification.create({
    data: {
      userId,
      title: data.title,
      message: data.message,
      category: data.category || "SYSTEM"
    }
  });
}
