#!/usr/bin/env python3
"""Bundle the site into ONE self-contained HTML file (dist/ielts-prepsite.html).
Not needed for Vercel (it serves the folder as is). Handy for previews or emailing the app.
Run from the project root:  python3 tools/build_preview.py
"""
import os, re, sys
root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
html = open(os.path.join(root, "index.html"), encoding="utf-8").read()

def read(rel):
    return open(os.path.join(root, rel), encoding="utf-8").read()

# inline stylesheet
html = re.sub(r'<link rel="stylesheet" href="(css/[^"]+)">',
              lambda m: "<style>\n" + read(m.group(1)) + "\n</style>", html)
# inline scripts, in the same order as index.html
html = re.sub(r'<script src="(js/[^"]+)"></script>',
              lambda m: "<script>\n" + read(m.group(1)).replace("</script>", "<\\/script>") + "\n</script>", html)

import base64
def data_uri(m):
    p = os.path.join(root, "assets", m.group(1))
    return "data:image/png;base64," + base64.b64encode(open(p, "rb").read()).decode()
html = re.sub(r'assets/([A-Za-z0-9_\-]+\.png)', data_uri, html)

out_dir = os.path.join(root, "dist")
os.makedirs(out_dir, exist_ok=True)
out = os.path.join(out_dir, "ielts-prepsite.html")
open(out, "w", encoding="utf-8").write(html)
print("Wrote", out, f"({len(html)//1024} KB)")
