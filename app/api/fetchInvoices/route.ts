import { NextResponse } from "next/server";
import { exec } from "child_process";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const page = 1;
  const pageSize = 50;

  try {
    exec('node lib/web/utils/fetchInvoice.mjs', (error, stdout, stderr) => {
      if (error) {
        console.error(`exec error: ${error}`);
        return NextResponse.json(error);
      }
    });

    return NextResponse.json({ message: "Processing completed" });
  } catch (error) {
    return NextResponse.json({ error: "Failed to process invoices" });
  } 
}
