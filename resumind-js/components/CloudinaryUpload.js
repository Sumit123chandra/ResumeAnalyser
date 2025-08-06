// components/CloudinaryUpload.js
'use client';
import { useState } from 'react';
import axios from 'axios';
import { useResumeStore } from '../store/useResumeStore';

export default function CloudinaryUpload() {
  const [loading, setLoading] = useState(false);
  const { setResumeFileUrl, setResumeText } = useResumeStore();

  const CLOUD_NAME = 'dvv10dtck';      // <- your cloud name
  const UPLOAD_PRESET = 'resumind';    // <- your unsigned preset name

  const handleFile = async (file) => {
    if (!file) return alert('Choose a file');
    setLoading(true);
    try {
      const url = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/auto/upload`;
      const form = new FormData();
      form.append('file', file);
      form.append('upload_preset', UPLOAD_PRESET);
      form.append('resource_type', 'raw');

      const res = await axios.post(url, form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      // Save entire response object for debugging in console
      if (typeof window !== 'undefined') window.lastUpload = res.data;
      console.log('cloudinary upload response', res.data);

      // Prefer these (in order): secure_url, url, original_response secure_url-like fields
      const secureUrl = res?.data?.secure_url || res?.data?.url || res?.data?.secure_url_raw || null;

      // If secureUrl exists and works, use it. Otherwise try to construct raw URL fallback.
      let downloadUrl = secureUrl;
      if (!downloadUrl) {
        const { public_id, version } = res.data || {};
        if (!public_id) {
          throw new Error('Cloudinary response missing public_id');
        }
        const vSegment = version ? `v${version}` : '';
        // fallback guess — often not reliable but kept as last resort
        downloadUrl = `https://res.cloudinary.com/${CLOUD_NAME}/raw/upload/${vSegment}/${public_id}.pdf`;
        console.warn('[CloudinaryUpload] falling back to constructed raw URL:', downloadUrl);
      }

      setResumeFileUrl(downloadUrl);

      // Call Next API which forwards to Python extractor
      const extractRes = await axios.post('/api/extract-from-cloud', { url: downloadUrl });
      console.log('extract-from-cloud response', extractRes.data);

      if (extractRes.data?.text) {
        setResumeText(extractRes.data.text);
        alert('Upload & extraction successful. Go to Analyze page.');
      } else {
        console.warn('Extraction returned no text', extractRes.data);
        alert('Upload succeeded, but extraction returned no text. Check console.');
      }
    } catch (err) {
      console.error('Upload or extraction error', err);
      if (err?.response?.data) {
        console.error('Server response body:', err.response.data);
        alert('Server error: ' + JSON.stringify(err.response.data));
      } else {
        alert('Upload or extraction failed — check console for details.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-2">
      <input
        type="file"
        accept=".pdf"
        onChange={(e) => handleFile(e.target.files[0])}
      />
      {loading && <p className="text-sm text-gray-600">Uploading/extracting...</p>}
    </div>
  );
}
