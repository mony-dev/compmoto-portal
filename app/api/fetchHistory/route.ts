import { NextResponse } from "next/server";
import { exec } from "child_process";
import { promisify } from "util";
import { v4 as uuidv4 } from "uuid";

const execPromise = promisify(exec);

interface JobStatusMap {
  [key: string]: string; 
}

let jobStatusMap: JobStatusMap = {}; 

export async function POST() {
  const jobId = uuidv4(); // Generate a unique job ID

  // Immediately return jobId and start processing in the background
  process.nextTick(async () => {
    try {
      jobStatusMap[jobId] = "in-progress"; // Mark as in-progress
      
      // Execute the fetchInvoice script
      const invoiceResult = await execPromise('node lib/web/utils/fetchInvoice.mjs');
      console.log(`Invoice script output: ${invoiceResult.stdout}`);
    
      // Execute the fetchHistory script
      const historyResult = await execPromise('node lib/web/utils/fetchHistory.mjs');
      console.log(`History script output: ${historyResult.stdout}`);
    
      // Execute the fetchCreditMemo script
      const creditMemoResult = await execPromise('node lib/web/utils/fetchCreditMemo.mjs');
      console.log(`CreditMemo script output: ${creditMemoResult.stdout}`);
    
      // Mark job as completed
      jobStatusMap[jobId] = "completed";
    } catch (error) {
      console.error("Error processing:", error);
      jobStatusMap[jobId] = "failed"; // Mark job as failed in case of error
    }
  });

  return NextResponse.json({ jobId });
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const jobId = searchParams.get("jobId");
  if (!jobId) {
    return NextResponse.json({ error: "Invalid or unknown job ID" }, { status: 400 });
  }

  // Lookup the job status based on jobId (this could be an in-memory store, a DB, etc.)
  let jobStatus = jobStatusMap[jobId]; // Retrieve from your job tracking logic

  if (!jobStatus) {
    jobStatus = "completed"
  }

  return NextResponse.json({ status: jobStatus });
}