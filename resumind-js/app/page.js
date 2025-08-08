'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useResumeStore } from '../store/useResumeStore';
import CloudinaryUpload from '../components/CloudinaryUpload';
import { ChevronRight, CheckCircle } from 'lucide-react';
import ParticlesBackground from "@/components/ParticlesBackground";

const sampleJDs = {
  "Full Stack Developer": `
We are seeking a Full-Stack Developer with expertise in web technologies to develop and maintain web applications.

Required Skills:
- JavaScript, React, Node.js, Express.js
- MongoDB, PostgreSQL
- Git, RESTful APIs

Preferred Skills:
- TypeScript, Next.js, AWS, Docker
  `,

  "Data Scientist": `
We are looking for a Data Scientist to build machine learning models, analyze data, and derive actionable insights.

Required Skills:
- Python, R, SQL, Machine Learning
- Scikit-learn, Pandas, Statistics

Preferred Skills:
- TensorFlow, PyTorch, Data Visualization
  `,

  "Software Engineer": `
We are hiring a Software Engineer to develop efficient, scalable, and maintainable software systems.

Required Skills:
- Java, Python, C++
- Data Structures, Algorithms
- Git, REST APIs, SQL

Preferred Skills:
- AWS, Docker, Microservices Architecture
  `,

  "UI/UX Designer": `
We need a creative UI/UX Designer to craft intuitive, user-centered designs for our digital platforms.

Required Skills:
- UI Design, UX Research, Prototyping
- Figma, Sketch, HTML, CSS

Preferred Skills:
- Adobe XD, User Testing, Responsive Design
  `,

  "Project Manager": `
We are hiring a Project Manager to lead software development projects from initiation to closure.

Required Skills:
- Agile, Scrum, Kanban
- JIRA, Asana, Trello
- Communication, Leadership

Preferred Skills:
- Budgeting, Risk Management, Client Handling
  `,

  "DevOps Engineer": `
Seeking a DevOps Engineer to automate deployment pipelines and manage infrastructure.

Required Skills:
- CI/CD, Jenkins, GitHub Actions
- Docker, Kubernetes, AWS

Preferred Skills:
- Terraform, Ansible, Monitoring Tools (Prometheus/Grafana)
  `,

  "Frontend Developer": `
We are looking for a Frontend Developer skilled in building responsive web interfaces.

Required Skills:
- HTML, CSS, JavaScript
- React, Redux, Tailwind CSS

Preferred Skills:
- Next.js, Webpack, Testing Libraries
  `,

  "Backend Developer": `
Join us as a Backend Developer to build secure and scalable APIs and services.

Required Skills:
- Node.js, Express.js, MongoDB
- RESTful APIs, Authentication, SQL

Preferred Skills:
- GraphQL, Redis, Microservices
  `,

  "AI/ML Engineer": `
We are hiring an AI/ML Engineer to design and implement machine learning models and AI solutions.

Required Skills:
- Python, Scikit-learn, TensorFlow, PyTorch
- Data Preprocessing, Model Evaluation

Preferred Skills:
- LLMs, NLP, HuggingFace Transformers
  `,

  "Business Analyst": `
We are looking for a Business Analyst to gather requirements and optimize business processes.

Required Skills:
- Data Analysis, Requirements Gathering, UML
- Excel, SQL, Power BI

Preferred Skills:
- Agile Methodologies, Stakeholder Communication
  `
};


