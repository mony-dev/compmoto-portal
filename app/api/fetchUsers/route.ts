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
    const fetchUsers = path.resolve(process.cwd(), 'lib/web/utils/fetchUsers.mjs');
    const { stdout: hOut, stderr: hErr } = await runNode(fetchUsers);
    console.log('fetchUsers.mjs output:', hOut);
    if (hErr) console.error('fetchUsers.mjs error:', hErr);
    return NextResponse.json({ message: 'fetchUsers executed successfully' });
  } catch (error) {
    return NextResponse.json(error);
  } 
}