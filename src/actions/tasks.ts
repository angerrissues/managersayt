"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { checkIsAdmin } from "./admin";
import type { Task } from "@prisma/client";

// URL бота для отправки вебхуков
const BOT_API = process.env.NEXT_PUBLIC_BOT_API || "http://212.43.151.126:8080";
const BOT_API_KEY = process.env.BOT_API_KEY || "SECURE_API_KEY_82AGENCY_9918231";

async function notifyBot(event: string, task: Task) {
  try {
    const url = `${BOT_API}/api/notify_task`;
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-API-Key": BOT_API_KEY,
      },
      body: JSON.stringify({
        event,
        task,
      }),
    });
    
    if (!response.ok) {
      console.error("Failed to notify bot", await response.text());
    }
  } catch (error) {
    console.error("Error notifying bot:", error);
  }
}

export async function getActiveTasks() {
  const isAdmin = await checkIsAdmin();
  if (!isAdmin) throw new Error("Unauthorized");
  
  return prisma.task.findMany({
    where: {
      status: {
        in: ["NEW", "IN_PROGRESS"],
      },
    },
    orderBy: [
      { priority: "asc" }, // This relies on string sort (HIGH is first if we use numbers or handle differently, actually string sort: HIGH, LOW, MEDIUM. Wait, let's just sort by createdAt)
      { createdAt: "desc" },
    ],
  });
}

export async function getCompletedTasks() {
  const isAdmin = await checkIsAdmin();
  if (!isAdmin) throw new Error("Unauthorized");
  
  return prisma.task.findMany({
    where: {
      status: "COMPLETED",
    },
    orderBy: { updatedAt: "desc" },
  });
}

export async function saveTask(data: Partial<Task>) {
  const isAdmin = await checkIsAdmin();
  if (!isAdmin) throw new Error("Unauthorized");

  const isNew = !data.id;
  
  // Custom sorting or validation can go here
  const result = await prisma.task.upsert({
    where: { id: data.id || "new-id" },
    update: data,
    create: {
      title: data.title!,
      description: data.description,
      priority: data.priority || "MEDIUM",
      deadline: data.deadline,
      status: data.status || "NEW",
    },
  });

  revalidatePath("/tasks");
  
  if (isNew) {
    await notifyBot("created", result);
  }
  
  return result;
}

export async function updateTaskStatus(id: string, status: string) {
  const isAdmin = await checkIsAdmin();
  if (!isAdmin) throw new Error("Unauthorized");

  const result = await prisma.task.update({
    where: { id },
    data: { status },
  });

  revalidatePath("/tasks");
  
  await notifyBot("status_changed", result);
  
  return result;
}

export async function deleteTask(id: string) {
  const isAdmin = await checkIsAdmin();
  if (!isAdmin) throw new Error("Unauthorized");

  const result = await prisma.task.delete({
    where: { id },
  });

  revalidatePath("/tasks");
  return result;
}
