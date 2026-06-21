"use server";

import { prisma } from "@/lib/prisma";
import { broadcastLeadNotification } from "@/lib/telegram";

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

    // Отправляем уведомление в Telegram
    const tgMessage = `
📢 <b>Новая заявка: Рекламодатель</b>
━━━━━━━━━━━━━━━━━━
👤 <b>Имя:</b> ${name.trim()}
📱 <b>Телефон:</b> ${phone.trim()}
✉️ <b>Email:</b> ${email.trim()}
💼 <b>Бренд:</b> ${brandName.trim()}
━━━━━━━━━━━━━━━━━━
`;
    await broadcastLeadNotification(tgMessage);

    return { success: true, message: "Заявка успешно отправлена! Мы свяжемся с вами в ближайшее время." };
  } catch (error) {
    console.error("AdvertiserLead error:", error);
    return { success: false, message: "Произошла ошибка при отправке. Попробуйте позже." };
  }
}

export async function submitBloggerLead(formData: FormData): Promise<ActionResult> {
  const name = formData.get("name") as string;
  const nickname = formData.get("nickname") as string;
  const email = formData.get("email") as string;
  const phone = formData.get("phone") as string;
  const socialLinks = formData.get("socialLinks") as string;

  // Валидация
  if (!name || name.trim().length < 2) {
    return { success: false, message: "Укажите ваше имя." };
  }
  if (!nickname || nickname.trim().length < 2) {
    return { success: false, message: "Укажите ваш никнейм." };
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
        nickname: nickname.trim(),
        email: email.trim(),
        phone: phone.trim(),
        socialLinks: socialLinks.trim(),
      },
    });

    // Отправляем уведомление в Telegram
    const tgMessage = `
📢 <b>Новая заявка: Блогер</b>
━━━━━━━━━━━━━━━━━━
👤 <b>Имя:</b> ${name.trim()}
⭐ <b>Никнейм:</b> ${nickname.trim()}
📱 <b>Телефон:</b> ${phone.trim()}
✉️ <b>Email:</b> ${email.trim()}
🔗 <b>Соцсети:</b> 
${socialLinks.trim()}
━━━━━━━━━━━━━━━━━━
`;
    await broadcastLeadNotification(tgMessage);

    return { success: true, message: "Заявка успешно отправлена! Мы свяжемся с вами в ближайшее время." };
  } catch (error) {
    console.error("BloggerLead error:", error);
    return { success: false, message: "Произошла ошибка при отправке. Попробуйте позже." };
  }
}
