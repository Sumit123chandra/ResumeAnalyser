// pages/index.js
import FileUpload from '../components/FileUpload';
import { useResumeStore } from '../store/useResumeStore';
import { useRouter } from 'next/router';

export default function Home() {
  const { jobDescription, setJobDescription } = useResumeStore();
  const router = useRouter();

  return (
    <div className="app-container">
      <h1 className="text-2xl font-bold mb-4">ResuMind — Resume Analyzer</h1>

      <section className="mb-6">
        <h2 className="font-semibold">1) Upload resume</h2>
        <FileUpload />
      </section>

      <section className="mb-6">
        <h2 className="font-semibold">2) Paste job description</h2>
        <textarea
          rows={8}
          value={jobDescription}
          onChange={(e) => setJobDescription(e.target.value)}
          className="w-full border p-2 rounded"
          placeholder="Paste job description here..."
        />
      </section>

      <div>
        <button
          className="px-4 py-2 rounded bg-green-600 text-white"
          onClick={() => router.push('/analyze')}
        >
          Analyze
        </button>
      </div>
    </div>
  );
}
