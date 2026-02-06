// app/api/analyze/route.js
import axios from 'axios';
import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

export async function POST(req) {
  try {
    const { resumeText, jobDescription } = await req.json();

    if (!resumeText || !jobDescription) {
      return NextResponse.json(
        { error: 'Missing resumeText or jobDescription' },
        { status: 400 }
      );
    }

    if (!process.env.GEMINI_API_KEY) {
      console.error('GEMINI_API_KEY is not set');
      return NextResponse.json(
        { error: 'Server configuration error: Gemini API key is missing.' },
        { status: 500 }
      );
    }

    const prompt = `
Compare the following resume against the job description.
Provide a match score from 0 to 100, a list of missing keywords from the job description,
and three short suggestions for improvement.

Respond with a JSON object ONLY, with the following keys:
- score (number)
- missingKeywords (array of strings)
- suggestions (array of 3 strings)

---
Resume:
${resumeText}

---
Job Description:
${jobDescription}
`;

    const geminiRes = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        contents: [{ parts: [{ text: prompt }] }],
      },
      {
        headers: { 'Content-Type': 'application/json' },
      }
    );

    const geminiResponseText =
      geminiRes.data?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!geminiResponseText) {
      console.error('Empty Gemini response:', geminiRes.data);
      return NextResponse.json(
        { error: 'Empty response from Gemini' },
        { status: 500 }
      );
    }

    // ✅ CLEAN markdown
    const cleanJsonString = geminiResponseText
      .replace(/```json|```/g, '')
      .trim();

    // ✅ SAFETY NET (THIS IS THE IMPORTANT PART)
    let parsedData;
    try {
      parsedData = JSON.parse(cleanJsonString);
    } catch (parseError) {
      console.error('Invalid JSON from Gemini:', cleanJsonString);
      return NextResponse.json(
        {
          error: 'Gemini returned invalid JSON',
          rawResponse: cleanJsonString,
        },
        { status: 500 }
      );
    }

    return NextResponse.json(parsedData, { status: 200 });

  } catch (err) {
    console.error('Gemini API error:', err.response?.data || err.message);
    return NextResponse.json(
      {
        error: 'Gemini analysis failed',
        details: err.response?.data || err.message,
      },
      { status: 500 }
    );
  }
}
