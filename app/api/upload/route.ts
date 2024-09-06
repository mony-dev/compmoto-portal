import { v2 as cloudinary } from "cloudinary";
import { createReadStream } from "fs";
import { NextResponse } from "next/server";
import { pipeline } from "stream";
import { promisify } from "util";

const pipelineAsync = promisify(pipeline);

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(request: Request) {
  const body = await request.json();
  const { paramsToSign } = body;
  const signature = cloudinary.utils.api_sign_request(
    paramsToSign,
    `${process.env.CLOUDINARY_API_SECRET}`
  );

  return Response.json({ signature });
}

export async function GET(request: Request) {
  // Extract query parameters from the URL
  const { searchParams } = new URL(request.url);
  const publicId = searchParams.get('publicId');

  // Check if publicId is provided
  if (!publicId) {
    return NextResponse.json({ error: 'Missing publicId' }, { status: 400 });
  }

  try {
    // Fetch resource details from Cloudinary using the public ID
    const result = await cloudinary.api.resource(publicId as string);

    // Return the metadata in the response
    return NextResponse.json({ result });
  } catch (error) {
    console.error("Error fetching Cloudinary metadata:", error);
    return NextResponse.json({ error: 'Failed to fetch metadata from Cloudinary' }, { status: 500 });
  }
}