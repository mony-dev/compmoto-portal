import { execSync } from 'child_process';
import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";
const prisma = new PrismaClient();

export async function GET(request: Request) {
  try {
    // Execute the script synchronously
    const result = execSync('node lib/web/utils/fetchInvoice.mjs');
    return NextResponse.json("200");
  } catch (error) {
    console.error(`execSync error: ${error}`);
    return NextResponse.json(error);
  } finally {
    await prisma.$disconnect();
  }
}