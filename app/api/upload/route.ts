// app/api/upload/route.ts

import { NextResponse } from "next/server";
import { Readable } from "stream";

export const config = {
  api: {
    bodyParser: false,
  },
};

export async function POST(request: Request) {
  const accessToken = request.headers.get("x-access-token");
  const encodedFileName = request.headers.get("x-file-name");
  const mimeType = request.headers.get("x-mime-type") || "application/octet-stream";

  if (!accessToken || !encodedFileName) {
    return NextResponse.json({ error: "Missing required headers" }, { status: 400 });
  }

  const fileName = decodeURIComponent(encodedFileName);

  // Read raw body as Buffer
  const fileBuffer = Buffer.from(await request.arrayBuffer());

  const boundary = "foo_bar_baz";
  const CRLF = "\r\n";

  const metadataPart =
    `--${boundary}${CRLF}` +
    `Content-Type: application/json; charset=UTF-8${CRLF}${CRLF}` +
    `${JSON.stringify({ name: fileName, mimeType })}${CRLF}`;

  const fileHeader =
    `--${boundary}${CRLF}` +
    `Content-Type: ${mimeType}${CRLF}${CRLF}`;

  const closingBoundary = `${CRLF}--${boundary}--${CRLF}`;

  const bodyBuffer = Buffer.concat([
    Buffer.from(metadataPart, "utf-8"),
    Buffer.from(fileHeader, "utf-8"),
    fileBuffer,
    Buffer.from(closingBoundary, "utf-8"),
  ]);

  const uploadResponse = await fetch(
    "https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": `multipart/related; boundary=${boundary}`,
        "Content-Length": bodyBuffer.length.toString(),
      },
      body: bodyBuffer,
    }
  );

  const data = await uploadResponse.json();

  if (!uploadResponse.ok) {
    return NextResponse.json(
      { error: data.error?.message || "Upload failed", details: data },
      { status: uploadResponse.status }
    );
  }

  return NextResponse.json({ fileId: data.id }, { status: 200 });
}












