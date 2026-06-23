import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import cloudinary from "@/lib/cloudinary";

const BOT_TOKEN = process.env.BLOGGER_BOT_TOKEN;
const PASSWORD = "1234ewq1234";

async function sendMessage(chatId: string, text: string, replyMarkup?: any) {
  if (!BOT_TOKEN) return;
  const url = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;
  await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: chatId,
      text,
      reply_markup: replyMarkup,
      parse_mode: "HTML",
    }),
  });
}

async function getTelegramFileUrl(fileId: string): Promise<string | null> {
  if (!BOT_TOKEN) return null;
  const url = `https://api.telegram.org/bot${BOT_TOKEN}/getFile?file_id=${fileId}`;
  const res = await fetch(url);
  const data = await res.json();
  if (data.ok && data.result?.file_path) {
    return `https://api.telegram.org/file/bot${BOT_TOKEN}/${data.result.file_path}`;
  }
  return null;
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const message = body.message;
    const callbackQuery = body.callback_query;

    const chatId = message?.chat?.id || callbackQuery?.message?.chat?.id;
    if (!chatId) return NextResponse.json({ ok: true });

    const chatIdStr = String(chatId);

    let session = await prisma.bloggerBotSession.findUnique({
      where: { chatId: chatIdStr },
    });

    if (!session) {
      session = await prisma.bloggerBotSession.create({
        data: { chatId: chatIdStr, isAuthenticated: false, step: "START" },
      });
    }

    const text = message?.text || "";

    // 1. AUTHENTICATION
    if (!session.isAuthenticated) {
      if (text === PASSWORD) {
        await prisma.bloggerBotSession.update({
          where: { chatId: chatIdStr },
          data: { isAuthenticated: true, step: "START" },
        });
        await sendMessage(chatIdStr, "✅ Пароль верный. Добро пожаловать! Введите /start чтобы начать.");
      } else {
        await sendMessage(chatIdStr, "🔒 Введите пароль для доступа:");
      }
      return NextResponse.json({ ok: true });
    }

    // 2. COMMANDS
    if (text === "/start" || text === "Главное меню 🏠") {
      const bloggers = await prisma.blogger.findMany({ select: { id: true, name: true } });
      const buttons = bloggers.map(b => ([{ text: b.name, callback_data: `blogger:${b.id}` }]));
      
      await prisma.bloggerBotSession.update({
        where: { chatId: chatIdStr },
        data: { step: "START", bloggerId: null, socialKey: null, uploadedUrls: [] },
      });

      await sendMessage(chatIdStr, "Выберите блогера:", { inline_keyboard: buttons });
      return NextResponse.json({ ok: true });
    }

    if (text === "Готово ✅") {
      if (session.step === "AWAITING_MEDIA" && session.bloggerId && session.socialKey) {
        // Загрузка завершена, применяем все URL к блогеру
        const blogger = await prisma.blogger.findUnique({ where: { id: session.bloggerId } });
        
        if (blogger && session.uploadedUrls.length > 0) {
          const socials = (blogger.socials as Record<string, any>) || {};
          const currentSocial = socials[session.socialKey] || {};
          
          currentSocial.statsMedia = session.uploadedUrls; // ПОЛНОСТЬЮ ЗАМЕНЯЕМ СТАРЫЕ СТАТИСТИКИ
          socials[session.socialKey] = currentSocial;

          await prisma.blogger.update({
            where: { id: session.bloggerId },
            data: { socials },
          });
          
          await sendMessage(chatIdStr, `🎉 Успешно! Статистика для соцсети сохранена (Всего файлов: ${session.uploadedUrls.length}).`, {
            remove_keyboard: true 
          });
        } else {
           await sendMessage(chatIdStr, "Файлы не были получены или произошла ошибка.", {
             remove_keyboard: true 
           });
        }

        await prisma.bloggerBotSession.update({
          where: { chatId: chatIdStr },
          data: { step: "START", bloggerId: null, socialKey: null, uploadedUrls: [] },
        });
      }
      return NextResponse.json({ ok: true });
    }

    // 3. CALLBACKS (Inline Keyboard)
    if (callbackQuery) {
      const data = callbackQuery.data as string;

      if (data.startsWith("blogger:")) {
        const bloggerId = data.replace("blogger:", "");
        const blogger = await prisma.blogger.findUnique({ where: { id: bloggerId } });
        if (!blogger) {
          await sendMessage(chatIdStr, "Блогер не найден.");
          return NextResponse.json({ ok: true });
        }

        const socials = blogger.socials as Record<string, any>;
        const socialKeys = Object.keys(socials || {});
        
        if (socialKeys.length === 0) {
          await sendMessage(chatIdStr, "У этого блогера не добавлено ни одной соцсети.");
          return NextResponse.json({ ok: true });
        }

        const buttons = socialKeys.map(key => {
          let name = key;
          if (key.startsWith("tiktok")) name = "TikTok";
          if (key.startsWith("youtube")) name = "YouTube";
          if (key.startsWith("instagram")) name = "Instagram";
          if (key.startsWith("telegram")) name = "Telegram";
          if (key.startsWith("vk")) name = "VK";
          return [{ text: name, callback_data: `social:${key}` }];
        });

        await prisma.bloggerBotSession.update({
          where: { chatId: chatIdStr },
          data: { step: "SELECT_SOCIAL", bloggerId },
        });

        await sendMessage(chatIdStr, `Блогер: <b>${blogger.name}</b>\nВыберите соцсеть для загрузки статистики:`, { inline_keyboard: buttons });
      } 
      else if (data.startsWith("social:") && session.bloggerId) {
        const socialKey = data.replace("social:", "");
        
        // Очищаем массив uploadedUrls для новой сессии загрузки
        await prisma.bloggerBotSession.update({
          where: { chatId: chatIdStr },
          data: { step: "AWAITING_MEDIA", socialKey, uploadedUrls: [] },
        });

        await sendMessage(chatIdStr, "📸 Отправьте фото или видео (можно отправить сразу несколько альбомом).\n\n<i>Примечание: новые загруженные файлы <b>полностью заменят</b> старую статистику этой соцсети.</i>\n\nКак только все файлы загрузятся, нажмите кнопку <b>Готово ✅</b> внизу экрана.", {
          keyboard: [[{ text: "Готово ✅" }, { text: "Главное меню 🏠" }]],
          resize_keyboard: true,
          one_time_keyboard: false
        });
      }

      if (BOT_TOKEN) {
        await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/answerCallbackQuery`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ callback_query_id: callbackQuery.id }),
        });
      }
      return NextResponse.json({ ok: true });
    }

    // 4. HANDLING MEDIA
    if (session.step === "AWAITING_MEDIA") {
      let fileId = null;

      if (message.photo && message.photo.length > 0) {
        fileId = message.photo[message.photo.length - 1].file_id;
      } else if (message.video) {
        fileId = message.video.file_id;
      }

      if (fileId && session.bloggerId && session.socialKey) {
        const fileUrl = await getTelegramFileUrl(fileId);
        if (fileUrl) {
          try {
            // Upload to Cloudinary bypassing Render processing
            const uploadResult = await cloudinary.uploader.upload(fileUrl, {
              resource_type: "auto",
              folder: "agency-82/stats"
            });

            const secureUrl = uploadResult.secure_url;

            // Атомарное добавление URL в массив uploaded_urls сессии
            await prisma.$executeRaw`UPDATE "blogger_bot_sessions" SET "uploaded_urls" = array_append("uploaded_urls", ${secureUrl}) WHERE "chat_id" = ${chatIdStr}`;
            
          } catch (uploadError) {
            console.error("Cloudinary upload error:", uploadError);
            await sendMessage(chatIdStr, "❌ Произошла ошибка при загрузке одного из файлов в облако.");
          }
        }
      } else if (!message.photo && !message.video) {
        await sendMessage(chatIdStr, "⚠️ Пожалуйста, отправьте фото или видео. Когда закончите — нажмите «Готово ✅».");
      }
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Telegram webhook error:", error);
    return NextResponse.json({ ok: true, error: "Handled Error" });
  }
}
