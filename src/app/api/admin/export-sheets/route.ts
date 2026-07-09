import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { google } from "googleapis";

const prisma = new PrismaClient();

export async function POST() {
  try {
    const sheetId = process.env.GOOGLE_SHEET_ID;
    const clientEmail = process.env.GOOGLE_CLIENT_EMAIL;
    const privateKey = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n');

    if (!sheetId || !clientEmail || !privateKey) {
      return NextResponse.json(
        { error: "Google Sheets credentials are not configured in environment variables." },
        { status: 500 }
      );
    }

    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: clientEmail,
        private_key: privateKey,
      },
      scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    });

    const sheets = google.sheets({ version: "v4", auth });

    // Получаем блогеров
    const bloggers = await prisma.blogger.findMany({
      orderBy: { createdAt: 'desc' }
    });

    // Фиксированные платформы по запросу: только TikTok и VK
    const platforms = ["tiktok", "vk"];

    // Найдем максимальное количество ссылок статистики, чтобы создать нужное количество колонок
    let maxStatsCount = 1;
    bloggers.forEach(blogger => {
      const socials = (blogger.socials as any) || {};
      const tiktokKeys = Object.keys(socials).filter(k => k.startsWith("tiktok"));
      let statsCount = 0;
      tiktokKeys.forEach(k => {
        const media = socials[k].statsMedia;
        if (Array.isArray(media)) {
          statsCount += media.length;
        }
      });
      if (statsCount > maxStatsCount) {
        maxStatsCount = statsCount;
      }
    });

    // Формируем заголовки: Блогер | TikTok | VK | Цена | Статистика 1 | Статистика 2 ...
    const headers = ["блогер", "TikTok", "VK", "цена"];
    for (let i = 1; i <= maxStatsCount; i++) {
      headers.push(`статистика ${i}`);
    }

    const rows = bloggers.map(blogger => {
      const socials = (blogger.socials as any) || {};
      
      const row: string[] = [blogger.name || ""];

      // Ссылки на каждую платформу (TikTok, VK)
      // Если ссылок несколько, Google Таблицы не сделают их все кликабельными в одной ячейке, 
      // но обычно аккаунт один. Соединяем через \n
      platforms.forEach(platform => {
        const keys = Object.keys(socials).filter(k => k.startsWith(platform));
        const urls = keys.map(k => socials[k].url).filter(Boolean).join("\n");
        row.push(urls);
      });

      row.push("?"); // цена

      // Статистика только из TikTok
      const tiktokKeys = Object.keys(socials).filter(k => k.startsWith("tiktok"));
      const statsMedia: string[] = [];
      tiktokKeys.forEach(k => {
        const media = socials[k].statsMedia;
        if (Array.isArray(media)) {
          statsMedia.push(...media);
        }
      });
      
      // Добавляем каждую ссылку статистики в отдельную колонку, чтобы они были кликабельными
      for (let i = 0; i < maxStatsCount; i++) {
        row.push(statsMedia[i] || "");
      }
      
      return row;
    });

    const values = [headers, ...rows];

    // Очищаем текущий лист
    await sheets.spreadsheets.values.clear({
      spreadsheetId: sheetId,
      range: "A1:Z10000",
    });

    // Записываем новые данные (USER_ENTERED парсит ссылки как кликабельные URL)
    await sheets.spreadsheets.values.update({
      spreadsheetId: sheetId,
      range: "A1",
      valueInputOption: "USER_ENTERED",
      requestBody: {
        values,
      },
    });

    // Применяем форматирование "Обрезка" (CLIP), чтобы длинные ссылки не вылезали за края ячеек
    try {
      const spreadsheet = await sheets.spreadsheets.get({ spreadsheetId: sheetId });
      const firstSheetId = spreadsheet.data.sheets?.[0]?.properties?.sheetId;
      
      if (firstSheetId !== undefined) {
        await sheets.spreadsheets.batchUpdate({
          spreadsheetId: sheetId,
          requestBody: {
            requests: [
              {
                repeatCell: {
                  range: {
                    sheetId: firstSheetId,
                  },
                  cell: {
                    userEnteredFormat: {
                      wrapStrategy: "CLIP"
                    }
                  },
                  fields: "userEnteredFormat.wrapStrategy"
                }
              }
            ]
          }
        });
      }
    } catch (formatError) {
      console.error("Error applying wrapStrategy:", formatError);
    }

    return NextResponse.json({ success: true, count: bloggers.length });
  } catch (error: any) {
    console.error("Export to sheets error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
