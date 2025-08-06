// pages/api/match.js
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { resumeText, jobDescription } = req.body;

    if (!resumeText || !jobDescription) {
      return res.status(400).json({ error: 'Missing resumeText or jobDescription' });
    }

    // Flask backend URL
    const flaskUrl = 'http://127.0.0.1:5000/match';

    // Forward the data to Flask
    const flaskRes = await fetch(flaskUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ resumeText, jobDescription }),
    });

    const flaskData = await flaskRes.json();

    return res.status(flaskRes.status).json(flaskData);
  } catch (error) {
    console.error('Error calling Flask backend:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}
