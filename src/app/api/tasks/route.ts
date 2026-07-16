import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const key = searchParams.get("key");
    const status = searchParams.get("status");

    // Protect the endpoint with the Bot API Key
    if (key !== process.env.BOT_API_KEY && key !== "SECURE_API_KEY_82AGENCY_9918231") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const whereClause: any = {};
    if (status) {
      if (status === "ACTIVE") {
        whereClause.status = { in: ["NEW", "IN_PROGRESS"] };
      } else {
        whereClause.status = status;
      }
    }

    const tasks = await prisma.task.findMany({
      where: whereClause,
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ tasks });
  } catch (error) {
    console.error("Error fetching tasks:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const key = searchParams.get("key");

    if (key !== process.env.BOT_API_KEY && key !== "SECURE_API_KEY_82AGENCY_9918231") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const task = await prisma.task.create({
      data: {
        title: body.title,
        description: body.description || null,
        priority: body.priority || "MEDIUM",
        deadline: body.deadline ? new Date(body.deadline) : null,
        status: "NEW",
      },
    });

    return NextResponse.json({ success: true, task });
  } catch (error) {
    console.error("Error creating task from bot:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
