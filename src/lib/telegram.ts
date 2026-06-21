import { prisma } from "@/lib/prisma";

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;

export async function broadcastLeadNotification(message: string) {
  if (!TELEGRAM_BOT_TOKEN) {
    console.warn("TELEGRAM_BOT_TOKEN is not set. Cannot send notification.");
    return;
  }

  try {
    const subscribers = await prisma.telegramSubscriber.findMany();
    
    if (subscribers.length === 0) {
      console.log("No telegram subscribers found.");
      return;
    }

    const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;

    const promises = subscribers.map(sub => 
      fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: sub.chatId,
          text: message,
          parse_mode: "HTML",
        }),
      }).catch(err => console.error(`Failed to send to ${sub.chatId}:`, err))
    );

    await Promise.allSettled(promises);
  } catch (error) {
    console.error("Error in broadcastLeadNotification:", error);
  }
}
