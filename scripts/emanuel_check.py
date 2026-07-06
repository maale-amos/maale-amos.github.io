"""Parse Emanuel's edited.txt into sections + texts.
Compare against current _site/index.html and sub-pages.
Report missing / matched / extra texts.
"""
import re, os, sys, pathlib, json, io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')

ROOT = pathlib.Path(__file__).parent.parent
SRC = ROOT / '_emanuel_edits' / 'edited.txt'
SITE = ROOT / '_site' / 'index.html'
OUT = ROOT / 'audit' / 'emanuel_check.md'

text = SRC.read_text(encoding='utf-8')

# Split into per-section blocks. Sections start with:  "מזהה טכני של הסקציה: #<id>"
section_marker = re.compile(r'מזהה טכני של הסקציה:\s*#([a-zA-Z0-9-]+)')
raw_positions = [(m.start(), m.group(1)) for m in section_marker.finditer(text)]
raw_positions.append((len(text), None))

sections = {}
for i in range(len(raw_positions) - 1):
    start, sid = raw_positions[i]
    end = raw_positions[i+1][0]
    block = text[start:end]
    # extract lines that look like content — skip labels
    lines = [l.strip() for l in block.split('\n') if l.strip()]
    texts = []
    for l in lines:
        # skip metadata labels
        if any(l.startswith(prefix) for prefix in [
            'מזהה טכני', 'קישור ישיר', 'צילום מסך', 'טקסטים בסקציה',
            'איפה זה באתר', 'כותרות:', 'פסקאות:', 'כפתורים:', 'תוויות', 'שדות טופס',
            'טקסטים לנגישות', 'נגישות:', 'קישורים:'
        ]):
            continue
        # skip label separators like "— כותרת סקציה —"
        if l.startswith('—') or l.startswith('---'): continue
        # skip TOC lines like "9. גלריית תמונות"
        if re.match(r'^\d+\.\s', l) and '·' in l: continue
        # strip leading bullet
        if l.startswith('•'):
            l = l[1:].strip()
        if len(l) < 3 or len(l) > 300: continue
        if re.match(r'^[\d\W]+$', l): continue
        texts.append(l)
    sections[sid] = texts

# Load site HTML (all pages combined)
site_pages = list((ROOT / '_site').rglob('*.html'))
haystack = '\n'.join(p.read_text(encoding='utf-8', errors='replace') for p in site_pages)
# Normalize whitespace in haystack too so comparison actually works
haystack_norm = re.sub(r'\s+', ' ', haystack)

report = ['# Emanuel edited.txt vs _site cross-check', '',
          f'Sections found in doc: **{len(sections)}**', '']

for sid, texts in sections.items():
    matched = 0
    missing = []
    for t in texts:
        # Normalize whitespace for comparison
        norm = re.sub(r'\s+', ' ', t).strip()
        if not norm: continue
        # Try substring match against site
        if norm in haystack_norm:
            matched += 1
        else:
            missing.append(t)
    report.append(f'## #{sid} ({len(texts)} texts · matched {matched} · missing {len(missing)})')
    if missing:
        for m in missing[:10]:
            report.append(f'  - MISSING: `{m[:120]}`')
        if len(missing) > 10:
            report.append(f'  … ({len(missing)-10} more)')
    report.append('')

OUT.parent.mkdir(parents=True, exist_ok=True)
OUT.write_text('\n'.join(report), encoding='utf-8')

# terminal summary
tot_missing = sum(1 for sid in sections for m in sections[sid] if re.sub(r'\s+', ' ', m).strip() and re.sub(r'\s+', ' ', m).strip() not in haystack_norm)
tot_texts = sum(len(v) for v in sections.values())
print(f'sections: {len(sections)} · texts: {tot_texts} · matched: {tot_texts - tot_missing} · missing: {tot_missing}')
print(f'report → {OUT}')
