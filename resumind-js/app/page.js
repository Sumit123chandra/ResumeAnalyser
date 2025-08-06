'use client';
import { useState } from 'react';
import axios from 'axios';
import { useResumeStore } from '../store/useResumeStore';
import { useRouter } from 'next/navigation';
import CloudinaryUpload from '../components/CloudinaryUpload';

export default function HomePage() {
  const { resumeText, jobDescription, setJobDescription } = useResumeStore();
  const router = useRouter();

  const isReadyForAnalyze = resumeText.trim() && jobDescription.trim();

  return (
    <div className="bg-gray-950 min-h-screen p-8 text-gray-100 font-sans"> {/* Darker background */}
      <div className="max-w-3xl mx-auto space-y-10">
        <header className="text-center">
          <h1 className="text-5xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-indigo-600 animate-fade-in"> {/* Subtler gradient */}
            ResuMind
          </h1>
          <p className="mt-2 text-lg text-gray-400 animate-slide-up">
            AI-powered resume analysis for a perfect job fit.
          </p>
        </header>

        <main className="space-y-6 animate-fade-in-late">
          <div className="bg-gray-800 p-6 rounded-3xl shadow-xl transition-all duration-300 hover:shadow-blue-700/30 hover:scale-[1.01] transform"> {/* Refined shadow */}
            <h2 className="text-2xl font-semibold mb-4 text-blue-400"> {/* Consistent blue accent */}
              <span className="text-gray-400">1.</span> Upload your Resume
            </h2>
            <div className="border border-gray-700 rounded-lg p-4 bg-gray-700"> {/* Darker border */}
              <CloudinaryUpload />
            </div>
          </div>

          <div className="bg-gray-800 p-6 rounded-3xl shadow-xl transition-all duration-300 hover:shadow-indigo-700/30 hover:scale-[1.01] transform"> {/* Refined shadow */}
            <h2 className="text-2xl font-semibold mb-4 text-indigo-400"> {/* Consistent indigo accent */}
              <span className="text-gray-400">2.</span> Paste Job Description
            </h2>
            <textarea
              rows={8}
              className="w-full border border-gray-700 rounded-lg p-4 bg-gray-700 text-gray-200 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300"
              placeholder="Paste the job description here..."
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
            />
          </div>

          <div className="text-center pt-4">
            <button
              className={`px-10 py-4 text-lg font-bold rounded-full transition-all duration-300 transform ${
                isReadyForAnalyze
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-700 text-white hover:from-blue-700 hover:to-indigo-800 hover:scale-105 shadow-lg' /* Removed animate-pulse */
                  : 'bg-gray-700 text-gray-400 cursor-not-allowed shadow-md' /* Muted disabled state */
              }`}
              onClick={() => router.push('/analyze')}
              disabled={!isReadyForAnalyze}
            >
              Analyze Resume
            </button>
          </div>
        </main>

        <section className="mt-8 bg-gray-800 p-6 rounded-3xl shadow-xl transition-all duration-300 hover:shadow-purple-700/30 hover:scale-[1.01] transform"> {/* Refined shadow */}
          <h3 className="text-xl font-semibold text-purple-400">Extracted resume text preview</h3>
          <div className="whitespace-pre-wrap border border-gray-700 p-4 mt-2 rounded-lg bg-gray-700 min-h-[120px] text-gray-300 text-sm overflow-auto max-h-96">
            {resumeText || <i className="text-gray-500">No extracted text yet — upload a PDF</i>}
          </div>
        </section>
      </div>
    </div>
  );
}