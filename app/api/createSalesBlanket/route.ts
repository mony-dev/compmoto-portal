import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import axios from "axios";

const prisma = new PrismaClient();

const NAV_URL = process.env.NAV_URL;
const COMPANY_ID = process.env.COMPANY_ID;
const NAV_BASIC_AUTH = process.env.NAV_BASIC_AUTH; // เช่น "Basic xxxxx"

if (!NAV_URL) throw new Error("Missing NAV_URL");
if (!COMPANY_ID) throw new Error("Missing COMPANY_ID");
if (!NAV_BASIC_AUTH) throw new Error("Missing NAV_BASIC_AUTH");

export async function POST(req: NextRequest) {
  try {
    const { customerNo, orderItems } = await req.json();

    if (!customerNo || !orderItems) {
      return NextResponse.json(
        { message: "customerNo & orderItems are required" },
        { status: 400 }
      );
    }

    // สร้าง blanketLines ตาม format ใหม่
    const blanketLines = orderItems.map((item: any) => ({
      itemNo: item.itemNo,
      qty: item.qty,
      unitPrice: item.unitPrice,
      blanketRemainQty: item.qty,
    }));

    const payload = {
      customerNo,
      paymentMethod: "TRANFER",
      blanketLines,
    };

    const url = `${NAV_URL}/companies(${COMPANY_ID})/api_CreateSalesBlankets`;

    const response = await axios.post(url, payload, {
      headers: {
        "Content-Type": "application/json",
        Authorization: NAV_BASIC_AUTH,
      },
    });

    console.log("✅ NAV Response:", response.data);

    return NextResponse.json(response.data);
  } catch (error: any) {
    console.error("CreateSalesBlanket Error:", error?.response?.data || error);
    return NextResponse.json(
      { message: "Failed to create blanket order", error: error?.message },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
