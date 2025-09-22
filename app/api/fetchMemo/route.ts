import { NextResponse } from 'next/server';
import path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';

const execPromise = promisify(exec);

async function runNode(scriptPath: string) {
  const cmd = `"${process.execPath}" "${scriptPath}"`;
  return execPromise(cmd, { maxBuffer: 10 * 1024 * 1024, timeout: 120000 });
}

export async function POST() {
  try {
    const fetchCreditMemo = path.resolve(process.cwd(), 'lib/web/utils/fetchCreditMemo.mjs');
    const { stdout: hOut, stderr: hErr } = await runNode(fetchCreditMemo);
    console.log('fetchCreditMemo.mjs output:', hOut);
    if (hErr) console.error('fetchCreditMemo.mjs error:', hErr);
    return NextResponse.json({ message: 'fetchCreditMemo executed successfully' });
  } catch (error) {
    console.error("Error processing invoices:", error);
    return NextResponse.json({ error: "Failed to process invoices" });
  }
}


