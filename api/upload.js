// /api/upload.js
import { put } from '@vercel/blob';
import { IncomingForm } from 'formidable';
import fs from 'fs/promises';

export const config = {
  api: { bodyParser: false },
  runtime: 'nodejs',           // ensure Node runtime for fs + formidable
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

    // works whether `files.file` is a File or File[]
    const fileField = files.file;
    const file      = Array.isArray(fileField) ? fileField[0] : fileField;

    if (!file || !file.filepath)
      return res.status(400).json({ error: 'No file uploaded' });

    /* ---------- 2. Build key & upload -------- */
    // keep original extension so mime-type stays accurate
    const ext        = file.originalFilename.split('.').pop();  // e.g. "pdf"
    const blobKey    = `medical_history.${ext}`;                // no folder
    const buffer     = await fs.readFile(file.filepath);

    const blob = await put(blobKey, buffer, {
      access:    'public',
      overwrite: true,                    // always replace previous file
      // token: process.env.VERCEL_BLOB_READ_WRITE_TOKEN (if not env-scoped)
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
