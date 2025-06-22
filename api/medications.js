import { put, del, list, head } from '@vercel/blob';

const BLOB_TOKEN = process.env.VERCEL_BLOB_READ_WRITE_TOKEN;
const MEDICATIONS_KEY = 'medications-data.json';

/**
 * Save medications array to Vercel Blob storage
 * @param {Array} medications - Array of medication objects
 * @returns {Promise<Object>} Response with url and success status
 */
export async function saveMedicationsToBlob(medications) {
  try {
    const medicationsData = {
      medications,
      lastUpdated: new Date().toISOString(),
      version: '1.0'
    };

    const blob = await put(MEDICATIONS_KEY, JSON.stringify(medicationsData, null, 2), {
      access: 'public',
      token: BLOB_TOKEN,
      contentType: 'application/json'
    });

    console.log('Medications saved to blob:', blob.url);
    return { success: true, url: blob.url, data: medicationsData };
  } catch (error) {
    console.error('Error saving medications to blob:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Load medications array from Vercel Blob storage
 * @returns {Promise<Object>} Response with medications array and metadata
 */
export async function loadMedicationsFromBlob() {
  try {
    // Check if the blob exists
    const blobs = await list({ token: BLOB_TOKEN });
    const medicationsBlob = blobs.blobs.find(blob => blob.pathname === MEDICATIONS_KEY);
    
    if (!medicationsBlob) {
      console.log('No medications data found in blob storage');
      return { success: true, medications: [], isNew: true };
    }

    // Fetch the data
    const response = await fetch(medicationsBlob.url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('Medications loaded from blob:', data.medications?.length || 0, 'items');
    
    return { 
      success: true, 
      medications: data.medications || [], 
      lastUpdated: data.lastUpdated,
      version: data.version,
      isNew: false
    };
  } catch (error) {
    console.error('Error loading medications from blob:', error);
    return { success: false, error: error.message, medications: [] };
  }
}

/**
 * Add a single medication to storage
 * @param {Object} medication - Medication object to add
 * @returns {Promise<Object>} Response with updated medications array
 */
export async function addMedicationToBlob(medication) {
  try {
    // Load existing medications
    const { medications: existingMeds } = await loadMedicationsFromBlob();
    
    // Add new medication with timestamp
    const newMedication = {
      ...medication,
      id: medication.id || Date.now(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    const updatedMedications = [...existingMeds, newMedication];
    
    // Save back to blob
    const result = await saveMedicationsToBlob(updatedMedications);
    
    return {
      ...result,
      medication: newMedication,
      totalMedications: updatedMedications.length
    };
  } catch (error) {
    console.error('Error adding medication to blob:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Update a medication in storage
 * @param {number|string} medicationId - ID of medication to update
 * @param {Object} updates - Object with fields to update
 * @returns {Promise<Object>} Response with updated medications array
 */
export async function updateMedicationInBlob(medicationId, updates) {
  try {
    // Load existing medications
    const { medications: existingMeds } = await loadMedicationsFromBlob();
    
    // Find and update the medication
    const updatedMedications = existingMeds.map(med => 
      med.id === medicationId 
        ? { ...med, ...updates, updatedAt: new Date().toISOString() }
        : med
    );
    
    // Check if medication was found
    const wasUpdated = updatedMedications.some(med => 
      med.id === medicationId && med.updatedAt !== existingMeds.find(m => m.id === medicationId)?.updatedAt
    );
    
    if (!wasUpdated) {
      return { success: false, error: 'Medication not found' };
    }
    
    // Save back to blob
    const result = await saveMedicationsToBlob(updatedMedications);
    
    return {
      ...result,
      updatedMedication: updatedMedications.find(med => med.id === medicationId)
    };
  } catch (error) {
    console.error('Error updating medication in blob:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Delete a medication from storage
 * @param {number|string} medicationId - ID of medication to delete
 * @returns {Promise<Object>} Response with updated medications array
 */
export async function deleteMedicationFromBlob(medicationId) {
  try {
    // Load existing medications
    const { medications: existingMeds } = await loadMedicationsFromBlob();
    
    // Filter out the medication to delete
    const updatedMedications = existingMeds.filter(med => med.id !== medicationId);
    
    // Check if medication was found and removed
    if (updatedMedications.length === existingMeds.length) {
      return { success: false, error: 'Medication not found' };
    }
    
    // Save back to blob
    const result = await saveMedicationsToBlob(updatedMedications);
    
    return {
      ...result,
      deletedMedicationId: medicationId,
      totalMedications: updatedMedications.length
    };
  } catch (error) {
    console.error('Error deleting medication from blob:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Clear all medications from storage
 * @returns {Promise<Object>} Response confirming deletion
 */
export async function clearAllMedicationsFromBlob() {
  try {
    const result = await del(MEDICATIONS_KEY, { token: BLOB_TOKEN });
    console.log('All medications cleared from blob storage');
    return { success: true, message: 'All medications cleared' };
  } catch (error) {
    console.error('Error clearing medications from blob:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Get storage info and statistics
 * @returns {Promise<Object>} Storage statistics
 */
export async function getMedicationStorageInfo() {
  try {
    const blobs = await list({ token: BLOB_TOKEN });
    const medicationsBlob = blobs.blobs.find(blob => blob.pathname === MEDICATIONS_KEY);
    
    if (!medicationsBlob) {
      return {
        success: true,
        exists: false,
        size: 0,
        lastModified: null,
        medicationCount: 0
      };
    }
    
    const { medications } = await loadMedicationsFromBlob();
    
    return {
      success: true,
      exists: true,
      size: medicationsBlob.size,
      lastModified: medicationsBlob.uploadedAt,
      medicationCount: medications.length,
      url: medicationsBlob.url
    };
  } catch (error) {
    console.error('Error getting storage info:', error);
    return { success: false, error: error.message };
  }
}

// Example usage and testing functions
export const testBlobOperations = async () => {
  console.log('Testing Blob Storage Operations...');
  
  // Test adding a medication
  const testMedication = {
    name: "Test Medication",
    time: "09:00",
    dosage: "500mg",
    frequency: "Once daily",
    notes: "Test medication for blob storage",
    description: "This is a test medication to verify blob storage functionality"
  };
  
  const addResult = await addMedicationToBlob(testMedication);
  console.log('Add result:', addResult);
  
  // Test loading medications
  const loadResult = await loadMedicationsFromBlob();
  console.log('Load result:', loadResult);
  
  // Test storage info
  const infoResult = await getMedicationStorageInfo();
  console.log('Storage info:', infoResult);
  
  return { addResult, loadResult, infoResult };
};

export default async function handler(req, res) {
  if (req.method === 'POST') {
    // Save all medications (bulk update)
    const { medications } = req.body;
    const result = await saveMedicationsToBlob(medications);
    res.status(200).json(result);
  } else if (req.method === 'PATCH') {
    // Update a single medication
    const { id, updates } = req.body;
    const result = await updateMedicationInBlob(id, updates);
    res.status(200).json(result);
  } else if (req.method === 'GET') {
    // Load all medications
    const result = await loadMedicationsFromBlob();
    res.status(200).json(result);
  } else {
    res.status(405).end('Method Not Allowed');
  }
}