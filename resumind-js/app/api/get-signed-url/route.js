import cloudinary from 'cloudinary';

export const runtime = 'nodejs';

cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(req) {
  try {
    const { public_id, format = 'pdf', resource_type = 'raw', type = 'upload' } = await req.json();

    if (!public_id) {
      return new Response(JSON.stringify({ error: 'Missing public_id' }), { status: 400 });
    }

    const expires_at = Math.floor(Date.now() / 1000) + 60; // valid for 60 seconds
    const signedUrl = cloudinary.v2.utils.private_download_url(public_id, format, {
      resource_type,
      type,
      expires_at,
    });

    return new Response(JSON.stringify({ signedUrl }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('get-signed-url error', err);
    return new Response(JSON.stringify({ error: 'Failed to sign URL', details: err.message }), { status: 500 });
  }
}
