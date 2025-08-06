# app.py
from flask import Flask, request, jsonify
import requests
from PyPDF2 import PdfReader
from io import BytesIO
import time
import re
import os

app = Flask(__name__)

def download_with_retry(url, attempts=6, delay=1.0):
    last_error = None
    for i in range(1, attempts + 1):
        try:
            print(f'[extract] Attempt {i} to download: {url}')
            r = requests.get(url, timeout=20)
            print(f'[extract] HTTP status: {r.status_code}')
            if r.status_code == 200 and r.content:
                return r.content
            else:
                last_error = f'Non-200 or empty content: {r.status_code}'
        except Exception as e:
            last_error = str(e)
            print('[extract] download error:', last_error)
        time.sleep(delay)
    raise Exception(f'Failed to download file after {attempts} attempts. Last error: {last_error}')

# --- Simple resume parsing heuristics ---
EMAIL_RE = re.compile(r'([a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+)')
PHONE_RE = re.compile(r'(\+?\d[\d\s().-]{6,}\d)')  # permissive phone
GITHUB_RE = re.compile(r'(https?://github\.com/[A-Za-z0-9_.-]+)')
LINK_RE = re.compile(r'(https?://\S+)')

# small skills list — expand as needed
KNOWN_SKILLS = [
    "python","java","javascript","node.js","node","react","reactjs","next.js","next",
    "html","css","sql","postgresql","mongodb","aws","docker","kubernetes",
    "c++","c#","go","ruby","django","flask","spring","git","typescript"
]
SKILLS_RE = re.compile(r'\b(' + '|'.join([re.escape(s) for s in KNOWN_SKILLS]) + r')\b', re.IGNORECASE)

EDU_RE = re.compile(r'\b(B\.?Tech|Bachelor|Bachelors|B\.Sc|M\.Sc|M\.Tech|Master|MBA|Ph\.D|BS|MS)\b', re.IGNORECASE)
EXPERIENCE_HINTS = re.compile(r'\b(Experience|Work Experience|Internship|Intern|Projects|Company|Employer)\b', re.IGNORECASE)

def parse_resume(text):
    parsed = {}
    # Lines cleanup
    lines = [ln.strip() for ln in text.splitlines() if ln.strip()]
    parsed["lines_count"] = len(lines)

    # Heuristic name: first non-empty line (could be improved)
    parsed["name"] = lines[0] if lines else None

    # Emails and phones
    parsed["emails"] = list(dict.fromkeys(EMAIL_RE.findall(text)))  # unique in order
    parsed["phones"] = list(dict.fromkeys([re.sub(r'\s+', ' ', p).strip() for p in PHONE_RE.findall(text)]))

    # Links (github specially)
    githubs = GITHUB_RE.findall(text)
    parsed["github"] = githubs[0] if githubs else None
    # collect other links
    links = LINK_RE.findall(text)
    parsed["links"] = list(dict.fromkeys(links))

    # Skills
    skills_found = SKILLS_RE.findall(text)
    parsed["skills"] = sorted(list(set([s.lower() for s in skills_found])))

    # Education (grab lines that look like education)
    education = []
    for ln in lines:
        if EDU_RE.search(ln) or 'university' in ln.lower() or 'college' in ln.lower():
            education.append(ln)
    parsed["education"] = education

    # Experience: gather paragraphs/lines around hints
    experience = []
    for i, ln in enumerate(lines):
        if EXPERIENCE_HINTS.search(ln):
            # collect next few lines as experience block
            block = [ln]
            for j in range(i+1, min(i+6, len(lines))):
                block.append(lines[j])
            experience.append('\n'.join(block))
    parsed["experience_blocks"] = experience

    # Basic summary snippet: first 300 chars
    parsed["summary_snippet"] = text[:300].replace('\n', ' ').strip()

    return parsed

@app.route('/extract', methods=['POST'])
def extract():
    data = request.get_json() or {}
    url = data.get('url')
    if not url:
        return jsonify({'error': 'Missing url'}), 400
    try:
        pdf_bytes = download_with_retry(url)
        pdf_file = BytesIO(pdf_bytes)
        reader = PdfReader(pdf_file)
        text_parts = []
        for page_no, page in enumerate(reader.pages):
            try:
                t = page.extract_text()
                if t:
                    text_parts.append(t)
            except Exception as e:
                print('page error', page_no, e)
        full_text = '\n'.join(text_parts).strip()
        parsed = parse_resume(full_text)
        return jsonify({'text': full_text, 'parsed': parsed}), 200
    except Exception as e:
        print('extract error', repr(e))
        return jsonify({'error': 'Extraction failed', 'details': str(e)}), 500

if __name__ == '__main__':
    # Use PORT environment variable if set (for deploy later). Default to 8000 (your previous).
    port = int(os.environ.get("PORT", 8000))
    host = os.environ.get("HOST", "127.0.0.1")
    # debug False is fine for local dev; set True if you want auto-reload
    app.run(host=host, port=port, debug=False)
@app.route('/match', methods=['POST'])
def match_resume_to_jd():
    data = request.get_json() or {}
    resume_url = data.get('resume_url')
    jd_text = data.get('jd')
    if not resume_url or not jd_text:
        return jsonify({'error': 'Missing resume_url or jd'}), 400

    try:
        # Step 1: Extract resume text + parse
        pdf_bytes = download_with_retry(resume_url)
        pdf_file = BytesIO(pdf_bytes)
        reader = PdfReader(pdf_file)
        text_parts = []
        for page_no, page in enumerate(reader.pages):
            try:
                t = page.extract_text()
                if t:
                    text_parts.append(t)
            except Exception as e:
                print('page error', page_no, e)
        resume_text = '\n'.join(text_parts).strip()
        parsed_resume = parse_resume(resume_text)

        # Step 2: Extract skills from JD
        jd_skills_found = SKILLS_RE.findall(jd_text)
        jd_skills = sorted(set([s.lower() for s in jd_skills_found]))

        # Step 3: Compare
        resume_skills = set(parsed_resume.get("skills", []))
        matched = sorted(resume_skills.intersection(jd_skills))
        missing = sorted(set(jd_skills) - resume_skills)

        if jd_skills:
            match_score = round(len(matched) / len(jd_skills) * 100, 2)
        else:
            match_score = 0.0

        return jsonify({
            "resume_parsed": parsed_resume,
            "jd_skills": jd_skills,
            "matched_skills": matched,
            "missing_skills": missing,
            "match_score": match_score
        }), 200

    except Exception as e:
        print('match error', repr(e))
        return jsonify({'error': 'Matching failed', 'details': str(e)}), 500
