// import { NextResponse } from "next/server";
// import { exec } from "child_process";
// import { promisify } from "util";
// import { v4 as uuidv4 } from "uuid";

// const execPromise = promisify(exec);

// interface JobStatusMap {
//   [key: string]: string; 
// }

// let jobStatusMap: JobStatusMap = {}; 

// export async function POST() {
//   const jobId = uuidv4(); // Generate a unique job ID

//   // Immediately return jobId and start processing in the background
//   process.nextTick(async () => {
//     try {
//       jobStatusMap[jobId] = "in-progress"; // Mark as in-progress
      
//       // Execute the fetchInvoice script
//       const invoiceResult = await execPromise('node lib/web/utils/fetchInvoice.mjs');
//       console.log(`Invoice script output: ${invoiceResult.stdout}`);
    
//       // Execute the fetchHistory script
//       const historyResult = await execPromise('node lib/web/utils/fetchHistory.mjs');
//       console.log(`History script output: ${historyResult.stdout}`);
    
//       // Execute the fetchCreditMemo script
//       const creditMemoResult = await execPromise('node lib/web/utils/fetchCreditMemo.mjs');
//       console.log(`CreditMemo script output: ${creditMemoResult.stdout}`);
    
//       // Mark job as completed
//       jobStatusMap[jobId] = "completed";
//     } catch (error) {
//       console.error("Error processing:", error);
//       jobStatusMap[jobId] = "failed"; // Mark job as failed in case of error
//     }
//   });

//   return NextResponse.json({ jobId });
// }

// export async function GET(request: Request) {
//   const { searchParams } = new URL(request.url);
//   const jobId = searchParams.get("jobId");
//   if (!jobId) {
//     return NextResponse.json({ error: "Invalid or unknown job ID" }, { status: 400 });
//   }

//   // Lookup the job status based on jobId (this could be an in-memory store, a DB, etc.)
//   let jobStatus = jobStatusMap[jobId]; // Retrieve from your job tracking logic

//   if (!jobStatus) {
//     jobStatus = "completed"
//   }

//   return NextResponse.json({ status: jobStatus });
// }
import { NextResponse } from "next/server";
import fs from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";

const STATUS_PATH = path.join(process.cwd(), "tmp", "sync-status.json");

type SyncStatusFile = {
  status: "idle" | "in-progress" | "failed";
  queue: string[];
  running: null | { job: string; startedAt: string };
  updatedAt: string;
  history: Array<{ job: string; status: "completed" | "failed"; at: string; message?: string }>;
  // optional: เก็บ request batch id เฉย ๆ (ไม่จำเป็น แต่ช่วย UI)
  lastRequestId?: string;
};

function now() {
  return new Date().toISOString();
}

async function readStatus(): Promise<SyncStatusFile> {
  try {
    return JSON.parse(await fs.readFile(STATUS_PATH, "utf8"));
  } catch {
    return {
      status: "idle",
      queue: [],
      running: null,
      updatedAt: now(),
      history: [],
    };
  }
}

async function writeStatus(next: SyncStatusFile) {
  await fs.mkdir(path.dirname(STATUS_PATH), { recursive: true });
  await fs.writeFile(STATUS_PATH, JSON.stringify(next, null, 2), "utf8");
}

function enqueueUnique(queue: string[], jobs: string[]) {
  const set = new Set(queue);
  for (const j of jobs) set.add(j);
  return Array.from(set);
}

export async function POST() {
  const current = await readStatus();

  const requestId = randomUUID();
  const jobsToQueue = ["invoice", "history", "creditMemo"]; // ✅ 3 งานหลัก

  const next: SyncStatusFile = {
    ...current,
    // ✅ กันกดรัว: ใส่เฉพาะงานที่ยังไม่มีใน queue
    queue: enqueueUnique(current.queue ?? [], jobsToQueue),
    updatedAt: now(),
    // ถ้าเคย failed ให้ reset กลับ idle เพื่อให้ worker หยิบงานต่อได้
    status: current.status === "failed" ? "idle" : current.status,
    lastRequestId: requestId,
  };

  await writeStatus(next);

  return NextResponse.json(
    {
      requestId,
      queued: jobsToQueue,
      queue: next.queue,
      status: next.status,
      updatedAt: next.updatedAt,
    },
    { status: 200 }
  );
}

export async function GET() {
  const status = await readStatus();
  return NextResponse.json(status, { status: 200 });
}
