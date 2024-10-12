import { NextResponse } from "next/server";
import { exec } from "child_process";
import { promisify } from "util";

const execPromise = promisify(exec);

export async function POST() {
  try {
    // Execute the fetchInvoice script first
    const invoiceResult = await execPromise('node lib/web/utils/fetchInvoice.mjs');
    console.log(`Invoice script output: ${invoiceResult.stdout}`);
    
    // Execute the fetchHistory script after fetchInvoice is complete
    const historyResult = await execPromise('node lib/web/utils/fetchHistory.mjs');
    console.log(`History script output: ${historyResult.stdout}`);
    
    // Execute the fetchCreditMemo script after fetchHistory is complete
    const creditMemoResult = await execPromise('node lib/web/utils/fetchCreditMemo.mjs');
    console.log(`CreditMemo script output: ${creditMemoResult.stdout}`);
    
    // Return response after all scripts have completed
    return NextResponse.json({ message: "Processing completed" });
  } catch (error) {
    console.error("Error processing:", error);
    return NextResponse.json({ error: "Failed to process" });
  }
}
