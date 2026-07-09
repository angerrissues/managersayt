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

    // Собираем все уникальные соцсети по всем блогерам, чтобы сформировать колонки
    const uniqueNetworks = new Set<string>();
    bloggers.forEach(blogger => {
      const socials = (blogger.socials as any) || {};
      Object.keys(socials).forEach(key => {
        const prefix = key.split('_')[0]; // "tiktok", "instagram" etc.
        uniqueNetworks.add(prefix);
      });
    });
    
    // Сортируем соцсети в понятном порядке
    const standardOrder = ["tiktok", "vk", "instagram", "youtube", "telegram"];
    const platforms = Array.from(uniqueNetworks).sort((a, b) => {
      const idxA = standardOrder.indexOf(a);
      const idxB = standardOrder.indexOf(b);
      if (idxA !== -1 && idxB !== -1) return idxA - idxB;
      if (idxA !== -1) return -1;
      if (idxB !== -1) return 1;
      return a.localeCompare(b);
    });

    // Формируем заголовки: Блогер | платформы... | Статистика | Цена
    const headers = ["блогер", ...platforms.map(p => {
      if (p === 'vk') return 'VK';
      if (p === 'youtube') return 'YouTube';
      if (p === 'tiktok') return 'TikTok';
      return p.charAt(0).toUpperCase() + p.slice(1);
    }), "статистика", "цена"];

    const rows = bloggers.map(blogger => {
      const socials = (blogger.socials as any) || {};
      
      const row: string[] = [blogger.name || ""];

      // Ссылки на каждую платформу
      platforms.forEach(platform => {
        const keys = Object.keys(socials).filter(k => k.startsWith(platform));
        const urls = keys.map(k => socials[k].url).filter(Boolean).join("\n");
        row.push(urls);
      });

      // Статистика только из TikTok
      const tiktokKeys = Object.keys(socials).filter(k => k.startsWith("tiktok"));
      const statsMedia: string[] = [];
      tiktokKeys.forEach(k => {
        const media = socials[k].statsMedia;
        if (Array.isArray(media)) {
          statsMedia.push(...media);
        }
      });
      const statsUrl = statsMedia.join("\n");
      
      row.push(statsUrl); // статистика
      row.push("?");      // цена
      
      return row;
    });

    const values = [headers, ...rows];

    // Очищаем текущий лист
    await sheets.spreadsheets.values.clear({
      spreadsheetId: sheetId,
      range: "A1:Z10000",
    });

    // Записываем новые данные
    await sheets.spreadsheets.values.update({
      spreadsheetId: sheetId,
      range: "A1",
      valueInputOption: "RAW",
      requestBody: {
        values,
      },
    });

    return NextResponse.json({ success: true, count: bloggers.length });
  } catch (error: any) {
    console.error("Export to sheets error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
