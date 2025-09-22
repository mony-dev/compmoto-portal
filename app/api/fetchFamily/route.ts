import { NextResponse } from 'next/server';
import path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';

const execPromise = promisify(exec);

async function runNode(scriptPath: string) {
  const cmd = `"${process.execPath}" "${scriptPath}"`;
  return execPromise(cmd, { maxBuffer: 10 * 1024 * 1024, timeout: 120000 });
}

export async function GET(request: Request) {
  try {
    const fetchFamily = path.resolve(process.cwd(), 'lib/web/utils/fetchFamily.mjs');
    const { stdout: hOut, stderr: hErr } = await runNode(fetchFamily);
    console.log('fetchFamily.mjs output:', hOut);
    if (hErr) console.error('fetchFamily.mjs error:', hErr);
    return NextResponse.json({ message: 'fetchFamily executed successfully' });
  } catch (error) {
    return NextResponse.json(error);
  } 
}