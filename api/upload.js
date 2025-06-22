// /api/upload.js  (Node / Serverless Function)
import { put } from '@vercel/blob';
import { IncomingForm } from 'formidable';
import fs from 'fs/promises';

export const config = {
  api: { bodyParser: false },
  runtime: 'nodejs',                 // needed for fs & formidable
};

export default async function handler(req, res) {
  if (req.method !== 'POST')
    return res.status(405).send('Method Not Allowed');

  try {
    /* ---------- 1. Parse multipart ---------- */
    const { files } = await new Promise((resolve, reject) => {
      new IncomingForm().parse(req, (err, fields, files) =>
        err ? reject(err) : resolve({ files })
      );
    });

    /** grab first file regardless of shape */
    const fileField = files.file;                         // might be File | File[]
    const file      = Array.isArray(fileField)
      ? fileField[0]
      : fileField;

    if (!file || !file.filepath)
      return res.status(400).json({ error: 'No file uploaded' });

    /* ---------- 2. Read & upload ------------ */
    const buffer   = await fs.readFile(file.filepath);
    const blobPath = `medical_history/${file.originalFilename}`;

    const blob = await put(blobPath, buffer, {
      access:     'public',
      overwrite:  true,                    // replace any existing file
      // token: process.env.VERCEL_BLOB_READ_WRITE_TOKEN, // optional if set globally
    });

    /* ---------- 3. Cleanup & respond -------- */
    await fs.unlink(file.filepath);

    return res.status(200).json({ url: blob.url });
  } catch (err) {
    console.error('Upload error:', err);
    return res
      .status(500)
      .send('A server error occurred: ' + (err?.message || err));
  }
}
