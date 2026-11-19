#!/bin/bash
# notalonestudios.com · the upload (MLP/ARK-991). Copies only what the site serves into dist/live/ and zips it.
# Run from projects/nas-website:  bash build/build.sh
# It never uploads anything. The old upload folder public_hostinger/ (March 2026) is left as it was.
set -euo pipefail
cd "$(dirname "$0")/.."
python3 build/frame.py --check
STAMP="${1:-2026-11-20}"
OUT=dist/live
rm -rf "$OUT"; mkdir -p "$OUT"
for d in products method proof studio labs contact press privacy terms; do
  find "$d" -name index.html | while read -r f; do mkdir -p "$OUT/$(dirname "$f")"; cp "$f" "$OUT/$f"; done
done
cp index.html robots.txt sitemap.xml "$OUT/"
# assets: exactly the files the pages name (src, href, srcset, CSS url()), nothing else
python3 - "$OUT" <<'PY'
import re, shutil, sys
from pathlib import Path
out = Path(sys.argv[1]); refs = set()
for page in out.rglob("*.html"):
    t = page.read_text(encoding="utf-8")
    refs.update(re.findall(r'(?:src|href)="(/assets/[^"]+)"', t))
    refs.update(re.findall(r'"https://notalonestudios\.com(/assets/[^"]+)"', t))
    for ss in re.findall(r'srcset="([^"]+)"', t):
        refs.update(x.strip().split(" ")[0] for x in ss.split(",") if x.strip().startswith("/assets/"))
for css in ("assets/site.css", "assets/studio.css"):
    refs.add("/" + css)
    for u in re.findall(r'url\(["\']?(/assets/[^)"\']+)', Path(css).read_text(encoding="utf-8")):
        refs.add(u)
refs.add("/assets/site.js"); refs.add("/assets/studio.js")
for r in sorted(refs):
    src = Path(r.lstrip("/"))
    if not src.exists():
        print("MISSING", r); sys.exit(1)
    dst = out / r.lstrip("/"); dst.parent.mkdir(parents=True, exist_ok=True); shutil.copy2(src, dst)
print(len(refs), "assets copied")
PY
find "$OUT" -name '.DS_Store' -delete
# every local asset a page names must exist in the upload
missing=0
for f in $(find "$OUT" -name '*.html'); do
  for ref in $(grep -oE '(src|href|srcset)="/assets/[^" ,]+' "$f" | sed -E 's/^[a-z]+="//' ; grep -oE '/assets/[^" ,]+ [0-9]+[wx]' "$f" | cut -d' ' -f1); do
    [ -e "$OUT$ref" ] || { echo "MISSING $ref (in $f)"; missing=1; }
  done
done
[ "$missing" = 0 ] || { echo "build stopped: missing files"; exit 1; }
ZIP="dist/notalonestudios.com_${STAMP}.zip"
rm -f "$ZIP"; (cd "$OUT" && zip -qr -X "../$(basename "$ZIP")" .)
echo "built $OUT ($(find "$OUT" -type f | wc -l | tr -d ' ') files, $(du -sh "$OUT" | cut -f1)) and $ZIP ($(du -h "$ZIP" | cut -f1))"
