// pages/api/upload.ts
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { accessToken, fileName, fileContent } = req.body;

  if (!accessToken || !fileName || !fileContent) {
    return res.status(400).json({ error: "Missing required parameters" });
  }

  try {
    const metadata = {
      name: fileName,
      mimeType: "text/plain",
    };

    const boundary = "foo_bar_baz";
    const delimiter = `\r\n--${boundary}\r\n`;
    const closeDelimiter = `\r\n--${boundary}--`;

    const body =
      delimiter +
      "Content-Type: application/json; charset=UTF-8\r\n\r\n" +
      JSON.stringify(metadata) +
      delimiter +
      "Content-Type: text/plain\r\n\r\n" +
      fileContent +
      closeDelimiter;

    const response = await fetch("https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": `multipart/related; boundary="foo_bar_baz"`,
      },
      body,
    });

    const data = await response.json();
    if (!response.ok) {
      return res.status(response.status).json({ error: data.error?.message || "Upload failed" });
    }

    return res.status(200).json({ fileId: data.id });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
}


