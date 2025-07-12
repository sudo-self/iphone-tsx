// app/api/upload.ts

import type { NextApiRequest, NextApiResponse } from "next";
import { Buffer } from "buffer";

export const config = {
  api: {
    bodyParser: false,
  },
};

async function readRequestBody(req: NextApiRequest): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const chunks: Uint8Array[] = [];
    req.on("data", (chunk) => chunks.push(chunk));
    req.on("end", () => resolve(Buffer.concat(chunks)));
    req.on("error", reject);
  });
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const accessToken = req.headers["x-access-token"] as string;
  const fileName = req.headers["x-file-name"] as string;
  const mimeType = (req.headers["x-mime-type"] as string) || "application/octet-stream";

  if (!accessToken || !fileName) {
    return res.status(400).json({ error: "Missing required headers" });
  }

  try {
    const fileBuffer = await readRequestBody(req);

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
      return res.status(uploadResponse.status).json({
        error: data.error?.message || "Upload failed",
        details: data,
      });
    }

    return res.status(200).json({ fileId: data.id });
  } catch (error: any) {
    return res.status(500).json({ error: error.message || "Unexpected error" });
  }
}










