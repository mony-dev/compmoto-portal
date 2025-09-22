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
    const historyPath = path.resolve(process.cwd(), 'lib/web/utils/saveHistory.mjs');
    const creditMemoPath = path.resolve(process.cwd(), 'lib/web/utils/fetchCreditMemo.mjs');

    const { stdout: hOut, stderr: hErr } = await runNode(historyPath);
    console.log('saveHistory.mjs output:', hOut);
    if (hErr) console.error('saveHistory.mjs error:', hErr);

    const { stdout: cOut, stderr: cErr } = await runNode(creditMemoPath);
    console.log('fetchCreditMemo.mjs output:', cOut);
    if (cErr) console.error('fetchCreditMemo.mjs error:', cErr);

    return NextResponse.json({ message: 'Scripts executed successfully' });
  } catch (error) {
    console.error('Script execution failed:', error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
