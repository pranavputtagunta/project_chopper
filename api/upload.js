import { put } from '@vercel/blob'
import formidable from 'formidable';
import fs from 'fs';

export const config = {
    api: {
        bodyParser: false,
    },
};

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).end('Method Not Allowed');
    }

    try {
        // Parse the multipart form data
        const form = formidable({});
        const [fields, files] = await form.parse(req);
        
        // Get the uploaded file
        const file = files.file?.[0];
        if (!file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        // Read the file data
        const fileBuffer = fs.readFileSync(file.filepath);
        
        // Upload to Vercel Blob
        const blob = await put(file.originalFilename || 'uploaded-file', fileBuffer, {
            access: 'public',
        });

        // Clean up temporary file
        fs.unlinkSync(file.filepath);

        return res.status(200).json({ url: blob.url });
    } catch (error) {
        console.error('Upload error:', error);
        res.status(500).send('A server error occurred: ' + error.message);
    }
}