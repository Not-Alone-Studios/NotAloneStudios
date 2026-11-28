#!/usr/bin/env python3
"""notalonestudios.com · the shared frame (MLP/ARK-991).

The site is plain HTML with no build. This script keeps the parts every page shares identical: the <head> (title,
description, canonical, social card, icons, fonts, styles), the header, the footer and the scripts. Run it from
projects/nas-website after editing any page or the PAGES table below:

    python3 build/frame.py            # rewrites the 13 pages in place
    python3 build/frame.py --check    # exits 1 if any page is not framed exactly as below

Each page keeps everything between <body …> and the frame's markers; only the marked parts are rewritten.
"""
import html
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SITE = "https://notalonestudios.com"
OG_IMAGE = SITE + "/assets/brand/og-notalone.png"
FONTS = ("https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,600"
         "&family=IBM+Plex+Mono:wght@400;500&family=Manrope:wght@400;500;600;700;800"
         "&family=Sora:wght@500;600;700;800&display=swap")

# file → (path, title, description, which header link is current, new page?)
PAGES = {
    "index.html": ("/", "Not Alone Studios · the studio behind Maulya and Calvetra",
                   "Not Alone Studios builds Maulya, office software for property valuers, and Calvetra, a study planner "
                   "for NEET PG and INI-CET aspirants, and takes on selected systems builds.", None, True),
    "products/index.html": ("/products/", "Projects · Not Alone Studios",
                            "The studio's projects: Maulya (in use with its founding firms), Calvetra (in development, with a "
                            "clickable demo) and Revalk (earlier work, no longer in development).", "/products/", True),
    "products/maulya/index.html": ("/products/maulya/", "Maulya · Not Alone Studios",
                                   "Maulya is office software for property valuers in India. It is in use with its founding "
                                   "firms and not yet open to new firms.",
                                   "/products/", True),
    "products/calvetra/index.html": ("/products/calvetra/", "Calvetra · Not Alone Studios",
                                     "Calvetra, in development: a study planner for NEET PG and INI-CET aspirants, with an "
                                     "honest verdict on every plan. See how it works in a clickable demo.", "/products/", True),
    "products/revalk/index.html": ("/products/revalk/", "Revalk, earlier work · Not Alone Studios",
                                   "Revalk was the studio's study product for NEET PG and INI-CET aspirants in 2026. "
                                   "It is no longer in development.", "/products/", True),
    "method/index.html": ("/method/", "Method · Not Alone Studios",
                          "The Not Alone Studios method: Capture, Enforce, Release. A constraint-driven approach to "
                          "building operator-grade software systems.", "/method/", False),
    "proof/index.html": ("/proof/", "Proof · Not Alone Studios",
                         "Shipped proof, curated screenshots, and clear operating outcomes from Not Alone Studios products.",
                         "/proof/", False),
    "studio/index.html": ("/studio/", "Studio · Not Alone Studios",
                          "Selective systems studio for operations-heavy, compliance-sensitive, multi-role workflows.",
                          "/studio/", False),
    "labs/index.html": ("/labs/", "Labs · Not Alone Studios",
                        "Labs: experiments, tools and prototypes at Not Alone Studios.", None, False),
    "contact/index.html": ("/contact/", "Contact · Not Alone Studios",
                           "Contact Not Alone Studios about Maulya, Calvetra, or a selective systems build.",
                           "/contact/", False),
    "press/index.html": ("/press/", "Press kit · Not Alone Studios",
                         "Not Alone Studios press kit with logos, product descriptions, and contact details for media "
                         "inquiries.", None, False),
    "privacy/index.html": ("/privacy/", "Privacy · Not Alone Studios", "Privacy at Not Alone Studios.", None, False),
    "terms/index.html": ("/terms/", "Terms · Not Alone Studios", "Terms of use for notalonestudios.com.", None, False),
}

NAV = [("/products/", "Projects"), ("/method/", "Method"), ("/proof/", "Proof"), ("/studio/", "Studio")]
LOGO = ('<img src="/assets/brand/notalone-logo-112.webp" srcset="/assets/brand/notalone-logo-112.webp 1x, '
        '/assets/brand/notalone-logo-224.webp 2x" width="{s}" height="{s}" alt="" />')


def head(path, title, desc, new):
    e = html.escape
    styles = '' if new else '  <link rel="stylesheet" href="/assets/site.css" />\n'
    return f"""<head>
  <!-- nx:head (build/frame.py) -->
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>{e(title)}</title>
  <meta name="description" content="{e(desc)}" />
  <link rel="canonical" href="{SITE}{path}" />
  <meta property="og:type" content="website" />
  <meta property="og:site_name" content="Not Alone Studios" />
  <meta property="og:title" content="{e(title)}" />
  <meta property="og:description" content="{e(desc)}" />
  <meta property="og:url" content="{SITE}{path}" />
  <meta property="og:image" content="{OG_IMAGE}" />
  <meta property="og:image:width" content="1200" />
  <meta property="og:image:height" content="630" />
  <meta property="og:image:alt" content="Not Alone Studios: the boat-and-sun logo, with Maulya and Calvetra." />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="theme-color" content="#024854" />
  <link rel="icon" type="image/png" sizes="48x48" href="/assets/brand/notalone-icon-48.png" />
  <link rel="apple-touch-icon" href="/assets/brand/notalone-icon-180.png" />
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link rel="stylesheet" href="{FONTS.replace('&', '&amp;')}" />
{styles}  <link rel="stylesheet" href="/assets/studio.css" />
  <script>document.documentElement.className += " nx-js";</script>
  <!-- /nx:head -->
</head>"""


