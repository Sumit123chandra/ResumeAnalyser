ResuMind: AI-Powered Resume Analyzer
ResuMind is a modern web application that helps job seekers optimize their resumes by providing an instant match score against any job description. This tool simulates the behavior of an Applicant Tracking System (ATS) to give users actionable feedback, including missing keywords and personalized suggestions.

Live Demo: https://resume-analyser-henna.vercel.app/

Features
Resume-to-JD Matching: Get an instant match score (0-100%) by comparing your resume against a specific job description.

Keyword Gap Analysis: The AI identifies and lists critical keywords from the job description that are missing from your resume.

Actionable Suggestions: Receive tailored tips and advice on how to improve your resume to better fit the role.

User-Friendly UI: A clean, professional, and responsive user interface makes the process fast and intuitive.

Secure File Uploads: Resumes are uploaded to Cloudinary for secure storage and a visual PDF preview.

Technology Stack
Frontend: Next.js (App Router), React, Tailwind CSS, and Zustand for state management, Gemini AI API.

Backend: A lightweight Python microservice using Flask and PyPDF2 for robust PDF text extraction.

AI: Google Gemini API for performing the resume analysis and generating structured feedback.

Hosting:

Next.js App: Deployed on Vercel.

Python Service: Deployed on Render.

Getting Started (Local Development)
To run this project on your local machine, follow these steps:

Clone the Repository:

git clone https://github.com/Sumit123chandra/ResumeAnalyser.git
cd ResumeAnalyser

Set Up the Next.js App:

cd resumind-js
npm install
# Set up your environment variables in a .env.local file (see below)
npm run dev

Set Up the Python Extractor:

cd python-extractor
python -m venv venv
.\venv\Scripts\Activate.ps1 # for Windows PowerShell
# or `source venv/bin/activate` for macOS/Linux
pip install -r requirements.txt
python app.py

Environment Variables (.env.local)
You need to create a .env.local file in your resumind-js directory and add your API keys.

# Google Gemini API Key
GEMINI_API_KEY=your_gemini_api_key_here

# Cloudinary Credentials
CLOUDINARY_CLOUD_NAME=dvv10dtck
CLOUDINARY_API_KEY=YOUR_CLOUDINARY_API_KEY
CLOUDINARY_API_SECRET=YOUR_CLOUDINARY_API_SECRET

# Python Extractor URL (for local development)
EXTRACTOR_URL=https://resumeanalyser-vc95.onrender.com

How It Works
User uploads a resume via the browser.

The file is securely sent to Cloudinary, which returns a public_id.

Your Next.js API route receives the public_id and forwards a signed download URL to the Python extractor.

The Python extractor downloads the PDF and uses PyPDF2 to extract the text.

The extracted text is sent to the /api/analyze endpoint in your Next.js app.

The Next.js API sends a prompt to the Google Gemini API for analysis.

The AI returns a JSON object with the score, missing keywords, and suggestions, which is then displayed on the front end.


I hope this README serves you well. Let me know if you need any other changes!

