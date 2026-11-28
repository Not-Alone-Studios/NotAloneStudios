#!/usr/bin/env python3
"""notalonestudios.com · Calvetra's clickable demo at /products/calvetra/demo/ (MLP/ARK-1192).

Copies Calvetra's design prototype (one self-contained HTML file: no network, no fonts, no storage, no tracking;
every name and number invented) into products/calvetra/demo/index.html, with only these changes:
  - a title, description, canonical and noindex for the studio's site;
  - a bar at the top: "A clickable demo of how Calvetra works, with sample data. It is not the app." and a way back;
  - internal design codes taken out of the title, the comments and the screen menu's headings;
  - the payment toast's vendor names taken out (the site names no vendors).
Everything else is the prototype byte for byte. Run from projects/nas-website:

  python3 build/calvetra_demo.py ~/Calvetra-lanes/lane2-content-a/design/ux2/prototype/index.html

It stops if the prototype has changed shape (an expected piece is missing), so a newer copy is looked at first.
"""
import hashlib
import re
import sys
from pathlib import Path

OUT = Path("products/calvetra/demo/index.html")
LABEL = "A clickable demo of how Calvetra works, with sample data. It is not the app."

HEAD = """<title>Calvetra · a clickable demo with sample data · Not Alone Studios</title>
<meta name="description" content="A clickable demo of how Calvetra works, with sample data. It is not the app.">
<meta name="robots" content="noindex">
<link rel="canonical" href="https://notalonestudios.com/products/calvetra/demo/">
<meta property="og:title" content="Calvetra · a clickable demo with sample data">
<meta property="og:description" content="A clickable demo of how Calvetra works, with sample data. It is not the app.">
<meta property="og:image" content="https://notalonestudios.com/assets/brand/og-notalone.png">
<!-- Calvetra's design prototype, shown as a demo on notalonestudios.com. One self-contained file: no network,
     no fonts, no storage, no tracking. Every name and number is invented. -->"""

BAR_CSS = """
/* notalonestudios.com: the demo's bar */
.nas-demo-bar { display: flex; flex-wrap: wrap; align-items: center; justify-content: center; gap: 4px 16px; padding: 8px 16px; background: var(--cv-color-sample-soft); color: var(--cv-color-text); border-bottom: 1.5px dashed var(--cv-color-sample); font: var(--cv-font-weight-medium) var(--cv-font-size-md)/1.4 var(--cv-font-family-sans); text-align: center; }
.nas-demo-bar h1 { margin: 0; font: inherit; color: inherit; }
.proto-btn { min-height: 44px; }
.nas-demo-bar a { display: inline-flex; align-items: center; min-height: 44px; padding: 0 4px; color: var(--cv-color-text); font-weight: var(--cv-font-weight-bold); text-decoration: underline; text-underline-offset: 3px; }
.nas-demo-bar a:focus-visible { outline: 3px solid var(--cv-color-sample); outline-offset: 2px; border-radius: 4px; }
body.shot .nas-demo-bar { display: none !important; }
</style>"""

BAR = f"""<body>
<div class="nas-demo-bar" role="note"><h1>{LABEL}</h1><a href="/products/calvetra/">Back to Calvetra</a></div>"""


def swap(text: str, old: str, new: str, count: int = 1) -> str:
    found = text.count(old)
    if found != count:
        sys.exit(f"stopped: expected {count} of {old[:60]!r}, found {found}")
    return text.replace(old, new)


def main() -> None:
    src = Path(sys.argv[1]).expanduser()
    raw = src.read_bytes()
    text = raw.decode("utf-8")
    text = swap(text, "<title>Calvetra v2 · UX-2 prototype (sample data)</title>", "@@HEAD@@")
    text = re.sub(r"<!-- UX-2 prototype\..*?-->", "", text, count=1, flags=re.S)
    text = swap(text, "@@HEAD@@", HEAD)
    text = swap(text, "</style>", BAR_CSS)
    text = swap(text, "<body>", BAR)
    for n in ("6", "5", "2"):
        text = text.replace(f" (DEC-{n})", "")
    text = text.replace("every screen in SCREENS.md, as a prepared moment", "every screen, as a prepared moment")
    # the site's rule: no vendors on public pages
    text = swap(text, " In the apps it goes through Google Play or Apple; on the web, Razorpay.", "")
    left = re.findall(r"UX-?2|DEC-\d|SCREENS\.md|Razorpay", text)
    if left:
        sys.exit(f"stopped: internal codes left: {sorted(set(left))}")
    for bad in ("fetch(", "XMLHttpRequest", "sendBeacon", "localStorage", "<script src", "<link rel=\"stylesheet\""):
        if bad in text:
            sys.exit(f"stopped: the demo now has {bad!r}; look at it before shipping")
    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(text, encoding="utf-8")
    print(f"source {src} sha256 {hashlib.sha256(raw).hexdigest()[:12]} ({len(raw):,} bytes)")
    print(f"wrote {OUT} ({OUT.stat().st_size:,} bytes)")


if __name__ == "__main__":
    main()
