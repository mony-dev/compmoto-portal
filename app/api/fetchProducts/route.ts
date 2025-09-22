import { exec } from 'child_process';
import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";
const prisma = new PrismaClient();
import path from 'path'
import { promisify } from 'util'

const execPromise = promisify(exec)
export async function GET(request: Request) {
  try {
    const fetchProduct = path.resolve(process.cwd(), 'lib/web/utils/fetchProducts.mjs')

    const { stdout: hOut } = await execPromise(`node ${fetchProduct}`)
    console.log("fetchProducts.mjs output:", hOut)


    // exec('node lib/web/utils/fetchProducts.mjs', (error, stdout, stderr) => {
    //     if (error) {
    //       console.error(`exec error: ${error}`);
    //       return NextResponse.json(error);
    //     }
    //   });
    return NextResponse.json("200");
  } catch (error) {
    return NextResponse.json(error);
  } finally {
    await prisma.$disconnect();
  }
}