def header(current):
    links = []
    for href, label in NAV:
        cur = ' aria-current="page"' if href == current else ''
        links.append(f'      <a href="{href}"{cur}>{label}</a>')
    cur = ' aria-current="page"' if current == "/contact/" else ''
    links.append(f'      <a class="nx-nav__cta" href="/contact/"{cur}>Contact</a>')
    nav = "\n".join(links)
    return f"""<!-- nx:header (build/frame.py) -->
<a class="nx-skip" href="#main">Skip to the content</a>
<header class="nx-header">
  <div class="nx-header__in">
    <a class="nx-brand" href="/">{LOGO.format(s=44)}<span>Not Alone Studios</span></a>
    <button class="nx-menu" type="button" aria-expanded="false" aria-controls="nx-nav"><span class="nx-menu__bars" aria-hidden="true"><i></i><i></i><i></i></span>Menu</button>
    <nav class="nx-nav" id="nx-nav" aria-label="Main">
{nav}
    </nav>
  </div>
</header>
<!-- /nx:header -->"""


FOOTER = f"""<!-- nx:footer (build/frame.py) -->
<footer class="nx-footer">
  <div class="nx-footer__in">
    <div class="nx-footer__top">
      <div class="nx-footer__brand">{LOGO.format(s=56)}<p><strong>Not Alone Studios</strong>A systems product studio. We build Maulya and Calvetra, and take on selected systems builds.</p></div>
      <nav aria-label="Projects"><h2>Projects</h2><ul><li><a href="/products/maulya/">Maulya</a></li><li><a href="/products/calvetra/">Calvetra</a></li><li><a href="/products/revalk/">Revalk</a></li><li><a href="/products/">All projects</a></li></ul></nav>
      <nav aria-label="The studio"><h2>Studio</h2><ul><li><a href="/method/">Method</a></li><li><a href="/proof/">Proof</a></li><li><a href="/studio/">Studio</a></li><li><a href="/labs/">Labs</a></li></ul></nav>
      <nav aria-label="Company"><h2>Company</h2><ul><li><a href="/contact/">Contact</a></li><li><a href="/press/">Press</a></li><li><a href="/privacy/">Privacy</a></li><li><a href="/terms/">Terms</a></li></ul></nav>
    </div>
    <div class="nx-footer__base"><p>© <span data-nx-year>2026</span> Not Alone Studios.</p><p><a href="mailto:hello@notalonestudios.com">hello@notalonestudios.com</a></p></div>
  </div>
</footer>
<!-- /nx:footer -->"""


def scripts(new):
    old = '' if new else '<script src="/assets/site.js"></script>\n'
    return f"<!-- nx:scripts (build/frame.py) -->\n{old}<script src=\"/assets/studio.js\" defer></script>\n<!-- /nx:scripts -->"


def put(text, name, block, fallback=None):
    """Replace <!-- nx:name … /nx:name --> (or, the first time, the fallback pattern) with block."""
    marked = re.compile(r"<!-- nx:%s[^>]*-->.*?<!-- /nx:%s -->" % (name, name), re.S)
    if marked.search(text):
        return marked.sub(lambda m: block, text, count=1)
    if fallback is None:
        raise SystemExit(f"no {name} markers and no fallback")
    new, n = re.subn(fallback, lambda m: block, text, count=1, flags=re.S)
    if n != 1:
        raise SystemExit(f"{name}: the old block was not found")
    return new


def frame(text, file):
    path, title, desc, current, new = PAGES[file]
    text = re.sub(r"<head>.*?</head>", lambda m: head(path, title, desc, new), text, count=1, flags=re.S)
    text = put(text, "header", header(current),
               r'(<div class="nav-overlay"[^>]*></div>\s*)?<header class="site-header">.*?</header>')
    text = put(text, "footer", FOOTER, r'<footer class="site-footer">.*?</footer>')
    text = put(text, "scripts", scripts(new), r'<script src="/assets/site\.js"></script>')
    text = re.sub(r"<main(?![^>]*\bid=)", '<main id="main"', text, count=1)
    return text


def main():
    check = "--check" in sys.argv
    bad = 0
    for file in PAGES:
        p = ROOT / file
        before = p.read_text(encoding="utf-8")
        after = frame(before, file)
        if before != after:
            if check:
                print("NOT FRAMED", file)
                bad += 1
            else:
                p.write_text(after, encoding="utf-8")
                print("framed", file)
    if check and not bad:
        print("all 13 pages framed")
    sys.exit(1 if bad else 0)


if __name__ == "__main__":
    main()