export default function HomePage() {
  const { resumeText, jobDescription, setJobDescription, setAnalysis } = useResumeStore();
  const router = useRouter();
  const [selectedJob, setSelectedJob] = useState('');

  const isReadyForAnalyze = resumeText.trim() && jobDescription.trim();

  const handleSelectJD = (event) => {
    const jobTitle = event.target.value;
    setSelectedJob(jobTitle);
    setJobDescription(sampleJDs[jobTitle] ? sampleJDs[jobTitle].trim() : '');
    setAnalysis(null);
  };

  useEffect(() => {
    setAnalysis(null);
  }, [setAnalysis]);

  return (
    <>
      <ParticlesBackground />
      <main className="relative z-10 text-white min-h-screen">
        <header className="backdrop-blur- bg-white/10 border-b border-white/20 shadow-sm py-4 px-6">
          <nav className="max-w-7xl mx-auto flex justify-between items-center">
            <h1 className="text-3xl font-extrabold text-cyan-500 drop-shadow-lg">ResuMind</h1>
          </nav>
        </header>

        <div className="max-w-7xl mx-auto px-4 py-10">
          <div className="text-center mb-12">
            <h2 className="text-4xl lg:text-5xl font-bold text-cyan-500 drop-shadow-md">
              Analyze Your Resume. Get Hired Faster.
            </h2>
            <p className="mt-4 text-lg text-gray-300 max-w-2xl mx-auto">
              Upload your resume and paste or select a job description to get an instant match score and personalized suggestions.
            </p>
          </div>

          <main className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Resume Upload Section */}
            <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-6 shadow-xl">
              <h3 className="text-xl font-semibold text-white mb-4">
                1. Upload Your Resume (PDF)
              </h3>
              <p className="text-gray-300 mb-4 text-sm">
                Upload your resume in PDF format. We'll extract the text for analysis.
              </p>
              <div className="rounded-xl p-6 text-center bg-white/10 backdrop-blur-md border border-white/20 transition duration-300 hover:shadow-2xl">
                <CloudinaryUpload />
                {resumeText && (
                  <p className="mt-4 text-md text-green-400 flex items-center justify-center">
                    <CheckCircle size={16} className="mr-2" /> Resume uploaded and extracted!
                  </p>
                )}
              </div>
            </div>

            {/* JD Input Section */}
            <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-6 shadow-xl">
              <h3 className="text-xl font-semibold text-white mb-4">
                2. Paste or Select Job Description
              </h3>
              <p className="text-gray-300 mb-4 text-sm">
                Copy and paste the full job description or choose from our examples.
              </p>
              <div className="mb-4">
                {/* <select
                  onChange={handleSelectJD}
                  value={selectedJob}
                  className="w-full rounded-lg px-4 py-3 text-gray-800 bg-white shadow-inner focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">-- Select a Job Title --</option>
                  {Object.keys(sampleJDs).map(jobTitle => (
                    <option key={jobTitle} value={jobTitle}>{jobTitle}</option>
                  ))}
                </select> */}
                <select
                  onChange={handleSelectJD}
                  value={selectedJob}
                  className="w-full border border-gray-300 rounded-lg p-3 text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300 cursor-pointer"
                >
                  <option value="">-- Select a Job Title --</option>
                  {Object.keys(sampleJDs).map(jobTitle => (
                    <option key={jobTitle} value={jobTitle}>{jobTitle}</option>
                  ))}
                </select>
                {selectedJob && (
                  <p className="text-sm text-blue-400 mt-2">
                    JD auto-filled for <strong>{selectedJob}</strong>. You can still edit it.
                  </p>
                )}
              </div>
              <textarea
                rows={10}
                className="w-full p-4 rounded-lg bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-inner"
                placeholder="Or paste your job description here..."
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
              />
            </div>
          </main>

          {/* Analyze Button */}
          <div className="text-center mt-10">
            <button
              className={`px-10 py-4 text-lg font-bold rounded-full transition-all duration-300 transform shadow-lg ${
                isReadyForAnalyze
                  ? 'bg-blue-600 text-white hover:bg-blue-700 hover:scale-105'
                  : 'bg-gray-500 text-gray-300 cursor-not-allowed'
              }`}
              onClick={() => router.push('/analyze')}
              disabled={!isReadyForAnalyze}
            >
              Analyze My Resume
              <ChevronRight size={20} className="inline-block ml-2 -mr-1" />
            </button>
          </div>

          {/* Resume Preview */}
          {resumeText && (
            <section className="mt-10 bg-white/10 backdrop-blur-md border border-white/20 p-6 rounded-xl shadow-xl">
              <h3 className="text-xl font-semibold text-white mb-4">Extracted Resume Text Preview</h3>
              <div className="whitespace-pre-wrap p-4 rounded-lg bg-gray-900 text-gray-300 text-sm overflow-auto max-h-96 border border-gray-700">
                {resumeText}
              </div>
              <p className="mt-3 text-sm text-gray-300">
                This is the text extracted from your uploaded PDF. Ensure it looks correct.
              </p>
            </section>
          )}
        </div>
      </main>
    </>
  );
}
