// /api/upload.js
import { put } from '@vercel/blob';
import { IncomingForm } from 'formidable';
import fs from 'fs/promises';

export const config = {
  api: { bodyParser: false },
  runtime: 'nodejs',          // full Node runtime (fs, formidable, etc.)
};

export default async function handler(req, res) {
  if (req.method !== 'POST')
    return res.status(405).end('Method Not Allowed');

  try {
    /* ---------- 1. parse multipart form ---------- */
    const form = new IncomingForm();
    const { files } = await new Promise((resolve, reject) => {
      form.parse(req, (err, fields, files) =>
        err ? reject(err) : resolve({ fields, files })
      );
    });

    const file = files.file;
    if (!file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    /* ---------- 2. read & upload to Blob ---------- */
    const fileBuffer = await fs.readFile(file.filepath);

    const blobPath = `medical_history/${file.originalFilename}`;

    const blob = await put(blobPath, fileBuffer, {
      access: 'public',
      overwrite: true,                    // 👈  replace if it exists
      token: process.env.VERCEL_BLOB_READ_WRITE_TOKEN, // optional if set globally
    });

    /* ---------- 3. clean-up temp file & respond --- */
    await fs.unlink(file.filepath);

    return res.status(200).json({ url: blob.url });
  } catch (err) {
    console.error('Upload error:', err);
    return res
      .status(500)
      .send('A server error occurred: ' + (err?.message || err));
  }
}
