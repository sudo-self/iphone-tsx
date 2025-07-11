
import type { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { accessToken, fileName, fileContent } = req.body

  if (!accessToken || !fileName || !fileContent) {
    return res.status(400).json({ error: 'Missing required parameters' })
  }

  try {
    const metadata = {
      name: fileName,
      mimeType: 'text/plain',
    }

    const boundary = '-------314159265358979323846'
    const delimiter = `\r\n--${boundary}\r\n`
    const closeDelimiter = `\r\n--${boundary}--`

    const multipartRequestBody =
      delimiter +
      'Content-Type: application/json\r\n\r\n' +
      JSON.stringify(metadata) +
      delimiter +
      'Content-Type: text/plain\r\n\r\n' +
      fileContent +
      closeDelimiter

    const response = await fetch(
      'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': `multipart/related; boundary=${boundary}`,
        },
        body: multipartRequestBody,
      }
    )

    if (!response.ok) {
      const errorData = await response.json()
      return res.status(response.status).json({ error: errorData.error.message })
    }

    const data = await response.json()
    return res.status(200).json({ fileId: data.id })
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Upload failed' })
  }
}
