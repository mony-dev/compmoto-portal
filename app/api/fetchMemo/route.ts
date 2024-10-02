import { NextResponse } from "next/server";
import { exec } from "child_process";
export async function POST() {
  try {

    exec('node lib/web/utils/fetchCreditMemo.mjs', (error, stdout, stderr) => {
      if (error) {
        console.error(`exec error: ${error}`);
        return NextResponse.json(error);
      }
    });
    
    return NextResponse.json({ message: "Processing completed" });
  } catch (error) {
    console.error("Error processing invoices:", error);
    return NextResponse.json({ error: "Failed to process invoices" });
  }
}


