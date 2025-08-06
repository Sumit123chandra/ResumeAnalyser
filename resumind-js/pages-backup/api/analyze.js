// pages/api/analyze.js
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  const { resumeText, jobDescription } = req.body;
  if (!resumeText || !jobDescription) return res.status(400).json({ error: 'Missing resume or jobDescription' });

  // Simple naive mock: count overlapping words and produce result
  const norm = (s) =>
    s
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, ' ')
      .split(/\s+/)
      .filter(Boolean);
  const rWords = new Set(norm(resumeText));
  const jdWords = norm(jobDescription);

  const matched = jdWords.filter(w => rWords.has(w));
  const uniqueJDWords = Array.from(new Set(jdWords));
  const score = Math.round((matched.length / Math.max(uniqueJDWords.length, 1)) * 100);

  // missing keywords: JD words not present
  const missing = uniqueJDWords.filter(w => !rWords.has(w)).slice(0, 20);

  const suggestions = [
    'Add specific keywords from the job description to your summary/bullets.',
    'Quantify achievements with numbers (e.g., reduced latency by 30%).',
    'Match tooling/skills order to the JD — put most relevant skills first.',
  ];

  return res.status(200).json({ score, missingKeywords: missing, suggestions });
}
