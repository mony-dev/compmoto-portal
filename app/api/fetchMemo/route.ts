// import { NextResponse } from "next/server";
// import { exec } from "child_process";
// export async function POST() {
//   try {

//     exec('node lib/web/utils/fetchCreditMemo.mjs', (error, stdout, stderr) => {
//       if (error) {
//         console.error(`exec error: ${error}`);
//         return NextResponse.json(error);
//       }
//     });
    
//     return NextResponse.json({ message: "Processing completed" });
//   } catch (error) {
//     console.error("Error processing invoices:", error);
//     return NextResponse.json({ error: "Failed to process invoices" });
//   }
// }
import { NextResponse } from "next/server";
import { exec } from "child_process";

function runFetchCreditMemoDetached() {
  exec(
    "node lib/web/utils/fetchCreditMemo.mjs",
    (error, stdout, stderr) => {
      if (error) {
        console.error("fetchCreditMemo exec error:", error);
        return;
      }
      if (stdout) console.log("fetchCreditMemo stdout:", stdout);
      if (stderr) console.error("fetchCreditMemo stderr:", stderr);
    }
  );
}

export async function POST() {
  try {
    runFetchCreditMemoDetached(); // fire-and-forget
    return NextResponse.json({ message: "Job started" });
  } catch (error) {
    console.error("Error starting fetchCreditMemo job:", error);
    return NextResponse.json(
      { error: "Failed to start job" },
      { status: 500 }
    );
  }
}


