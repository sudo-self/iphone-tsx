// app/api/upload.ts

import type { NextApiRequest, NextApiResponse } from "next";
import { Buffer } from "buffer";

export const config = {
  api: {
    bodyParser: false,
  },
};

function bufferStream(req: NextApiRequest): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const chunks: Uint8Array[] = [];
    req.on("data", (chunk) => chunks.push(chunk));
    req.on("end", () => resolve(Buffer.concat(chunks)));
    req.on("error", reject);
  });
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const accessToken = req.headers["x-access-token"] as string;
  const fileName = req.headers["x-file-name"] as string;
  const mimeType = req.headers["x-mime-type"] as string || "application/octet-stream";

  if (!accessToken || !fileName) {
    return res.status(400).json({ error: "Missing required headers" });
  }

  try {
    const fileBuffer = await bufferStream(req);
    const boundary = "foo_bar_baz";

    const metadata = {
      name: fileName,
      mimeType,
    };

    const delimiter = `--${boundary}\r\n`;
    const closeDelimiter = `--${boundary}--`;

    const metaPart = Buffer.from(
      delimiter +
        'Content-Type: application/json; charset=UTF-8\r\n\r\n' +
        JSON.stringify(metadata) +
        '\r\n',
      "utf-8"
    );

    const filePart = Buffer.from(
      `Content-Type: ${mimeType}\r\n\r\n`,
      "utf-8"
    );

    const closing = Buffer.from(`\r\n${closeDelimiter}`, "utf-8");

    const multipartBody = Buffer.concat([metaPart, filePart, fileBuffer, closing]);

    const response = await fetch("https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": `multipart/related; boundary=${boundary}`,
        "Content-Length": multipartBody.length.toString(),
      },
      body: multipartBody,
    });

    const data = await response.json();
    if (!response.ok) {
      return res.status(response.status).json({ error: data.error?.message || "Upload failed" });
    }

    return res.status(200).json({ fileId: data.id });
  } catch (error: any) {
    console.error("Upload error:", error);
    return res.status(500).json({ error: error.message || "Unexpected error" });
  }
}




