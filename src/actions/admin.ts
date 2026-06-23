"use server";

import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import cloudinary from "@/lib/cloudinary";

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

export async function loginAdmin(password: string) {
  if (password === ADMIN_PASSWORD) {
    const cookieStore = await cookies();
    cookieStore.set("admin_token", "true", { httpOnly: true, secure: true, path: "/" });
    return { success: true };
  }
  return { success: false, error: "Неверный пароль" };
}

export async function logoutAdmin() {
  const cookieStore = await cookies();
  cookieStore.delete("admin_token");
  return { success: true };
}

export async function checkIsAdmin() {
  const cookieStore = await cookies();
  return cookieStore.get("admin_token")?.value === "true";
}

import { revalidatePath } from "next/cache";

// -- BLOGGERS --
export async function getBloggers() {
  return prisma.blogger.findMany({ orderBy: { createdAt: 'asc' } });
}

export async function saveBlogger(data: any) {
  const isAdmin = await checkIsAdmin();
  if (!isAdmin) throw new Error("Unauthorized");
  
  const result = await prisma.blogger.upsert({
    where: { id: data.id },
    update: data,
    create: data,
  });
  revalidatePath("/blogers");
  revalidatePath("/statistics");
  return result;
}

export async function deleteBlogger(id: string) {
  const isAdmin = await checkIsAdmin();
  if (!isAdmin) throw new Error("Unauthorized");
  
  const result = await prisma.blogger.delete({ where: { id } });
  revalidatePath("/blogers");
  revalidatePath("/statistics");
  return result;
}

// -- CASES --
export async function getCases() {
  return prisma.case.findMany({ orderBy: { createdAt: 'asc' } });
}

export async function saveCase(data: any) {
  const isAdmin = await checkIsAdmin();
  if (!isAdmin) throw new Error("Unauthorized");
  
  const result = await prisma.case.upsert({
    where: { id: data.id },
    update: data,
    create: data,
  });
  revalidatePath("/cases");
  return result;
}

export async function deleteCase(id: string) {
  const isAdmin = await checkIsAdmin();
  if (!isAdmin) throw new Error("Unauthorized");
  
  const result = await prisma.case.delete({ where: { id } });
  revalidatePath("/cases");
  return result;
}

// -- CLOUDINARY UPLOAD --
export async function getCloudinarySignature() {
  const isAdmin = await checkIsAdmin();
  if (!isAdmin) return { error: "Unauthorized" };

  const timestamp = Math.round(new Date().getTime() / 1000);
  const signature = cloudinary.utils.api_sign_request(
    { timestamp, folder: "manager_sayt" },
    process.env.CLOUDINARY_API_SECRET!
  );

  return {
    timestamp,
    signature,
    apiKey: process.env.CLOUDINARY_API_KEY!,
    cloudName: process.env.CLOUDINARY_CLOUD_NAME!,
  };
}
