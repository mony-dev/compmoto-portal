// scripts/auto-enqueue.mjs
import fs from "fs/promises";
import path from "path";

const STATUS_PATH = path.join(process.cwd(), "tmp", "sync-status.json");
const SIX_HOURS_MS = 6 * 60 * 60 * 1000;

function nowISO() {
  return new Date().toISOString();
}

async function readStatus() {
  try {
    return JSON.parse(await fs.readFile(STATUS_PATH, "utf-8"));
  } catch {
    return {
      status: "idle",
      queue: [],
      running: null,
      updatedAt: nowISO(),
      history: [],
      schedulers: {
        invoiceBundle: { lastQueuedAt: null },
      },
    };
  }
}

async function writeStatus(next) {
  await fs.mkdir(path.dirname(STATUS_PATH), { recursive: true });
  await fs.writeFile(STATUS_PATH, JSON.stringify(next, null, 2), "utf-8");
}

function toMs(iso) {
  if (!iso) return 0;
  const t = Date.parse(iso);
  return Number.isNaN(t) ? 0 : t;
}

function ensureArray(v) {
  return Array.isArray(v) ? v : [];
}

export async function autoEnqueueInvoiceBundle() {
  const status = await readStatus();

  // เตรียมโครง schedulers เผื่อยังไม่มี
  const schedulers = status.schedulers ?? {};
  const invoiceBundle = schedulers.invoiceBundle ?? { lastQueuedAt: null };

  const last = toMs(invoiceBundle.lastQueuedAt);
  const now = Date.now();

  // ยังไม่ครบ 2 ชม. -> ไม่ทำอะไร
  if (last && now - last < SIX_HOURS_MS) return { changed: false };

  const queue = ensureArray(status.queue);
  const jobsToAdd = ["invoice", "history", "creditMemo"];

  // กันซ้ำ: ถ้ามีอยู่แล้วในคิวก็ไม่เพิ่มซ้ำ
  const nextQueue = [...queue];
  for (const j of jobsToAdd) {
    if (!nextQueue.includes(j)) nextQueue.push(j);
  }

  // ถ้าไม่ได้เพิ่มอะไรเลย ก็อัปเดต lastQueuedAt ไหม?
  // แนะนำ: อัปเดตเฉพาะตอน "มีการ enqueue ใหม่จริง"
  const changed = nextQueue.length !== queue.length;
  if (!changed) return { changed: false };

  await writeStatus({
    ...status,
    status: status.status === "failed" ? "idle" : status.status,
    queue: nextQueue,
    updatedAt: nowISO(),
    schedulers: {
      ...schedulers,
      invoiceBundle: { lastQueuedAt: nowISO() },
    },
    history: status.history ?? [],
  });

  return { changed: true };
}
