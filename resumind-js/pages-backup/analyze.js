// pages/analyze.js
import { useEffect, useState } from 'react';
import { useResumeStore } from '../store/useResumeStore';
import axios from 'axios';

export default function AnalyzePage() {
  const { resumeText, jobDescription, analysis, setAnalysis, resumeFileUrl } = useResumeStore();
  const [loading, setLoading] = useState(false);
  const [local, setLocal] = useState(null);

  useEffect(() => {
    const doAnalyze = async () => {
      if (!resumeText || !jobDescription) return;
      setLoading(true);
      try {
        const res = await axios.post('/api/analyze', { resumeText, jobDescription });
        setAnalysis(res.data);
        setLocal(res.data);
      } catch (err) {
        console.error(err);
        alert('Analysis failed. See console.');
      } finally {
        setLoading(false);
      }
    };
    doAnalyze();
  }, [resumeText, jobDescription, setAnalysis]);

  if (!resumeText || !jobDescription) {
    return <div className="app-container">Please upload a resume and paste a job description first.</div>;
  }
  if (loading) return <div className="app-container">Analyzing... (this may take a few seconds)</div>;
  if (!local) return <div className="app-container">No analysis yet.</div>;

  return (
    <div className="app-container">
      <h2 className="text-xl font-bold">Score: {local.score ?? '—'}</h2>

      <h3 className="mt-4 font-semibold">Missing Keywords</h3>
      <ul className="list-disc ml-6">
        {(local.missingKeywords || []).map((k, i) => <li key={i}>{k}</li>)}
      </ul>

      <h3 className="mt-4 font-semibold">Suggestions</h3>
      <ol className="list-decimal ml-6">
        {(local.suggestions || []).map((s, i) => <li key={i}>{s}</li>)}
      </ol>

      {resumeFileUrl && (
        <div className="mt-6">
          <h3 className="font-semibold">Resume Preview</h3>
          <iframe src={resumeFileUrl} style={{width: '100%', height: 600}} />
        </div>
      )}
    </div>
  );
}
