import { NextRequest, NextResponse } from "next/server";
import axios from "axios";

const NAV_URL = process.env.NAV_URL;
const COMPANY_ID = process.env.COMPANY_ID;
const NAV_BASIC_AUTH = process.env.NAV_BASIC_AUTH; 

if (!NAV_URL) throw new Error("Missing NAV_URL");
if (!COMPANY_ID) throw new Error("Missing COMPANY_ID");
if (!NAV_BASIC_AUTH) throw new Error("Missing NAV_BASIC_AUTH");

export async function POST(req: NextRequest) {
  try {
    const { customerNo, paymentMethod, externalDoc, createBy, orderItems } =
      await req.json();

    if (!customerNo || !orderItems) {
      return NextResponse.json(
        { message: "customerNo & orderItems are required" },
        { status: 400 }
      );
    }

    // สร้าง payload ตามฟอร์แมตใหม่
    const payload = {
      customerNo,
      paymentMethod: paymentMethod || "TRANFER",
      externalDoc: externalDoc || "",
      createBy: createBy || "",
      lines: orderItems.map((item: any) => ({
        itemNo: item.itemNo,
        qty: item.qty,
        unitPrice: item.unitPrice,
        lineDiscountP: item.lineDiscount,
        lineTyreP: item.tyreDiscount,
        tyreYear: String(item.year ?? "0"),
      })),
    };

    const url = `${NAV_URL}/companies(${COMPANY_ID})/api_CreateSalesQuotes`;

    const response = await axios.post(url, payload, {
      headers: {
        "Content-Type": "application/json",
        Authorization: NAV_BASIC_AUTH,
      },
    });

    console.log("NAV Response:", response.data);

    return NextResponse.json(response.data);
  } catch (error: any) {
    console.error("CreateSalesQuote Error:", error?.response?.data || error);

    return NextResponse.json(
      {
        message: "Failed to create sales quote",
        error: error?.response?.data || error?.message,
      },
      { status: 500 }
    );
  }
}
