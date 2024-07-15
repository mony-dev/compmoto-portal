import { PrismaClient } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
const prisma = new PrismaClient();

export async function GET(request: Request, res: NextResponse) {
    const ipAddress = request.headers.get('x-forwarded-for')
    return NextResponse.json(ipAddress);
}

