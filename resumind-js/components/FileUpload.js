// components/FileUpload.js
import { useState } from 'react';
import axios from 'axios';
import { useResumeStore } from '../store/useResumeStore';
import { useRouter } from 'next/router';

export default function FileUpload() {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const { setResumeFileUrl, setResumeText } = useResumeStore();
  const router = useRouter();

  const handleChange = (e) => setFile(e.target.files[0]);

  const handleUpload = async () => {
    if (!file) return alert('Choose a file (PDF recommended)');

    const form = new FormData();
    form.append('resume', file);

    try {
      setLoading(true);
      const res = await axios.post('/api/extract', form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setResumeText(res.data.text || '');
      if (res.data.previewUrl) setResumeFileUrl(res.data.previewUrl);

      router.push('/analyze');
    } catch (err) {
      console.error(err);
      alert('Upload or extraction failed. See console.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 border rounded">
      <input type="file" accept=".pdf,.docx" onChange={handleChange} />
      <div className="mt-2">
        <button
          className="px-4 py-2 rounded bg-blue-600 text-white"
          onClick={handleUpload}
          disabled={loading}
        >
          {loading ? 'Uploading...' : 'Upload & Extract'}
        </button>
      </div>
    </div>
  );
}
