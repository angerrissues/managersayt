import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import cloudinary from "@/lib/cloudinary";
import { revalidatePath } from "next/cache";

const BOT_TOKEN = process.env.BLOGGER_BOT_TOKEN;
const PASSWORD = "1234ewq1234";

const METRIC_1_PROMPT: Record<string, { field: string, label: string } | null> = {
  tiktok: { field: "views", label: "Просмотры видео" },
  youtube: { field: "horizontalViews", label: "Горизонтальные видео" },
  instagram: { field: "reelsViews", label: "Просмотры Reels" },
  telegram: { field: "dailyViews", label: "Суточные просмотры" },
  vk: null
};

const METRIC_2_PROMPT: Record<string, { field: string, label: string } | null> = {
  tiktok: null,
  youtube: { field: "verticalViews", label: "Вертикальные видео (Shorts)" },
  instagram: { field: "storiesViews", label: "Просмотры Stories" },
  telegram: { field: "monthlyViews", label: "Месячные просмотры" },
  vk: null
};

async function sendMessage(chatId: string, text: string, replyMarkup?: any) {
  if (!BOT_TOKEN) return;
  const url = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;
  
  const payload: any = {
    chat_id: chatId,
    text,
    parse_mode: "HTML",
  };

  if (replyMarkup) {
    if (replyMarkup.remove_keyboard) {
      payload.reply_markup = { remove_keyboard: true };
    } else if (replyMarkup.inline_keyboard) {
      payload.reply_markup = { inline_keyboard: replyMarkup.inline_keyboard };
    } else if (replyMarkup.keyboard) {
      payload.reply_markup = { 
        keyboard: replyMarkup.keyboard, 
        resize_keyboard: replyMarkup.resize_keyboard, 
        one_time_keyboard: replyMarkup.one_time_keyboard 
      };
    }
  }

  await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
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
        data: { step: "START", bloggerId: null, socialKey: null, uploadedUrls: [], tempData: null },
      });

      await sendMessage(chatIdStr, "👥 <b>Выберите блогера:</b>", { inline_keyboard: buttons });
      return NextResponse.json({ ok: true });
    }

    if (text === "Готово ✅" && session.step === "AWAITING_MEDIA") {
      if (session.bloggerId && session.socialKey) {
        const blogger = await prisma.blogger.findUnique({ where: { id: session.bloggerId } });
        
        if (blogger) {
          const socials = (blogger.socials as Record<string, any>) || {};
          const currentSocial = socials[session.socialKey] || {};
          
          if (session.uploadedUrls && session.uploadedUrls.length > 0) {
            currentSocial.statsMedia = session.uploadedUrls;
            socials[session.socialKey] = currentSocial;

            await prisma.blogger.update({
              where: { id: session.bloggerId },
              data: { socials },
            });
            
            revalidatePath("/blogers");
            revalidatePath("/statistics");
            
            await sendMessage(chatIdStr, `🎉 Успешно! Скриншоты для соцсети сохранены (Всего новых файлов: ${session.uploadedUrls.length}).`, {
              remove_keyboard: true 
            });
          } else {
            // Если не отправил ни одного файла, но нажал готово -> просто сохраняем старые
            await sendMessage(chatIdStr, `🎉 Успешно! Новые скриншоты не загружались, старые сохранены без изменений.`, {
              remove_keyboard: true 
            });
          }
        }
        await prisma.bloggerBotSession.update({
          where: { chatId: chatIdStr },
          data: { step: "START", bloggerId: null, socialKey: null, uploadedUrls: [], tempData: null },
        });
      }
      return NextResponse.json({ ok: true });
    }

    // 3. EDIT DETAILS FLOW
    if (session.step.startsWith("EDIT_DETAILS_")) {
      if (text === "Главное меню 🏠") return NextResponse.json({ ok: true });

      let details = (session.tempData as Record<string,any>) || {};
      const blogger = await prisma.blogger.findUnique({ where: { id: session.bloggerId! } });
      const currentDetails = blogger?.details as Record<string,any> || {};
      
      const proceedToNext = async (nextStep: string, prompt: string, currentVal: string) => {
        await prisma.bloggerBotSession.update({
          where: { chatId: chatIdStr },
          data: { step: nextStep, tempData: details },
        });
        await sendMessage(chatIdStr, `<b>${prompt}</b>\nТекущее: <i>${currentVal || "не заполнено"}</i>\n\nВведите новый текст или нажмите "Пропустить ⏭":`, {
          keyboard: [[{ text: "Пропустить ⏭" }, { text: "Главное меню 🏠" }]],
          resize_keyboard: true
        });
      };

      if (session.step === "EDIT_DETAILS_POSITIONING") {
        if (text !== "Пропустить ⏭") details.positioning = text;
        await proceedToNext("EDIT_DETAILS_ABOUT", "О блогере", currentDetails.about);
      }
      else if (session.step === "EDIT_DETAILS_ABOUT") {
        if (text !== "Пропустить ⏭") details.about = text;
        await proceedToNext("EDIT_DETAILS_AUDIENCE", "Аудитория", currentDetails.audience);
      }
      else if (session.step === "EDIT_DETAILS_AUDIENCE") {
        if (text !== "Пропустить ⏭") details.audience = text;
        await proceedToNext("EDIT_DETAILS_FORMAT", "Коронный формат", currentDetails.format);
      }
      else if (session.step === "EDIT_DETAILS_FORMAT") {
        if (text !== "Пропустить ⏭") details.format = text;
        
        await prisma.blogger.update({
          where: { id: session.bloggerId! },
          data: { details },
        });
        
        revalidatePath("/blogers");
        revalidatePath("/statistics");
        
        await prisma.bloggerBotSession.update({
          where: { chatId: chatIdStr },
          data: { step: "START", bloggerId: null, tempData: null },
        });
        await sendMessage(chatIdStr, "✅ Описание блогера успешно обновлено на сайте!", { remove_keyboard: true });
      }
      return NextResponse.json({ ok: true });
    }

    // 4. EDIT SOCIAL FLOW
    if (session.step.startsWith("EDIT_SOCIAL_")) {
      if (text === "Главное меню 🏠") return NextResponse.json({ ok: true });

      let socialData = (session.tempData as Record<string,any>) || {};
      const socialKey = session.socialKey!;
      const platform = socialKey.split("_")[0];
      
      const promptNext = async (nextStep: string, promptTitle: string, fieldName: string) => {
        await prisma.bloggerBotSession.update({
          where: { chatId: chatIdStr },
          data: { step: nextStep, tempData: socialData },
        });
        const curr = socialData[fieldName] || "нет";
        await sendMessage(chatIdStr, `<b>${promptTitle}</b>\nТекущее: <i>${curr}</i>\n\nВведите новые данные или нажмите "Пропустить ⏭":`, {
          keyboard: [[{ text: "Пропустить ⏭" }, { text: "Главное меню 🏠" }]],
          resize_keyboard: true
        });
      };

      if (session.step === "EDIT_SOCIAL_FOLLOWERS") {
        if (text !== "Пропустить ⏭") socialData.followers = text;
        
        const metric1 = METRIC_1_PROMPT[platform];
        if (metric1) {
          await promptNext("EDIT_SOCIAL_METRIC_1", metric1.label, metric1.field);
        } else {
          await promptNext("EDIT_SOCIAL_RKN", "Ссылка на РКН (если нет, отправьте минус «-» чтобы удалить)", "rknLink");
        }
      }
      else if (session.step === "EDIT_SOCIAL_METRIC_1") {
        const metric1 = METRIC_1_PROMPT[platform];
        if (text !== "Пропустить ⏭" && metric1) socialData[metric1.field] = text;

        const metric2 = METRIC_2_PROMPT[platform];
        if (metric2) {
          await promptNext("EDIT_SOCIAL_METRIC_2", metric2.label, metric2.field);
        } else {
          await promptNext("EDIT_SOCIAL_RKN", "Ссылка на РКН (если нет, отправьте минус «-» чтобы удалить)", "rknLink");
        }
      }
      else if (session.step === "EDIT_SOCIAL_METRIC_2") {
        const metric2 = METRIC_2_PROMPT[platform];
        if (text !== "Пропустить ⏭" && metric2) socialData[metric2.field] = text;
        
        await promptNext("EDIT_SOCIAL_RKN", "Ссылка на РКН (если нет, отправьте минус «-» чтобы удалить)", "rknLink");
      }
      else if (session.step === "EDIT_SOCIAL_RKN") {
        if (text === "-") {
            delete socialData.rknLink;
        } else if (text !== "Пропустить ⏭") {
            socialData.rknLink = text;
        }

        // SAVE TEXT DATA TO DB
        const blogger = await prisma.blogger.findUnique({ where: { id: session.bloggerId! } });
        if (blogger) {
          const socials = (blogger.socials as Record<string,any>) || {};
          socials[socialKey] = socialData;
          await prisma.blogger.update({
            where: { id: session.bloggerId! },
            data: { socials },
          });
          revalidatePath("/blogers");
          revalidatePath("/statistics");
        }
        
        // JUMP TO MEDIA
        await prisma.bloggerBotSession.update({
          where: { chatId: chatIdStr },
          data: { step: "AWAITING_MEDIA", uploadedUrls: [], tempData: null },
        });

        await sendMessage(chatIdStr, "📸 <b>Скриншоты статистики</b>\n\nОтправьте новые фото/видео (они <b>полностью заменят</b> старые). \nЕсли хотите <b>оставить старые</b> фото — просто ничего не отправляйте и нажмите <b>Готово ✅</b>.", {
          keyboard: [[{ text: "Готово ✅" }, { text: "Главное меню 🏠" }]],
          resize_keyboard: true
        });
      }
      return NextResponse.json({ ok: true });
    }

    // 5. CALLBACKS (Inline Keyboard)
    if (callbackQuery) {
      const data = callbackQuery.data as string;

      if (data.startsWith("blogger:")) {
        const bloggerId = data.replace("blogger:", "");
        await prisma.bloggerBotSession.update({
          where: { chatId: chatIdStr },
          data: { step: "SELECT_ACTION", bloggerId },
        });

        const buttons = [
          [{ text: "📝 Редактировать описание", callback_data: `action:details` }],
          [{ text: "📱 Обновить соцсети / статистику", callback_data: `action:socials` }]
        ];
        
        const blogger = await prisma.blogger.findUnique({ where: { id: bloggerId } });
        await sendMessage(chatIdStr, `Блогер: <b>${blogger?.name}</b>\nЧто вы хотите отредактировать?`, { inline_keyboard: buttons });
      } 
      else if (data === "action:details" && session.bloggerId) {
        const blogger = await prisma.blogger.findUnique({ where: { id: session.bloggerId } });
        const currentDetails = blogger?.details as Record<string,any> || {};
        
        await prisma.bloggerBotSession.update({
          where: { chatId: chatIdStr },
          data: { step: "EDIT_DETAILS_POSITIONING", tempData: currentDetails },
        });

        await sendMessage(chatIdStr, `<b>Позиционирование</b>\nТекущее: <i>${currentDetails.positioning || "не заполнено"}</i>\n\nВведите новый текст или нажмите "Пропустить ⏭":`, {
          keyboard: [[{ text: "Пропустить ⏭" }, { text: "Главное меню 🏠" }]],
          resize_keyboard: true
        });
      }
      else if (data === "action:socials" && session.bloggerId) {
        const blogger = await prisma.blogger.findUnique({ where: { id: session.bloggerId } });
        const socials = blogger?.socials as Record<string, any>;
        const socialKeys = Object.keys(socials || {});
        
        if (socialKeys.length === 0) {
          await sendMessage(chatIdStr, "У этого блогера не добавлено ни одной соцсети.");
        } else {
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
            data: { step: "SELECT_SOCIAL" },
          });

          await sendMessage(chatIdStr, `Выберите соцсеть для редактирования:`, { inline_keyboard: buttons });
        }
      }
      else if (data.startsWith("social:") && session.bloggerId) {
        const socialKey = data.replace("social:", "");
        const blogger = await prisma.blogger.findUnique({ where: { id: session.bloggerId } });
        const socials = (blogger?.socials as Record<string,any>) || {};
        const currentSocial = socials[socialKey] || {};
        
        await prisma.bloggerBotSession.update({
          where: { chatId: chatIdStr },
          data: { step: "EDIT_SOCIAL_FOLLOWERS", socialKey, tempData: currentSocial, uploadedUrls: [] },
        });

        await sendMessage(chatIdStr, `<b>Подписчики</b>\nТекущее: <i>${currentSocial.followers || "нет"}</i>\n\nВведите новые данные или нажмите "Пропустить ⏭":`, {
          keyboard: [[{ text: "Пропустить ⏭" }, { text: "Главное меню 🏠" }]],
          resize_keyboard: true
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

    // 6. HANDLING MEDIA
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
            const uploadResult = await cloudinary.uploader.upload(fileUrl, {
              resource_type: "auto",
              folder: "agency-82/stats"
            });

            const secureUrl = uploadResult.secure_url;

            // Атомарное добавление URL
            await prisma.$executeRaw`UPDATE "blogger_bot_sessions" SET "uploaded_urls" = array_append("uploaded_urls", ${secureUrl}) WHERE "chat_id" = ${chatIdStr}`;
            
          } catch (uploadError) {
            console.error("Cloudinary upload error:", uploadError);
            await sendMessage(chatIdStr, "❌ Произошла ошибка при загрузке одного из файлов в облако.");
          }
        }
      } else if (!message.photo && !message.video) {
        await sendMessage(chatIdStr, "⚠️ Пожалуйста, отправьте фото или видео. Если хотите оставить старые — нажмите «Готово ✅».");
      }
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Telegram webhook error:", error);
    return NextResponse.json({ ok: true, error: "Handled Error" });
  }
}
