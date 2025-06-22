import { put } from '@vercel/blob'

export const config = {
    api: {
        bodyParser: false,
    },
};

export default async function handler(req, res){
    if(req.method !== 'POST'){
        return res.status(405).end('Method Not Allowed')
    }

  try {
    // The Vercel Blob SDK's `put` can accept the entire req object for multipart/form-data
    const { blob } = await put(req, { access: 'public' });
    return res.status(200).json(blob);
  } catch (error) {
    res.status(500).send('A server error occurred: ' + error.message);
  }
}