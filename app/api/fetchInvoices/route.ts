// import { NextResponse } from "next/server";
// import { exec } from "child_process";

// export async function GET(request: Request) {
//   const { searchParams } = new URL(request.url);
//   const page = 1;
//   const pageSize = 50;

//   try {
//     exec('node lib/web/utils/fetchInvoice.mjs', (error, stdout, stderr) => {
//       if (error) {
//         console.error(`exec error: ${error}`);
//         return NextResponse.json(error);
//       }
//     });

//     return NextResponse.json({ message: "Processing completed" });
//   } catch (error) {
//     return NextResponse.json({ error: "Failed to process invoices" });
//   } 
// }
import { NextResponse } from "next/server";
import { exec } from "child_process";

export const runtime = "nodejs"; 

function runFetchInvoiceDetached() {
  exec(
    "node lib/web/utils/fetchInvoice.mjs",
    (error, stdout, stderr) => {
      if (error) {
        console.error("fetchInvoice exec error:", error);
        return;
      }
      if (stdout) console.log("fetchInvoice stdout:", stdout);
      if (stderr) console.error("fetchInvoice stderr:", stderr);
    }
  );
}

export async function GET(request: Request) {
  try {
    runFetchInvoiceDetached(); // fire-and-forget
    return NextResponse.json({ message: "Processing started" });
  } catch (error) {
    console.error("Error starting fetchInvoice job:", error);
    return NextResponse.json(
      { error: "Failed to start invoice job" },
      { status: 500 }
    );
  }
}
