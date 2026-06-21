"use server";

import { prisma } from "@/lib/prisma";

type ActionResult = {
  success: boolean;
  message: string;
};

export async function submitAdvertiserLead(formData: FormData): Promise<ActionResult> {
  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const phone = formData.get("phone") as string;
  const brandName = formData.get("brandName") as string;

  // Валидация
  if (!name || name.trim().length < 2) {
    return { success: false, message: "Укажите ваше имя." };
  }
  if (!email || !email.includes("@")) {
    return { success: false, message: "Укажите корректный Email." };
  }
  if (!phone || phone.trim().length < 5) {
    return { success: false, message: "Укажите корректный номер телефона." };
  }
  if (!brandName || brandName.trim().length < 2) {
    return { success: false, message: "Укажите название бренда." };
  }

  try {
    await prisma.advertiserLead.create({
      data: {
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
        brandName: brandName.trim(),
      },
    });
    return { success: true, message: "Заявка успешно отправлена! Мы свяжемся с вами в ближайшее время." };
  } catch (error) {
    console.error("AdvertiserLead error:", error);
    return { success: false, message: "Произошла ошибка при отправке. Попробуйте позже." };
  }
}

export async function submitBloggerLead(formData: FormData): Promise<ActionResult> {
  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const phone = formData.get("phone") as string;
  const socialLinks = formData.get("socialLinks") as string;

  // Валидация
  if (!name || name.trim().length < 2) {
    return { success: false, message: "Укажите ваше имя." };
  }
  if (!email || !email.includes("@")) {
    return { success: false, message: "Укажите корректный Email." };
  }
  if (!phone || phone.trim().length < 5) {
    return { success: false, message: "Укажите корректный номер телефона." };
  }
  if (!socialLinks || socialLinks.trim().length < 5) {
    return { success: false, message: "Укажите хотя бы одну ссылку на вашу социальную сеть." };
  }

  try {
    await prisma.bloggerLead.create({
      data: {
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
        socialLinks: socialLinks.trim(),
      },
    });
    return { success: true, message: "Заявка успешно отправлена! Мы свяжемся с вами в ближайшее время." };
  } catch (error) {
    console.error("BloggerLead error:", error);
    return { success: false, message: "Произошла ошибка при отправке. Попробуйте позже." };
  }
}
