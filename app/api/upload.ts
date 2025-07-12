import type { NextApiRequest, NextApiResponse } from "next";
import { Buffer } from "buffer";

export const config = {
  api: {
    bodyParser: false,
  },
};

function readRequestBody(req: NextApiRequest): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const chunks: Uint8Array[] = [];
    req.on("data", (chunk) => chunks.push(chunk));
    req.on("end", () => resolve(Buffer.concat(chunks)));
    req.on("error", reject);
  });
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Only accept POST
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const accessToken = req.headers["x-access-token"] as string;
  const fileName = req.headers["x-file-name"] as string;
  const mimeType = req.headers["x-mime-type"] as string || "application/octet-stream";

  if (!accessToken || !fileName) {
    return res.status(400).json({ error: "Missing required headers" });
  }

  try {
    const fileBuffer = await readRequestBody(req);

    const boundary = "foo_bar_baz";

    const metadata = {
      name: fileName,
      mimeType,
    };

    const metaPart = Buffer.from(
      `--${boundary}\r\n` +
        `Content-Type: application/json; charset=UTF-8\r\n\r\n` +
        `${JSON.stringify(metadata)}\r\n`,
      "utf-8"
    );

    const filePart = Buffer.concat([
      Buffer.from(
        `--${boundary}\r\nContent-Type: ${mimeType}\r\n\r\n`,
        "utf-8"
      ),
      fileBuffer,
      Buffer.from("\r\n", "utf-8"),
    ]);

    const closing = Buffer.from(`--${boundary}--`, "utf-8");

    const body = Buffer.concat([metaPart, filePart, closing]);

    const uploadRes = await fetch(
      "https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": `multipart/related; boundary=${boundary}`,
          "Content-Length": body.length.toString(),
        },
        body,
      }
    );

    const data = await uploadRes.json();

    if (!uploadRes.ok) {
      return res
        .status(uploadRes.status)
        .json({ error: data.error?.message || "Upload failed" });
    }

    return res.status(200).json({ fileId: data.id });
  } catch (error: any) {
    return res.status(500).json({ error: error.message || "Unexpected error" });
  }
}






