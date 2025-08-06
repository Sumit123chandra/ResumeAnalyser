// pages/api/extract.js
import fs from 'fs';
import formidable from 'formidable';
import pdfParse from 'pdf-parse';

export const config = { api: { bodyParser: false } };

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const form = new formidable.IncomingForm();
  form.parse(req, async (err, fields, files) => {
    if (err) return res.status(500).json({ error: 'Form parse error' });
    const file = files.resume || files.file;
    if (!file) return res.status(400).json({ error: 'No file uploaded' });

    try {
      // different formidable versions use .filepath or .path
      const path = file.filepath || file.path;
      const buffer = fs.readFileSync(path);
      const data = await pdfParse(buffer);
      const text = (data && data.text) ? data.text : '';
      // Optionally upload file to Cloudinary / Puter and return previewUrl.
      return res.status(200).json({ text /*, previewUrl: 'https://...' */ });
    } catch (e) {
      console.error(e);
      return res.status(500).json({ error: 'Extraction failed', details: e.message });
    }
  });
}
