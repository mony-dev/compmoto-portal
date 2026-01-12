import { PrismaClient } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import bcrypt from 'bcrypt';


/**
 * ✅ Prisma singleton (Next.js best practice)
 */
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };
const prisma = globalForPrisma.prisma ?? new PrismaClient();
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

// Provider API
const JWT_SECRET = process.env.JWT_SECRET || "nav-secret-key";

function verifyToken(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return null;
  }
  const token = authHeader.split(" ")[1];
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch {
    return null;
  }
}

type NavUserPayload = {
  custNo: string;
  name?: string;
  phoneNumber?: string;
  gender?: string;
  vatNo?: string;

  custAddress?: string;
  shipToAddress?: string;

  paymentTerms?: string;
  creditPoint?: number;
  balanceLCY?: number;
  rewardPoint?: number;

  contactName?: string;
  custPriceGroup?: string;
  customerGroupName?: string;
};

export async function POST(request: NextRequest) {
  const tokenPayload = verifyToken(request);
  if (!tokenPayload) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    
    // ---------- Body ----------
    const body = (await request.json()) as NavUserPayload;

    const custNo = String(body.custNo || '').trim();
    if (!custNo) {
      return NextResponse.json({ message: 'custNo is required' }, { status: 400 });
    }

    const email = `${custNo}@compmoto.com`;

    let customerGroupId: number | undefined = undefined;
    const groupName = String(body.customerGroupName || '').trim();
    if (groupName) {
      const group = await prisma.customerGroup.upsert({
        where: { name: groupName },
        create: { name: groupName },
        update: {}, 
        select: { id: true },
      });
      customerGroupId = group.id;
    }

    
    const hashedPassword = await bcrypt.hash('password', 10);

    const user = await prisma.user.upsert({
      where: { custNo },
      create: {
        custNo,
        email,
        name: body.name ?? '',
        phoneNumber: body.phoneNumber ?? '',
        gender: body.gender ?? '',
        vatNo: body.vatNo ?? '',
        custAddress: body.custAddress ?? '',
        shipToAddress: body.shipToAddress ?? '',
        paymentTerms: body.paymentTerms ?? '',
        creditPoint: Number(body.creditPoint ?? 0),
        balanceLCY: Number(body.balanceLCY ?? 0),
        rewardPoint: Number(body.rewardPoint ?? 0),
        contactName: body.contactName ?? '',
        custPriceGroup: body.custPriceGroup ?? '',
        customerGroupId,
        encryptedPassword: hashedPassword,
        role: 'USER',
      },
      update: {
        email, 
        name: body.name ?? '',
        phoneNumber: body.phoneNumber ?? '',
        gender: body.gender ?? '',
        vatNo: body.vatNo ?? '',
        custAddress: body.custAddress ?? '',
        shipToAddress: body.shipToAddress ?? '',
        paymentTerms: body.paymentTerms ?? '',
        creditPoint: Number(body.creditPoint ?? 0),
        balanceLCY: Number(body.balanceLCY ?? 0),
        rewardPoint: Number(body.rewardPoint ?? 0),
        contactName: body.contactName ?? '',
        custPriceGroup: body.custPriceGroup ?? '',
        customerGroupId,
      },
      select: {
        id: true,
        custNo: true,
        email: true,
        name: true,
        customerGroupId: true,
      },
    });

    return NextResponse.json(
      {
        message: 'success',
        upserted: true,
        user,
      },
      { status: 200 },
    );

    // return NextResponse.json({ invoice: "success" });

  } catch (error) {
    return NextResponse.json(error);
  } finally {
    await prisma.$disconnect();
  }
}

export async function PATCH(request: NextRequest) {
  const tokenPayload = verifyToken(request);
  if (!tokenPayload) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = (await request.json()) as NavUserPayload;

    const custNo = String(body.custNo || "").trim();
    if (!custNo) {
      return NextResponse.json({ message: "custNo is required" }, { status: 400 });
    }

    // find user first
    const existing = await prisma.user.findUnique({
      where: { custNo },
      select: { id: true, custNo: true },
    });

    if (!existing) {
      return NextResponse.json({ message: "User not found", custNo }, { status: 404 });
    }

    // if groupName → upsert group and take id to save
    let customerGroupId: number | undefined = undefined;
    const groupName = String(body.customerGroupName || "").trim();
    if (groupName) {
      const group = await prisma.customerGroup.upsert({
        where: { name: groupName },
        create: { name: groupName },
        update: {},
        select: { id: true },
      });
      customerGroupId = group.id;
    }

    // create updateData only from body
    const updateData: any = {};

    if (body.name !== undefined) updateData.name = body.name;
    if (body.phoneNumber !== undefined) updateData.phoneNumber = body.phoneNumber;
    if (body.gender !== undefined) updateData.gender = body.gender;
    if (body.vatNo !== undefined) updateData.vatNo = body.vatNo;

    if (body.custAddress !== undefined) updateData.custAddress = body.custAddress;
    if (body.shipToAddress !== undefined) updateData.shipToAddress = body.shipToAddress;

    if (body.paymentTerms !== undefined) updateData.paymentTerms = body.paymentTerms;
    if (body.creditPoint !== undefined) updateData.creditPoint = Number(body.creditPoint);
    if (body.balanceLCY !== undefined) updateData.balanceLCY = Number(body.balanceLCY);
    if (body.rewardPoint !== undefined) updateData.rewardPoint = Number(body.rewardPoint);

    if (body.contactName !== undefined) updateData.contactName = body.contactName;
    if (body.custPriceGroup !== undefined) updateData.custPriceGroup = body.custPriceGroup;

    if (customerGroupId !== undefined) updateData.customerGroupId = customerGroupId;

    // protect only pass custNo 
    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { message: "No fields to update", custNo },
        { status: 400 }
      );
    }

    const updated = await prisma.user.update({
      where: { custNo },
      data: updateData,
      select: {
        id: true,
        custNo: true,
        email: true,
        name: true,
        phoneNumber: true,
        shipToAddress: true,
        customerGroupId: true,
      },
    });

    return NextResponse.json({ message: "success", user: updated }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json(
      { message: "Internal Server Error", error: error?.message ?? String(error) },
      { status: 500 }
    );
  }
}
