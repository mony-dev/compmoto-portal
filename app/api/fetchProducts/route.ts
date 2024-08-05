import { exec } from 'child_process';
import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";
const prisma = new PrismaClient();

export async function GET(request: Request) {
    console.log("api")
  try {
    exec('node lib/web/utils/fetchProducts.mjs', (error, stdout, stderr) => {
        if (error) {
          console.error(`exec error: ${error}`);
          return NextResponse.json(error);
        }
      });
    return NextResponse.json("200");
  } catch (error) {
    return NextResponse.json(error);
  } finally {
    await prisma.$disconnect();
  }
}