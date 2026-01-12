import { PrismaClient } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";

/**
 * ✅ Prisma singleton
 */
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };
const prisma = globalForPrisma.prisma ?? new PrismaClient();
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

const JWT_SECRET = process.env.JWT_SECRET || "nav-secret-key";

function verifyToken(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) return null;

  const token = authHeader.split(" ")[1];
  try {
    return jwt.verify(token, JWT_SECRET) as any;
  } catch {
    return null;
  }
}

function stringToFloat(val: unknown) {
  if (val === null || val === undefined) return 0;
  const s = String(val).trim();
  if (!s) return 0;
  const n = Number(s.replace(/,/g, ""));
  return Number.isFinite(n) ? n : 0;
}

function parsePostDate(dateStr: unknown) {
  const s = String(dateStr || "").trim();
  if (!s) return null;

  // รองรับ "2024-08-15" หรือ ISO string
  const d = new Date(s);
  if (Number.isNaN(d.getTime())) return null;
  return d;
}

type NavCreditMemoPayload = {
  custNo: string;
  documentNo: string;
  postDate: string; // "2024-08-15"
  totalAmount?: string | number;
  amountIncludingVAT?: string | number;
};

export async function POST(request: NextRequest) {
  const tokenPayload = verifyToken(request);
  if (!tokenPayload) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = (await request.json()) as NavCreditMemoPayload;

    const custNo = String(body.custNo || "").trim();
    const documentNo = String(body.documentNo || "").trim();
    const postDate = parsePostDate(body.postDate);

    if (!custNo) {
      return NextResponse.json({ message: "custNo is required" }, { status: 400 });
    }
    if (!documentNo) {
      return NextResponse.json({ message: "documentNo is required" }, { status: 400 });
    }
    if (!postDate) {
      return NextResponse.json({ message: "postDate is invalid" }, { status: 400 });
    }

    // หา user จาก custNo
    const user = await prisma.user.findFirst({
      where: { custNo, role: "USER" },
      select: { id: true },
    });

    if (!user) {
      return NextResponse.json(
        { message: "User not found for custNo", custNo },
        { status: 404 },
      );
    }

    const totalAmount = stringToFloat(body.totalAmount);
    const amountIncludingVAT = stringToFloat(body.amountIncludingVAT);

    // idempotent: ถ้ามี documentNo แล้วให้ถือว่าสำเร็จ (กัน NAV retry)
    const existing = await prisma.memoCredit.findUnique({
      where: { documentNo },
      select: { id: true, documentNo: true },
    });

    if (existing) {
      return NextResponse.json(
        { message: "success", action: "ignored_duplicate", documentNo },
        { status: 200 },
      );
    }

    const created = await prisma.memoCredit.create({
      data: {
        userId: user.id,
        documentNo,
        totalAmount,
        amountIncludingVAT,
        date: postDate,
      },
      select: {
        id: true,
        documentNo: true,
        userId: true,
        totalAmount: true,
        amountIncludingVAT: true,
        date: true,
      },
    });

    return NextResponse.json(
      { message: "success", action: "created", creditMemo: created },
      { status: 200 },
    );
  } catch (error: any) {
    // ถ้ามี unique แล้วชน (P2002) ให้ถือว่า duplicate
    if (error?.code === "P2002") {
      return NextResponse.json(
        { message: "success", action: "ignored_duplicate" },
        { status: 200 },
      );
    }

    return NextResponse.json(
      { message: "Internal Server Error", error: error?.message ?? String(error) },
      { status: 500 },
    );
  }
}
