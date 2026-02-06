import axios from "axios";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST(req) {
  try {
    const { resumeUrl, jobDescription } = await req.json();

    if (!resumeUrl || !jobDescription) {
      return NextResponse.json(
        { error: "Missing resumeUrl or jobDescription" },
        { status: 400 }
      );
    }

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        { error: "Gemini API key missing" },
        { status: 500 }
      );
    }

    // 🔹 Step 1: Call Flask to extract + parse
    const backendRes = await axios.post(
      `${process.env.BACKEND_URL}/extract`,
      { url: resumeUrl }
    );

    const resumeText = backendRes.data.text;

    // 🔹 Step 2: Send to Gemini
    const prompt = `
Compare the resume with the job description.
Return ONLY valid JSON:
{
  "score": number,
  "missingKeywords": string[],
  "suggestions": string[]
}

Resume:
${resumeText}

Job Description:
${jobDescription}
`;

    const geminiRes = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        contents: [{ parts: [{ text: prompt }] }],
      }
    );

    const rawText =
      geminiRes.data.candidates[0].content.parts[0].text;

    const cleanJson = rawText.replace(/```json|```/g, "").trim();
    const parsed = JSON.parse(cleanJson);

    return NextResponse.json(parsed, { status: 200 });

  } catch (err) {
    console.error("Analyze error:", err.response?.data || err.message);
    return NextResponse.json(
      { error: "Analysis failed", details: err.message },
      { status: 500 }
    );
  }
}
