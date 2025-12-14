import { NextResponse } from "next/server";
import fs from "node:fs/promises";
import path from "node:path";

const STATUS_PATH = path.join(process.cwd(), "tmp", "sync-status.json");

type SyncStatus = {
  status: "idle" | "in-progress" | "failed";
  queue: string[];
  running: null | { job: string; startedAt: string };
  updatedAt: string;
  history?: any[];
};

async function readStatus(): Promise<SyncStatus> {
  try {
    return JSON.parse(await fs.readFile(STATUS_PATH, "utf8"));
  } catch {
    return {
      status: "idle",
      queue: [],
      running: null,
      updatedAt: new Date().toISOString(),
      history: [],
    };
  }
}

async function writeStatus(next: SyncStatus) {
  await fs.mkdir(path.dirname(STATUS_PATH), { recursive: true });
  await fs.writeFile(STATUS_PATH, JSON.stringify(next, null, 2), "utf8");
}

export async function POST() {
  const current = await readStatus();

  // ✅ กันกดรัว: ถ้ามีในคิวแล้วไม่ต้องใส่ซ้ำ
  if (current.queue.includes("groupType")) {
    return NextResponse.json(current, { status: 200 });
  }

  const next: SyncStatus = {
    ...current,
    queue: [...current.queue, "groupType"],
    updatedAt: new Date().toISOString(),
    status: current.status === "failed" ? "idle" : current.status, // reset failed -> idle
  };

  await writeStatus(next);
  return NextResponse.json(next, { status: 200 });
}

export async function GET() {
  const status = await readStatus();
  return NextResponse.json(status, { status: 200 });
}
