import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // Защита: проверяем, что запрос действительно имеет нужную структуру Telegram
    if (!body.message || !body.message.chat || !body.message.text) {
      return NextResponse.json({ ok: true });
    }

    const { chat, text, from } = body.message;
    const chatId = String(chat.id);
    const username = from?.username || null;

    if (text === "/start") {
      // Сохраняем chatId в базу данных
      await prisma.telegramSubscriber.upsert({
        where: { chatId },
        update: { username },
        create: { chatId, username },
      });

      // Отправляем приветственное сообщение
      if (TELEGRAM_BOT_TOKEN) {
        const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
        await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            chat_id: chatId,
            text: "✅ Вы успешно подписались на уведомления о новых заявках (Блогеры / Рекламодатели) с сайта 82 AGENCY!\n\nОжидайте новых лидов здесь.",
          }),
        });
      }
    }

    // Всегда возвращаем 200 OK, чтобы Telegram не дублировал вебхуки
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Telegram webhook error:", error);
    // Возвращаем 200 OK даже при ошибке, чтобы избежать зацикливания со стороны Telegram
    return NextResponse.json({ ok: true, error: "Handled Error" });
  }
}
