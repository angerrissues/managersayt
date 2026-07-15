import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import cloudinary from "@/lib/cloudinary";
import { revalidatePath } from "next/cache";

const BOT_TOKEN = process.env.BLOGGER_BOT_TOKEN;

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

const PRICING_FIELDS: Record<string, { key: string, label: string }[]> = {
  tiktok: [
    { key: "video", label: "ролик" }
  ],
  instagram: [
    { key: "post", label: "рилс" },
    { key: "story", label: "сторис" }
  ],
  youtube: [
    { key: "preroll", label: "Преролл" },
    { key: "int1", label: "Интеграция 1 слот" },
    { key: "int2", label: "Интеграция 2 слот" },
    { key: "shorts", label: "YT Shorts" }
  ],
  vk: [
    { key: "post", label: "Текстовый/фотопост" },
    { key: "clip", label: "Клип" }
  ],
  telegram: [
    { key: "text", label: "Текстовый пост" },
    { key: "photo", label: "Фотопост" },
    { key: "video", label: "Видеопост" },
    { key: "circle", label: "Кружок + текст" }
  ]
};

const PLATFORM_NAMES: Record<string, string> = {
  tiktok: "TikTok",
  instagram: "Instagram",
  youtube: "Youtube",
  vk: "VK",
  telegram: "tgk"
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

const corsHeaders = {
  "Access-Control-Allow-Origin": "https://82agency.net",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: corsHeaders,
  });
}

