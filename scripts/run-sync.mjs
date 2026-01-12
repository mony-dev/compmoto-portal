import fs from "fs/promises";
import path from "path";
import { exec } from "child_process";
import { promisify } from "util";
import { autoEnqueueInvoiceBundle } from "./auto-enqueue.mjs";

const execPromise = promisify(exec);
const STATUS_PATH = path.join(process.cwd(), "tmp", "sync-status.json");

// ✅ map ชื่องาน -> คำสั่งที่ต้องรัน
const JOBS = {
  invoice: "node lib/web/utils/fetchInvoice.mjs",
  history: "node lib/web/utils/fetchHistory.mjs",
  brands: "node lib/web/utils/fetchBrands.mjs",
  comrates: "node lib/web/utils/fetchComrates.mjs",
  family: "node lib/web/utils/fetchFamily.mjs",
  groupType: "node lib/web/utils/fetchGroupType.mjs",
  productGroup: "node lib/web/utils/fetchProductGroups.mjs",
  rim: "node lib/web/utils/fetchRims.mjs",
  size: "node lib/web/utils/fetchSizes.mjs",
  products: "node lib/web/utils/fetchProducts.mjs",
};

function now() {
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
      updatedAt: now(),
      history: [],
    };
  }
}

async function writeStatus(next) {
  await fs.mkdir(path.dirname(STATUS_PATH), { recursive: true });
  await fs.writeFile(STATUS_PATH, JSON.stringify(next, null, 2), "utf-8");
}

async function run(cmd) {
  const { stdout, stderr } = await execPromise(cmd, { timeout: 1000 * 60 * 60 }); // 1 ชม.
  if (stdout) console.log(stdout);
  if (stderr) console.error(stderr);
}

async function main() {
  // ✅ auto enqueue ทุก 2 ชม.
  try {
    await autoEnqueueInvoiceBundle();
  } catch (e) {
    console.error("[sync] auto-enqueue failed:", e);
  }

  const status = await readStatus();

  // ✅ ถ้ากำลังรันอยู่แล้ว ไม่ต้องทำอะไร
  if (status.status === "in-progress") {
    console.log(`[sync] skip: already in-progress (${status.running?.job ?? "unknown"})`);
    return;
  }

  // ✅ ไม่มีงานในคิว
  if (!Array.isArray(status.queue) || status.queue.length === 0) {
    console.log(`[sync] skip: queue empty`);
    // normalize ให้กลับไป idle
    if (status.status !== "idle") {
      await writeStatus({ ...status, status: "idle", running: null, updatedAt: now() });
    }
    return;
  }

  // ✅ หยิบงานตัวแรกจากคิว (FIFO)
  const job = status.queue[0];
  const cmd = JOBS[job];

  if (!cmd) {
    // ถ้า job ไม่รู้จัก -> pop ทิ้ง + log
    const next = {
      ...status,
      queue: status.queue.slice(1),
      updatedAt: now(),
      history: [
        { job, status: "failed", at: now(), message: "Unknown job" },
        ...(status.history ?? []),
      ].slice(0, 50),
    };
    await writeStatus(next);
    console.log(`[sync] dropped unknown job: ${job}`);
    return;
  }

  // ✅ mark in-progress
  await writeStatus({
    ...status,
    status: "in-progress",
    running: { job, startedAt: now() },
    updatedAt: now(),
  });

  console.log(`[sync] running job=${job}`);

  try {
    await run(cmd);

    // ✅ สำเร็จ -> pop ออกจากคิว
    const after = await readStatus(); // อ่านใหม่กันชน race
    const nextQueue =
      Array.isArray(after.queue) && after.queue[0] === job
        ? after.queue.slice(1)
        : (after.queue ?? []).filter((x) => x !== job); // fallback

    await writeStatus({
      ...after,
      status: nextQueue.length ? "idle" : "idle",
      queue: nextQueue,
      running: null,
      updatedAt: now(),
      history: [
        { job, status: "completed", at: now() },
        ...(after.history ?? []),
      ].slice(0, 50),
    });

    console.log(`[sync] completed job=${job} queue_left=${nextQueue.length}`);
  } catch (e) {
    const after = await readStatus();
    await writeStatus({
      ...after,
      status: "failed",
      running: null,
      updatedAt: now(),
      history: [
        { job, status: "failed", at: now(), message: e?.message ?? String(e) },
        ...(after.history ?? []),
      ].slice(0, 50),
    });
    console.error(`[sync] failed job=${job}`, e);
  }
}

main().catch((e) => {
  console.error("[sync] fatal:", e);
  process.exit(1);
});
