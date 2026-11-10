// MLP/ARK-668: the frame every page shares: <head> (meta, Open Graph, structured data), the header, the footer.
import { esc } from "./md.mjs";

export function links(cfg) {
  const app = cfg.app.origin.replace(/\/$/, "");
  const signUp = app + cfg.app.signUpPath;
  return {
    app,
    signIn: app + cfg.app.signInPath,
    signUp,
    // MLP/ARK-683: every "Apply for early access" button. MLP/ARK-719: it opens the site's own application page.
    apply: (cls = "btn btn-gold", label = "Apply for early access") => {
      const ea = cfg.earlyAccess;
      if (!ea.open) return `<span class="btn-closed">Applications are closed</span>`;
      const form = String(ea.formUrl || "").trim() || "/early-access/apply/";
      return `<a class="${cls}" href="${esc(form)}">${label}</a>`;
    },
    survey: "/survey/",
    mail: (subject) => `mailto:${cfg.site.supportEmail}${subject ? "?subject=" + encodeURIComponent(subject) : ""}`,
  };
}

const NAV = [
  ["/product/", "Product"],
  ["/for-whom/", "Who it's for"],
  ["/pricing/", "Pricing"],
  ["/blog/", "Blog"],
  ["/about/", "About"],
];

/** The logo mark drawn as the site has used since March (the scales, today's mark; the new one is on hold). */
const LOGO = `<img src="/assets/brand/maulya-logo-sm.png" alt="" width="132" height="40" class="brand-img" />`;

export function page(cfg, opts) {
  const {
    path, title, description, body, ogImage = "/assets/media/app/og-maulya.png", type = "website",
    jsonLd = [], current = path, noindex = false, extraHead = "", bodyClass = "",
  } = opts;
  const L = links(cfg);
  const url = cfg.site.origin + path;
  const fullTitle = path === "/" ? title : `${title} | Maulya`;
  const org = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Maulya",
    url: cfg.site.origin + "/",
    logo: cfg.site.origin + "/assets/brand/maulya-icon.png",
    email: cfg.site.supportEmail,
    parentOrganization: { "@type": "Organization", name: "Not Alone Studios" },
  };
  const ld = [org, ...jsonLd].map((o) => `<script type="application/ld+json">${JSON.stringify(o).replace(/</g, "\\u003c")}</script>`).join("\n  ");
  const navLinks = NAV.map(([href, label]) => {
    const on = current === href || (href !== "/" && current.startsWith(href));
    return `<a href="${href}"${on ? ' aria-current="page"' : ""}>${label}</a>`;
  }).join("");

  return `<!doctype html>
<html lang="en-IN">
<head>
  <meta charset="utf-8" />
  <script>document.documentElement.classList.add("js")</script>
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${esc(fullTitle)}</title>
  <meta name="description" content="${esc(description)}" />
  <link rel="canonical" href="${url}" />
  ${noindex ? '<meta name="robots" content="noindex" />' : ""}
  <meta name="theme-color" content="#094030" />
  <meta property="og:site_name" content="Maulya" />
  <meta property="og:title" content="${esc(title)}" />
  <meta property="og:description" content="${esc(description)}" />
  <meta property="og:type" content="${type}" />
  <meta property="og:url" content="${url}" />
  <meta property="og:image" content="${cfg.site.origin}${ogImage}" />
  <meta property="og:locale" content="en_IN" />
  <meta name="twitter:card" content="summary_large_image" />
  <link rel="icon" type="image/png" href="/assets/brand/maulya-icon.png" />
  <link rel="alternate" type="application/atom+xml" title="Maulya blog" href="/blog/feed.xml" />
  <link rel="preload" href="/assets/fonts/atkinson-hyperlegible-next-latin-400-normal.woff2" as="font" type="font/woff2" crossorigin />
  <link rel="preload" href="/assets/fonts/atkinson-hyperlegible-next-latin-700-normal.woff2" as="font" type="font/woff2" crossorigin />
  <link rel="stylesheet" href="/assets/site.css?v=${cfg.__buildId}" />
  ${extraHead}
  ${ld}
</head>
<body class="${bodyClass}">
  <a class="skip" href="#main">Skip to the content</a>
  <header class="top">
    <div class="wrap top-row">
      <a class="brand" href="/" aria-label="Maulya, home">${LOGO}</a>
      <button class="menu-btn" type="button" aria-expanded="false" aria-controls="site-nav">Menu</button>
      <div class="nav-panel" id="site-nav">
        <nav class="nav" aria-label="Main">${navLinks}</nav>
        <div class="nav-actions">
          <a class="btn btn-quiet" href="${L.signIn}">Sign in</a>
          ${L.apply("btn btn-gold")}
        </div>
      </div>
    </div>
  </header>
  <main id="main">
${body}
  </main>
  <footer class="foot">
    <div class="wrap foot-grid">
      <div class="foot-brand">
        <p class="foot-name">Maulya</p>
        <p>Office software for property valuers in India: files, site visits, photos, reports and fees in one place. The valuation stays the valuer's.</p>
        <p>Built by Not Alone Studios, Karnataka.</p>
      </div>
      <nav class="foot-nav" aria-label="Site">
        <h2 class="foot-h">The site</h2>
        <a href="/product/">Product</a><a href="/for-whom/">Who it's for</a><a href="/pricing/">Pricing</a><a href="/blog/">Blog</a><a href="/about/">About</a>
      </nav>
      <nav class="foot-nav" aria-label="Getting started">
        <h2 class="foot-h">Getting started</h2>
        ${L.apply("")}<a href="${L.signIn}">Sign in</a><a href="/survey/">The office survey</a><a href="${L.mail("Maulya")}">${esc(cfg.site.supportEmail)}</a>
      </nav>
      <nav class="foot-nav" aria-label="Policies">
        <h2 class="foot-h">Policies</h2>
        <a href="/privacy/">Privacy</a><a href="/terms/">Terms</a><a href="/blog/feed.xml">Blog feed</a>
      </nav>
    </div>
    <div class="wrap foot-small"><p>© ${new Date().getFullYear()} Not Alone Studios. Pictures of the app are from its review mode: every name, bank branch and place in them is made up.</p></div>
  </footer>
  <script src="/assets/site.js?v=${cfg.__buildId}" defer></script>
</body>
</html>
`;
}

/** A picture of the app: WebP in two widths, lazy below the fold. */
export function shot(name, alt, { phone = false, eager = false, cls = "" } = {}) {
  const [big, small, w, h] = phone ? [780, 390, 390, 844] : [1440, 960, 1440, 900];
  return `<img class="shot ${phone ? "shot-phone" : "shot-desk"} ${cls}" src="/assets/media/app/${name}-${small}.webp" srcset="/assets/media/app/${name}-${small}.webp ${small}w, /assets/media/app/${name}-${big}.webp ${big}w" sizes="${phone ? "(min-width: 900px) 300px, 70vw" : "(min-width: 1200px) 1000px, 94vw"}" width="${w}" height="${h}" alt="${esc(alt)}" ${eager ? 'fetchpriority="high"' : 'loading="lazy"'} decoding="async" />`;
}
