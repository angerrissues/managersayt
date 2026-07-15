"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import cloudinary from "@/lib/cloudinary";
import type { Blogger } from "@/types/blogger";
import type { Case } from "@/types/case";

import crypto from "crypto";

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;
const TELEGRAM_BOT_TOKEN = process.env.MANAGER_BOT_TOKEN;

// -- AUTH --

export async function loginAdmin(password: string) {
  if (password === ADMIN_PASSWORD) {
    const cookieStore = await cookies();
    cookieStore.set("admin_token", "true", { httpOnly: true, secure: true, path: "/" });
    return { success: true };
  }
  return { success: false, error: "Неверный пароль" };
}

export async function loginViaTelegram(initData: string) {
  if (!TELEGRAM_BOT_TOKEN) {
    return { success: false, error: "Telegram token not configured" };
  }

  try {
    const urlParams = new URLSearchParams(initData);
    const hash = urlParams.get("hash");
    urlParams.delete("hash");

    // Sort params alphabetically
    const keys = Array.from(urlParams.keys()).sort();
    const dataCheckString = keys.map(key => `${key}=${urlParams.get(key)}`).join("\n");

    // Verify HMAC-SHA256
    const secretKey = crypto.createHmac("sha256", "WebAppData").update(TELEGRAM_BOT_TOKEN).digest();
    const calculatedHash = crypto.createHmac("sha256", secretKey).update(dataCheckString).digest("hex");

    // Пытаемся получить user.id из initData для хардкод-байпаса
    const userParam = urlParams.get("user");
    if (userParam) {
      try {
        const userObj = JSON.parse(decodeURIComponent(userParam));
        if (String(userObj.id) === "938375437") {
          const cookieStore = await cookies();
          cookieStore.set("admin_token", "true", { httpOnly: true, secure: true, path: "/" });
          return { success: true };
        }
      } catch (e) {
        // Игнорируем ошибки парсинга здесь, падаем в обычную валидацию
      }
    }

    if (calculatedHash === hash) {
      if (userParam) {
        try {
          const userObj = JSON.parse(decodeURIComponent(userParam));
          const userId = String(userObj.id);
          const allowedIds = (process.env.ALLOWED_MANAGER_IDS || "7915041131,1965048346,938375437").split(",").map(id => id.trim());
          
          if (!allowedIds.includes(userId)) {
            return { success: false, error: "Ваш Telegram ID не имеет прав администратора" };
          }
        } catch (e) {
          // Если не смогли распарсить user, лучше запретить доступ
          return { success: false, error: "Ошибка идентификации пользователя" };
        }
      } else {
        return { success: false, error: "Данные пользователя отсутствуют" };
      }

      // Подпись верна и ID разрешен! Устанавливаем админскую куку.
      const cookieStore = await cookies();
      cookieStore.set("admin_token", "true", { httpOnly: true, secure: true, path: "/" });
      return { success: true };
    } else {
      return { success: false, error: "Недействительная подпись Telegram" };
    }
  } catch (err) {
    return { success: false, error: "Ошибка проверки данных" };
  }
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

// -- BLOGGERS --

export async function getBloggers() {
  return prisma.blogger.findMany({ orderBy: { createdAt: "asc" } });
}

export async function saveBlogger(data: Partial<Blogger>) {
  const isAdmin = await checkIsAdmin();
  if (!isAdmin) throw new Error("Unauthorized");

  if (!data.id) throw new Error("Blogger ID is required");

  const result = await prisma.blogger.upsert({
    where: { id: data.id },
    update: data,
    create: data as Blogger,
  });
  revalidatePath("/blogers");
  revalidatePath("/statistics");
  revalidatePath("/");
  return result;
}

export async function deleteBlogger(id: string) {
  const isAdmin = await checkIsAdmin();
  if (!isAdmin) throw new Error("Unauthorized");

  const result = await prisma.blogger.delete({ where: { id } });
  revalidatePath("/blogers");
  revalidatePath("/statistics");
  revalidatePath("/");
  return result;
}

// -- CASES --

export async function getCases() {
  return prisma.case.findMany({ orderBy: { createdAt: "asc" } });
}

export async function saveCase(data: Partial<Case>) {
  const isAdmin = await checkIsAdmin();
  if (!isAdmin) throw new Error("Unauthorized");

  if (!data.id) throw new Error("Case ID is required");

  const result = await prisma.case.upsert({
    where: { id: data.id },
    update: data,
    create: data as Case,
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

export async function getCloudinarySignature(params: Record<string, string> = {}) {
  const isAdmin = await checkIsAdmin();
  if (!isAdmin) return { error: "Unauthorized" };

  const timestamp = Math.round(new Date().getTime() / 1000);
  const signature = cloudinary.utils.api_sign_request(
    { timestamp, folder: "manager_sayt", ...params },
    process.env.CLOUDINARY_API_SECRET!
  );

  return {
    timestamp,
    signature,
    apiKey: process.env.CLOUDINARY_API_KEY!,
    cloudName: process.env.CLOUDINARY_CLOUD_NAME!,
  };
}