export async function POST(req: Request) {
  try {
    const tgSecretToken = req.headers.get("x-telegram-bot-api-secret-token");
    if (!tgSecretToken || tgSecretToken !== process.env.TELEGRAM_WEBHOOK_SECRET) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401, headers: corsHeaders });
    }

    let body;
    try {
      body = await req.json();
    } catch (e) {
      return NextResponse.json({ error: "Invalid JSON" }, { status: 400, headers: corsHeaders });
    }

    if (!body || typeof body !== "object" || (!body.message && !body.callback_query)) {
      return NextResponse.json({ error: "Invalid payload structure" }, { status: 400, headers: corsHeaders });
    }

    const message = body.message;
    const callbackQuery = body.callback_query;

    const chatId = message?.chat?.id || callbackQuery?.message?.chat?.id;
    if (!chatId) return NextResponse.json({ ok: true }, { headers: corsHeaders });

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
      if (text === process.env.BOT_ADMIN_PASSWORD) {
        await prisma.bloggerBotSession.update({
          where: { chatId: chatIdStr },
          data: { isAuthenticated: true, step: "START" },
        });
        await sendMessage(chatIdStr, "✅ Пароль верный. Добро пожаловать! Введите /start чтобы начать.");
      } else {
        await sendMessage(chatIdStr, "🔒 Введите пароль для доступа:");
      }
      return NextResponse.json({ ok: true }, { headers: corsHeaders });
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
      return NextResponse.json({ ok: true }, { headers: corsHeaders });
    }

    if (text === "Готово ✅" && session.step === "AWAITING_MEDIA") {
      if (session.bloggerId && session.socialKey) {
        const blogger = await prisma.blogger.findUnique({ where: { id: session.bloggerId } });
        
        if (blogger) {
          const socials = (blogger.socials as Record<string, any>) || {};
          const currentSocial = socials[session.socialKey] || {};
          const nextTempData = { ...currentSocial };
          
          if (session.uploadedUrls && session.uploadedUrls.length > 0) {
            nextTempData.statsMedia = session.uploadedUrls;
          }
          
          await prisma.bloggerBotSession.update({
            where: { chatId: chatIdStr },
            data: { step: "EDIT_SOCIAL_FOLLOWERS", tempData: nextTempData },
          });

          await sendMessage(chatIdStr, `<b>Подписчики</b>\nТекущее: <i>${nextTempData.followers || "нет"}</i>\n\nВведите новые данные или нажмите "Пропустить ⏭":`, {
            keyboard: [[{ text: "Пропустить ⏭" }, { text: "Главное меню 🏠" }]],
            resize_keyboard: true
          });
        }
      }
      return NextResponse.json({ ok: true }, { headers: corsHeaders });
    }

    // 3. EDIT DETAILS FLOW
    if (session.step.startsWith("EDIT_DETAILS_")) {
      if (text === "Главное меню 🏠") return NextResponse.json({ ok: true }, { headers: corsHeaders });

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
        revalidatePath("/");
        
        await prisma.bloggerBotSession.update({
          where: { chatId: chatIdStr },
          data: { step: "START", bloggerId: null, tempData: null },
        });
        await sendMessage(chatIdStr, "✅ Описание блогера успешно обновлено на сайте!", { remove_keyboard: true });
      }
      return NextResponse.json({ ok: true }, { headers: corsHeaders });
    }

    // 4. EDIT SOCIAL FLOW
    if (session.step.startsWith("EDIT_SOCIAL_")) {
      if (text === "Главное меню 🏠") return NextResponse.json({ ok: true }, { headers: corsHeaders });

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
          revalidatePath("/");
        }
        
        // JUMP TO START
        await prisma.bloggerBotSession.update({
          where: { chatId: chatIdStr },
          data: { step: "START", bloggerId: null, socialKey: null, uploadedUrls: [], tempData: null },
        });

        await sendMessage(chatIdStr, `🎉 Успешно! Данные и статистика для соцсети сохранены.`, {
          remove_keyboard: true 
        });
      }
      return NextResponse.json({ ok: true }, { headers: corsHeaders });
    }
    // 4.5 EDIT PRICES FLOW
    if (session.step === "EDIT_PRICES_FLOW") {
      if (text === "Главное меню 🏠") return NextResponse.json({ ok: true }, { headers: corsHeaders });
      
      const tempData = session.tempData as Record<string, any>;
      const queue = tempData.queue;
      const currentIndex = tempData.currentIndex;
      
      if (text === "Назад ⬅️" && currentIndex > 0) {
        tempData.currentIndex = currentIndex - 1;
        await prisma.bloggerBotSession.update({
          where: { chatId: chatIdStr },
          data: { tempData },
        });
        const prevItem = queue[tempData.currentIndex];
        const currentPrice = tempData.prices[prevItem.platformKey]?.[prevItem.fieldKey];
        const priceStr = currentPrice ? `(сейчас = ${currentPrice})` : "(сейчас нету цены)";
        
        const keyboardRow = [{ text: "Пропустить ⏭" }];
        if (tempData.currentIndex > 0) keyboardRow.push({ text: "Назад ⬅️" });
        
        await sendMessage(chatIdStr, `<b>${prevItem.platformName}</b>\nУкажите цену за: <b>${prevItem.fieldLabel}</b>\n${priceStr}\n\nВведите цену или нажмите "Пропустить ⏭":`, {
          keyboard: [keyboardRow, [{ text: "Главное меню 🏠" }]],
          resize_keyboard: true
        });
        return NextResponse.json({ ok: true }, { headers: corsHeaders });
      }

      const currentItem = queue[currentIndex];
      if (!tempData.prices[currentItem.platformKey]) {
        tempData.prices[currentItem.platformKey] = {};
      }
      tempData.prices[currentItem.platformKey][currentItem.fieldKey] = text === "Пропустить ⏭" ? "-" : text;
      
      const nextIndex = currentIndex + 1;
      
      if (nextIndex < queue.length) {
        tempData.currentIndex = nextIndex;
        await prisma.bloggerBotSession.update({
          where: { chatId: chatIdStr },
          data: { tempData },
        });
        const nextItem = queue[nextIndex];
        const currentPrice = tempData.prices[nextItem.platformKey]?.[nextItem.fieldKey];
        const priceStr = currentPrice ? `(сейчас = ${currentPrice})` : "(сейчас нету цены)";

        const keyboardRow = [{ text: "Пропустить ⏭" }, { text: "Назад ⬅️" }];
        
        await sendMessage(chatIdStr, `<b>${nextItem.platformName}</b>\nУкажите цену за: <b>${nextItem.fieldLabel}</b>\n${priceStr}\n\nВведите цену или нажмите "Пропустить ⏭":`, {
          keyboard: [keyboardRow, [{ text: "Главное меню 🏠" }]],
          resize_keyboard: true
        });
      } else {
        // FINISHED! Save to DB.
        const blogger = await prisma.blogger.findUnique({ where: { id: session.bloggerId! } });
        const details = (blogger?.details as Record<string, any>) || {};
        details.prices = tempData.prices;
        
        await prisma.blogger.update({
          where: { id: session.bloggerId! },
          data: { details },
        });
        
        // Generate summary text
        let summary = `<b>${blogger?.name}</b>\n\n`;
        
        // Group by platformKey
        const platformsInQueue = Array.from(new Set(queue.map((q: any) => q.platformKey)));
        for (const pKey of platformsInQueue as string[]) {
          const basePlatform = pKey.split("_")[0];
          const pName = PLATFORM_NAMES[basePlatform] || basePlatform;
          const url = queue.find((q: any) => q.platformKey === pKey)?.url;
          summary += `<b>${pName}:</b> ${url}\n`;
          
          const fields = PRICING_FIELDS[basePlatform] || [];
          for (const f of fields) {
             const price = tempData.prices[pKey]?.[f.key];
             if (price) {
               let separator = " ";
               if (basePlatform === "vk") separator = " — ";
               if (basePlatform === "telegram") separator = ": ";
               summary += `${f.label}${separator}${price}\n`;
             }
          }
          summary += "\n";
        }
        
        await prisma.bloggerBotSession.update({
          where: { chatId: chatIdStr },
          data: { step: "START", bloggerId: null, tempData: null },
        });
        
        await sendMessage(chatIdStr, `✅ <b>Цены сохранены!</b>`, { remove_keyboard: true });
        await sendMessage(chatIdStr, summary);
        revalidatePath("/blogers");
        revalidatePath("/statistics");
        revalidatePath("/");
      }
      
      return NextResponse.json({ ok: true }, { headers: corsHeaders });
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
          [{ text: "📱 Обновить соцсети / статистику", callback_data: `action:socials` }],
          [{ text: "💰 Редактировать цены", callback_data: `action:prices` }]
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
      else if (data === "action:prices" && session.bloggerId) {
        const blogger = await prisma.blogger.findUnique({ where: { id: session.bloggerId } });
        const socials = (blogger?.socials as Record<string, any>) || {};
        const socialKeys = Object.keys(socials);

        if (socialKeys.length === 0) {
          await sendMessage(chatIdStr, "У этого блогера не добавлено ни одной соцсети. Сначала добавьте соцсети!");
        } else {
          // Build queue
          const queue: { platformKey: string, platformName: string, url: string, fieldKey: string, fieldLabel: string }[] = [];
          
          for (const key of socialKeys) {
             const basePlatform = key.split("_")[0];
             const fields = PRICING_FIELDS[basePlatform];
             if (fields && socials[key]?.url) {
               for (const f of fields) {
                 queue.push({
                   platformKey: key,
                   platformName: PLATFORM_NAMES[basePlatform] || basePlatform,
                   url: socials[key].url,
                   fieldKey: f.key,
                   fieldLabel: f.label
                 });
               }
             }
          }

          if (queue.length === 0) {
             await sendMessage(chatIdStr, "Нет соцсетей с заполненной ссылкой (URL). Сначала обновите ссылки на соцсети.");
          } else {
            const currentPrices = (blogger?.details as Record<string,any>)?.prices || {};
            await prisma.bloggerBotSession.update({
              where: { chatId: chatIdStr },
              data: { step: "EDIT_PRICES_FLOW", tempData: { queue, currentIndex: 0, prices: currentPrices } },
            });
            const first = queue[0];
            const currentPrice = currentPrices[first.platformKey]?.[first.fieldKey];
            const priceStr = currentPrice ? `(сейчас = ${currentPrice})` : "(сейчас нету цены)";
            
            await sendMessage(chatIdStr, `<b>${first.platformName}</b>\nУкажите цену за: <b>${first.fieldLabel}</b>\n${priceStr}\n\nВведите цену или нажмите "Пропустить ⏭":`, {
              keyboard: [[{ text: "Пропустить ⏭" }], [{ text: "Главное меню 🏠" }]],
              resize_keyboard: true
            });
          }
        }
      }
      else if (data.startsWith("social:") && session.bloggerId) {
        const socialKey = data.replace("social:", "");
        const blogger = await prisma.blogger.findUnique({ where: { id: session.bloggerId } });
        const socials = (blogger?.socials as Record<string,any>) || {};
        const currentSocial = socials[socialKey] || {};
        
        await prisma.bloggerBotSession.update({
          where: { chatId: chatIdStr },
          data: { step: "AWAITING_MEDIA", socialKey, tempData: currentSocial, uploadedUrls: [] },
        });

        await sendMessage(chatIdStr, "📸 <b>Скриншоты статистики</b>\n\nОтправьте новые фото/видео (они <b>полностью заменят</b> старые). \nЕсли хотите <b>оставить старые</b> фото — просто ничего не отправляйте и нажмите <b>Готово ✅</b>.", {
          keyboard: [[{ text: "Готово ✅" }, { text: "Главное меню 🏠" }]],
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
      return NextResponse.json({ ok: true }, { headers: corsHeaders });
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

    return NextResponse.json({ ok: true }, { headers: corsHeaders });
  } catch (error) {
    console.error("Telegram webhook error:", error);
    return NextResponse.json({ ok: true, error: "Handled Error" }, { headers: corsHeaders });
  }
}
