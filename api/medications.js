// api/medications.js
import { put, del, list } from '@vercel/blob';

/* ------------------------------------------------------------------ */
/*  Config                                                            */
/* ------------------------------------------------------------------ */
const BLOB_TOKEN  = process.env.VERCEL_BLOB_READ_WRITE_TOKEN;
const MEDS_BLOB   = 'medications-data.json';

/* ------------------------------------------------------------------ */
/*  Helper ➊ – save whole list                                        */
/* ------------------------------------------------------------------ */
async function saveMedicationsToBlob(medications) {
  const payload = {
    medications,
    lastUpdated: new Date().toISOString(),
    version: '1.0'
  };

  const blob = await put(
    MEDS_BLOB,
    JSON.stringify(payload, null, 2),
    { access: 'public', token: BLOB_TOKEN, contentType: 'application/json' }
  );

  return { success: true, url: blob.url, data: payload };
}

/* ------------------------------------------------------------------ */
/*  Helper ➋ – load list                                              */
/* ------------------------------------------------------------------ */
async function loadMedicationsFromBlob() {
  const blobs = await list({ token: BLOB_TOKEN });
  const entry = blobs.blobs.find(b => b.pathname === MEDS_BLOB);

  if (!entry) return { success: true, medications: [], isNew: true };

  const res  = await fetch(entry.url);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);

  const j = await res.json();
  return { success: true, medications: j.medications || [], lastUpdated: j.lastUpdated };
}

/* ------------------------------------------------------------------ */
/*  Helper ➌ – update / delete one                                    */
/* ------------------------------------------------------------------ */
async function patchMedication(id, updates) {
  const { medications } = await loadMedicationsFromBlob();
  const next = medications.map(m =>
    m.id === id ? { ...m, ...updates, updatedAt: new Date().toISOString() } : m
  );
  return saveMedicationsToBlob(next);
}

async function deleteMedication(id) {
  const { medications } = await loadMedicationsFromBlob();
  const next = medications.filter(m => m.id !== id);
  return saveMedicationsToBlob(next);
}

/* ------------------------------------------------------------------ */
/*  Serverless HTTP handler                                           */
/* ------------------------------------------------------------------ */
export default async function handler(req, res) {
  try {
    if (req.method === 'GET') {
      return res.json(await loadMedicationsFromBlob());
    }

    if (req.method === 'POST') {
      // bulk replace
      return res.json(await saveMedicationsToBlob(req.body.medications || []));
    }

    if (req.method === 'PATCH') {
      const { id, updates } = req.body;
      return res.json(await patchMedication(id, updates));
    }

    if (req.method === 'DELETE') {
      const { id } = req.body;
      return res.json(await deleteMedication(id));
    }

    // Unsupported verb
    res.status(405).end('Method Not Allowed');
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: err.message });
  }
}
