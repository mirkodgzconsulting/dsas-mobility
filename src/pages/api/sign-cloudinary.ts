export const prerender = false;

import { v2 as cloudinary } from 'cloudinary';
import type { APIRoute } from 'astro';

cloudinary.config({
    cloud_name: import.meta.env.PUBLIC_CLOUDINARY_CLOUD_NAME,
    api_key: import.meta.env.PUBLIC_CLOUDINARY_API_KEY,
    api_secret: import.meta.env.CLOUDINARY_API_SECRET,
});

export const GET: APIRoute = async () => {
    const timestamp = Math.round(new Date().getTime() / 1000);

    // We want to sign the following parameters:
    // timestamp
    // (optional) upload_preset, folder, etc. if we enforced them.
    // For standard signed uploads, timestamp is the minimal requirement usually.

    const signature = cloudinary.utils.api_sign_request(
        {
            timestamp: timestamp,
            folder: 'dsas-mobility',
        },
        import.meta.env.CLOUDINARY_API_SECRET
    );

    return new Response(
        JSON.stringify({
            timestamp,
            signature,
            cloud_name: import.meta.env.PUBLIC_CLOUDINARY_CLOUD_NAME,
            api_key: import.meta.env.PUBLIC_CLOUDINARY_API_KEY
        }),
        {
            status: 200,
            headers: {
                'Content-Type': 'application/json'
            }
        }
    );
};
