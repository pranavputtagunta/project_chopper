import { put } from '@vercel/blob'

export const config = {
    api: {
        bodyParser: false,
    },
};

export default async function handler(req, res){
    if(req.method !== 'POST'){
        return res.status(405).end('Method Not Allowed;)')
    }

    const { blob } = await put(req, {access: 'public'});
    return res.status(200).json(blob);
}