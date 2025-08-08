'use client';
import { useState } from 'react';
import axios from 'axios';
import { useResumeStore } from '../store/useResumeStore';
import { Loader2, FileText } from 'lucide-react';

export default function CloudinaryUpload() {
  const [loading, setLoading] = useState(false);
  const { setResumeFileUrl, setResumeText, setAnalysis } = useResumeStore();

  const CLOUD_NAME = 'dvv10dtck';
  const UPLOAD_PRESET = 'resumind';

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

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

      if (typeof window !== 'undefined') window.lastUpload = res.data;
      console.log('cloudinary upload response', res.data);

      const { public_id, secure_url } = res.data;
      const payload = { public_id, url: secure_url, resource_type: 'raw', format: 'pdf' };
      
      const extractRes = await axios.post('/api/extract-from-cloud', payload);
      console.log('extract-from-cloud response', extractRes.data);

      if (extractRes.data?.text) {
        setResumeText(extractRes.data.text);
        setResumeFileUrl(res.data.secure_url);
        setAnalysis(null);
        alert('Upload & extraction successful. Go to Analyze page.');
      } else {
        console.warn('Extraction returned no text', extractRes.data);
        alert('Upload succeeded, but extraction returned no text. Check console.');
      }
    } catch (err) {
      console.error('Upload or extraction error', err.response?.data || err.message || err);
      const errorMessage = err.response?.data?.details || err.message || 'Unknown error during upload or extraction.';
      alert(`Error: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center p-4">
      <label htmlFor="file-upload" className="cursor-pointer bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-full transition-all duration-300 shadow-lg hover:shadow-blue-500/50">
        {loading ? (
          <span className="flex items-center">
            <Loader2 className="animate-spin mr-2 text-white" size={20} /> Uploading and Extracting...
          </span>
        ) : (
          <span className="flex items-center">
            <FileText className="mr-2" size={20} /> Choose PDF File
          </span>
        )}
      </label>
      <input
        id="file-upload"
        type="file"
        accept=".pdf"
        onChange={(e) => handleFile(e)}
        className="hidden"
        disabled={loading}
      />
      {loading && <p className="mt-2 text-sm text-gray-300">Processing resume...</p>}
    </div>
  );
}