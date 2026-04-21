import { NextResponse } from "next/server";

async function fetchNavCustomerInfo(custNo: string) {
  try {
    const NAV_URL = process.env.NAV_URL!;
    const NAV_BASIC_AUTH = process.env.NAV_BASIC_AUTH!;
    const COMPANY_ID = process.env.COMPANY_ID!;

    const filter = encodeURIComponent(`CustNo eq '${custNo}'`);
    const url = `${NAV_URL}/companies(${COMPANY_ID})/api_MasterCustomerDetails?$filter=${filter}`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: NAV_BASIC_AUTH,
      },
      signal: controller.signal,
      cache: "no-store",
    });
    clearTimeout(timeoutId);

    if (!response.ok) {
      console.error(
        "NAV MasterCustomerDetails error:",
        response.status,
        await response.text()
      );
      return null;
    }

    const data = await response.json();
    console.log(data)

    return data?.value?.[0] ?? null;
  } catch (error) {
    console.error("Fetch NAV error:", error);
    return null;
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const custNo = searchParams.get("custNo");

    if (!custNo) {
      return NextResponse.json(
        { message: "custNo is required" },
        { status: 400 }
      );
    }

    const customerInfo = await fetchNavCustomerInfo(custNo);

    if (!customerInfo) {
      return NextResponse.json(
        { message: "Customer info not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        creditLimitLCY: customerInfo.CreditLimitLCY ?? 0,
        BalanceDueLCY: customerInfo.BalanceDueLCY ?? 0,
        raw: customerInfo,
      },
      {
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
          Pragma: "no-cache",
          Expires: "0",
        },
      }
    );
  } catch (error) {
    console.error("customer-credit api error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}