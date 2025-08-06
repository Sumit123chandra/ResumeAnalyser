// app/api/extract-from-cloud/route.js
import cloudinary from 'cloudinary';
import axios from 'axios';

export const runtime = 'nodejs';

cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(req) {
  try {
    const body = await req.json();
    const { public_id, resource_type = 'raw', format = 'pdf', url } = body || {};

    if (!public_id && !url) {
      return new Response(JSON.stringify({ error: 'Missing public_id or url' }), { status: 400 });
    }

    // If the frontend sent a direct URL, prefer that.
    let downloadUrl = url;

    if (public_id && !downloadUrl) {
      // 1) Ask Cloudinary API about the stored resource
      let resourceInfo;
      try {
        resourceInfo = await cloudinary.v2.api.resource(public_id, { resource_type });
        console.log('[extract-from-cloud] resourceInfo:', { public_id, resource_type, url: resourceInfo.url || resourceInfo.secure_url });
      } catch (apiErr) {
        // If cloudinary API says not found, surface that error for debugging
        console.warn('[extract-from-cloud] cloudinary.api.resource error', apiErr?.http_code || apiErr.message || apiErr);
        // continue - we'll try signed URL fallback below
        resourceInfo = null;
      }

      // 2) Prefer secure_url or url from resourceInfo when available (these are direct delivery links)
      if (resourceInfo && (resourceInfo.secure_url || resourceInfo.url)) {
        downloadUrl = resourceInfo.secure_url || resourceInfo.url;
        console.log('[extract-from-cloud] using resourceInfo url:', downloadUrl.slice(0, 100));
      } else {
        // 3) Fallback: generate a private (signed) download URL
        try {
          const expires_at = Math.floor(Date.now() / 1000) + 60; // 60s
          downloadUrl = cloudinary.v2.utils.private_download_url(public_id, format, {
            resource_type,
            type: 'upload',
            expires_at,
          });
          console.log('[extract-from-cloud] fallback signed url created:', downloadUrl.slice(0, 140));
        } catch (signErr) {
          console.error('[extract-from-cloud] failed to create signed url', signErr);
          return new Response(JSON.stringify({ error: 'Failed to build download URL', details: String(signErr) }), { status: 500 });
        }
      }
    }

    // At this point downloadUrl should be a valid URL we can GET
    if (!downloadUrl) {
      return new Response(JSON.stringify({ error: 'No download URL available' }), { status: 500 });
    }

    // Forward to Python extractor
    const extractorUrl = process.env.EXTRACTOR_URL || 'http://localhost:8000/extract';
    const pythonRes = await axios.post(extractorUrl, { url: downloadUrl }, { timeout: 120000 });

    return new Response(JSON.stringify(pythonRes.data), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('extract-from-cloud error', err?.response?.data || err.message || err);
    return new Response(JSON.stringify({ error: 'Extraction failed', details: String(err?.response?.data || err.message || err) }), { status: 500 });
  }
}
