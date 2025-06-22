// /api/medications.js
import { put, list } from '@vercel/blob';

/* ------------------------------------------------------------------ */
/*  Config                                                            */
/* ------------------------------------------------------------------ */
const TOKEN  = process.env.VERCEL_BLOB_READ_WRITE_TOKEN;
const PREFIX = 'medications-data';          // every blob key starts with this

/* small helper – turn a name into a safe file slug */
const slugify = str =>
  str
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')           // spaces → dashes
    .replace(/[^a-z0-9-]/g, '')     // drop other chars
    .slice(0, 60) || 'unnamed';

/* ------------------------------ LIST / LATEST -------------------------------- */
async function latestBlobEntry() {
  const { blobs } = await list({ token: TOKEN });
  const meds = blobs
    .filter(b => b.pathname.startsWith(PREFIX))
    .sort((a, b) => new Date(b.uploadedAt) - new Date(a.uploadedAt)); // newest first
  return meds[0];               // undefined if nothing stored yet
}

/* ------------------------------ READ ----------------------------------------- */
async function loadLatest() {
  const entry = await latestBlobEntry();
  if (!entry) return { success: true, medications: [], isNew: true };

  const res = await fetch(entry.url);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data = await res.json();

  return {
    success:     true,
    medications: data.medications || [],
    lastUpdated: data.lastUpdated,
    key:         entry.pathname
  };
}

/* ------------------------------ WRITE ---------------------------------------- */
async function saveMedications(medications) {
  /**
   * Decide the storage key.
   *    – If the caller sends exactly 1 medication that has a `.name`,
   *      use that name in the key (overwrite-safe).
   *    – Otherwise (bulk save / unknown), fall back to a timestamp key.
   */
  let key;
  if (medications.length === 1 && medications[0]?.name) {
    const medNameSlug = slugify(medications[0].name);
    key = `${PREFIX}-${medNameSlug}.json`;
  } else {
    key = `${PREFIX}-${Date.now()}.json`;
  }

  const payload = {
    medications,
    lastUpdated: new Date().toISOString(),
    version:     '1.0'
  };

  const blob = await put(
    key,
    JSON.stringify(payload, null, 2),
    {
      token:      TOKEN,
      access:     'public',
      contentType:'application/json',
      overwrite:  true            // <--  critical bit
    }
  );

  return { success: true, key, url: blob.url, data: payload };
}

/* ------------------------- PATCH / DELETE helpers --------------------------- */
async function patchMedication(id, updates) {
  const { medications } = await loadLatest();
  const next = medications.map(m =>
    m.id === id ? { ...m, ...updates, updatedAt: new Date().toISOString() } : m
  );
  return saveMedications(next);
}

async function deleteMedication(id) {
  const { medications } = await loadLatest();
  const next = medications.filter(m => m.id !== id);
  return saveMedications(next);
}

/* ------------------------------------------------------------------ */
/*    HTTP handler                                                    */
/* ------------------------------------------------------------------ */
export default async function handler(req, res) {
  try {
    if (req.method === 'GET')
      return res.json(await loadLatest());

    if (req.method === 'POST') {
      const { medications = [] } = req.body;
      return res.json(await saveMedications(medications));
    }

    if (req.method === 'PATCH') {
      const { id, updates } = req.body;
      return res.json(await patchMedication(id, updates));
    }

    if (req.method === 'DELETE') {
      const { id } = req.body;
      return res.json(await deleteMedication(id));
    }

    res.status(405).end('Method Not Allowed');
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: err.message });
  }
}
