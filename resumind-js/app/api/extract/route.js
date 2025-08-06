// app/api/extract/route.js
export const runtime = 'nodejs'; // ensure server-side Node runtime

// Using pdfjs-dist to extract text server-side
export async function POST(req) {
  try {
    const formData = await req.formData();
    const file = formData.get('resume') || formData.get('file');

    if (!file) {
      return new Response(JSON.stringify({ error: 'No file uploaded. Use field "resume".' }), { status: 400 });
    }

    // Read file bytes
    const arrayBuffer = await file.arrayBuffer();
    const uint8 = new Uint8Array(arrayBuffer);

    // dynamic import (server-side) of pdfjs-dist
    const pdfjs = await import('pdfjs-dist/legacy/build/pdf.js');
    // ensure worker not loaded for Node
    pdfjs.GlobalWorkerOptions.workerSrc = null;

    // load document
    const loadingTask = pdfjs.getDocument({ data: uint8 });
    const pdf = await loadingTask.promise;

    let fullText = '';
    for (let i = 1; i <= pdf.numPages; i++) {
      try {
        const page = await pdf.getPage(i);
        const content = await page.getTextContent();
        const pageText = content.items.map((it) => it.str || '').join(' ');
        fullText += pageText + '\n';
      } catch (pageErr) {
        console.error(`[extract] error reading page ${i}:`, pageErr);
      }
    }

    await pdf.destroy?.();

    return new Response(JSON.stringify({ text: fullText }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('[extract] Unexpected error:', err);
    return new Response(JSON.stringify({ error: String(err) }), { status: 500 });
  }
}
