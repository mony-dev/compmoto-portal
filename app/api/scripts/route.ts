import { NextResponse } from 'next/server'
import path from 'path'
import { exec } from 'child_process'
import { promisify } from 'util'

const execPromise = promisify(exec)

export async function POST() {
  try {
    const historyPath = path.resolve(process.cwd(), 'lib/web/utils/saveHistory.mjs')
    // const creditMemoPath = path.resolve(process.cwd(), 'lib/web/utils/fetchCreditMemo.mjs')

    const { stdout: hOut } = await execPromise(`node ${historyPath}`)
    console.log("saveHistory.mjs output:", hOut)

    // const { stdout: cOut } = await execPromise(`node ${creditMemoPath}`)
    // console.log("fetchCreditMemo.mjs output:", cOut)

    return NextResponse.json({ message: "Scripts executed successfully" })
  } catch (error) {
    console.error("Script execution failed:", error)
    return NextResponse.json(error);
  }
}
