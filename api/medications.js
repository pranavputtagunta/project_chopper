// api/medications.js
import { put, list } from '@vercel/blob';

/* ------------------------------------------------------------------ */
/*  Config                                                            */
/* ------------------------------------------------------------------ */
const TOKEN   = process.env.VERCEL_BLOB_READ_WRITE_TOKEN;
const PREFIX  = 'medications-data';          // every blob key starts with this

/* ------------ helper: pick latest blob that matches the prefix -------------- */
async function latestBlobEntry() {
  const { blobs } = await list({ token: TOKEN });
  const meds = blobs
    .filter(b => b.pathname.startsWith(PREFIX))
    .sort((a, b) => new Date(b.uploadedAt) - new Date(a.uploadedAt)); // newest first
  return meds[0];                 // undefined if none exist
}

/* -------------------------- READ ------------------------------------------- */
async function loadLatest() {
  const entry = await latestBlobEntry();
  if (!entry) return { success: true, medications: [], isNew: true };

  const res = await fetch(entry.url);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data = await res.json();

  return { success: true, medications: data.medications || [], lastUpdated: data.lastUpdated };
}

/* -------------------------- WRITE (new key each time) ----------------------- */
async function saveMedications(medications) {
  // key example: medications-data-1718816423902.json
  const key = `${PREFIX}-${Date.now()}.json`;

  const payload = {
    medications,
    lastUpdated: new Date().toISOString(),
    version: '1.0'
  };

  const blob = await put(
    key,
    JSON.stringify(payload, null, 2),
    { access: 'public', token: TOKEN, contentType: 'application/json' }
  );

  return { success: true, url: blob.url, key, data: payload };
}

/* -------------------------- PATCH one -------------------------------------- */
async function patchMedication(id, updates) {
  const { medications } = await loadLatest();
  const next = medications.map(m =>
    m.id === id ? { ...m, ...updates, updatedAt: new Date().toISOString() } : m
  );
  return saveMedications(next);
}

/* -------------------------- DELETE one ------------------------------------- */
async function deleteMedication(id) {
  const { medications } = await loadLatest();
  const next = medications.filter(m => m.id !== id);
  return saveMedications(next);
}

/* ------------------------------------------------------------------ */
/*  HTTP handler                                                      */
/* ------------------------------------------------------------------ */
export default async function handler(req, res) {
  try {
    if (req.method === 'GET') {
      return res.json(await loadLatest());
    }

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
