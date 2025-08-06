'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import { useResumeStore } from '../../store/useResumeStore';
import { useRouter } from 'next/navigation';

export default function AnalyzePage() {
  const { resumeText, jobDescription, resumeFileUrl, analysis, setAnalysis } = useResumeStore();
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (!resumeText || !jobDescription) {
      router.push('/');
      return;
    }

    if (!analysis) {
      const doAnalyze = async () => {
        setLoading(true);
        try {
          const res = await axios.post('/api/analyze', { resumeText, jobDescription });
          setAnalysis(res.data);
        } catch (err) {
          console.error('Analysis API call failed:', err);
          let errorMessage = 'Analysis failed. Please try again.';
          if (err.response && err.response.data && err.response.data.details) {
            errorMessage = `Analysis failed: ${err.response.data.details}`;
          } else if (err.message) {
            errorMessage = `Analysis failed: ${err.message}`;
          }
          alert(errorMessage);
        } finally {
          setLoading(false);
        }
      };
      doAnalyze();
    }
  }, [resumeText, jobDescription, analysis, setAnalysis, router]);

  if (!resumeText || !jobDescription) {
    return (
      <div className="bg-gray-900 min-h-screen p-8 text-gray-100 flex flex-col items-center justify-center text-center">
        <p className="text-xl text-gray-400 mb-4">It looks like you haven't uploaded a resume or pasted a job description yet.</p>
        <button
          onClick={() => router.push('/')}
          className="px-6 py-3 bg-blue-600 text-white rounded-full text-lg font-semibold hover:bg-blue-700 transition-colors duration-300 shadow-lg"
        >
          Go Back to Home
        </button>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="bg-gray-900 min-h-screen p-8 text-gray-100 flex flex-col items-center justify-center text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500 mb-4"></div>
        <p className="text-xl text-gray-300 animate-pulse">Analyzing your resume... This might take a moment.</p>
      </div>
    );
  }

  if (!analysis) {
    return (
      <div className="bg-gray-900 min-h-screen p-8 text-gray-100 flex flex-col items-center justify-center text-center">
        <p className="text-xl text-gray-400 mb-4">No analysis results available. Something might have gone wrong.</p>
        <button
          onClick={() => router.push('/')}
          className="px-6 py-3 bg-red-600 text-white rounded-full text-lg font-semibold hover:bg-red-700 transition-colors duration-300 shadow-lg"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="bg-gray-900 min-h-screen p-8 text-gray-100 font-sans">
      <div className="max-w-4xl mx-auto space-y-10 animate-fade-in">
        <header className="text-center">
          <h1 className="text-5xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-green-500">
            Analysis Complete!
          </h1>
          <p className="mt-2 text-lg text-gray-400">See how well your resume matches the job description.</p>
        </header>

        <main className="space-y-8">
          <div className="bg-gray-800 p-8 rounded-3xl shadow-2xl transition-all duration-300 hover:shadow-blue-500/20 transform animate-slide-up">
            <div className="flex flex-col items-center justify-center space-y-4">
              <h2 className="text-2xl font-semibold text-blue-300">Overall Match Score</h2>
              <span className="text-7xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-teal-500">
                {analysis.score || 'N/A'}%
              </span>
              <p className="text-gray-400 text-center">
                This score indicates how well your resume aligns with the job description.
              </p>
            </div>
          </div>

          {analysis.missingKeywords && analysis.missingKeywords.length > 0 && (
            <div className="bg-gray-800 p-8 rounded-3xl shadow-2xl transition-all duration-300 hover:shadow-red-500/20 transform animate-fade-in-late">
              <h3 className="text-2xl font-semibold mb-4 text-red-400">Missing Keywords</h3>
              <ul className="list-disc list-inside text-gray-300 space-y-2">
                {analysis.missingKeywords.map((k, i) => (
                  <li key={i} className="flex items-center text-lg">
                    <span className="text-red-500 mr-2">&#x2717;</span> {k}
                  </li>
                ))}
              </ul>
              <p className="mt-4 text-gray-400 text-sm">
                Consider incorporating these terms into your resume where relevant to improve your match.
              </p>
            </div>
          )}

          {analysis.suggestions && analysis.suggestions.length > 0 && (
            <div className="bg-gray-800 p-8 rounded-3xl shadow-2xl transition-all duration-300 hover:shadow-purple-500/20 transform animate-slide-up-late">
              <h3 className="text-2xl font-semibold mb-4 text-purple-400">Suggestions for Improvement</h3>
              <ol className="list-decimal list-inside text-gray-300 space-y-2">
                {analysis.suggestions.map((s, i) => (
                  <li key={i} className="text-lg">
                    {s}
                  </li>
                ))}
              </ol>
              <p className="mt-4 text-gray-400 text-sm">
                These actionable tips can help you further optimize your resume for this role.
              </p>
            </div>
          )}

          {resumeFileUrl && (
            <div className="mt-8 bg-gray-800 p-8 rounded-3xl shadow-2xl transition-all duration-300 hover:shadow-teal-500/20 transform animate-fade-in-late">
              <h3 className="text-2xl font-semibold mb-4 text-teal-400">Resume Preview</h3>
              <div className="bg-gray-700 rounded-lg shadow-inner overflow-hidden border border-gray-600">
                <iframe src={resumeFileUrl} className="w-full h-[700px] border-0" title="Resume Preview" />
              </div>
              <p className="mt-4 text-gray-400 text-sm">
                This is a preview of the resume you uploaded.
              </p>
            </div>
          )}
        </main>

        <footer className="text-center pt-8">
          <button
            onClick={() => router.push('/')}
            className="px-8 py-3 bg-gradient-to-r from-gray-600 to-gray-700 text-white rounded-full text-lg font-semibold hover:from-gray-700 hover:to-gray-800 transition-all duration-300 shadow-lg hover:scale-105"
          >
            Analyze Another Resume
          </button>
        </footer>
      </div>
    </div>
  );
}