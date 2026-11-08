// MLP/ARK-683: /early-access/: the programme, in Shrinivas's words only (Sat 7 Nov ~21:00): 10 to 15 valuation firms chosen
// from the applications; free for six weeks; in return for real use and feedback. Nothing more is promised: no price after
// the six weeks, no start date (the internal "Deploy 14" is not published), no features beyond what the site already says.
// This page replaces the old /start/ ("Start your firm", 7 Nov): /start/ and /pilot/ now 301 here (build.mjs, MOVED).
// #29's call, ARK may overrule.
// MLP/ARK-693: "what happens after applying, in three plain steps" (the same steps, the button above them), a real h2
// (the heading order went h1 to h3), and Ruling 20 in its own words (25 Sep; quoted in MAULYA_LAUNCH_V2_PLAN.md and A38_REFERENCE_DATA_CONSENT_DRAFT), with the privacy notice.

export default ({ L, cfg }) => {
  const ea = cfg.earlyAccess;
  const form = String(ea.formUrl || "").trim();
  // While the form's address is empty, this page's own button falls back to an email, so it never loops back to itself.
  const mail = `mailto:${cfg.site.supportEmail}?subject=${encodeURIComponent("Early access to Maulya")}&body=${encodeURIComponent("Firm name:\nTown or city:\nYour name and job:\nHow many people work on valuation files:\n")}`;
  const button = !ea.open
    ? `<span class="btn-closed">Applications are closed</span>`
    : form
      ? L.apply("btn btn-gold")
      : `<a class="btn btn-gold" href="${mail}">Apply for early access</a>`;
  return {
    path: "/early-access/",
    title: "Apply for early access",
    description: "We are choosing 10 to 15 valuation firms from the applications. They use Maulya free for six weeks, in return for real use and feedback.",
    body: `
    <section class="page-head on-body">
      <div class="wrap">
        <span class="kicker">Early access</span>
        <h1>Apply for early access to Maulya.</h1>
        <p class="lead">We are choosing 10 to 15 valuation firms from the applications. They use Maulya free for six weeks, in return for real use and feedback.</p>
        <div class="actions">${button}</div>
      </div>
    </section>
    <section class="section">
      <div class="wrap" style="display:grid;grid-template-columns:minmax(0,1.2fr) minmax(0,0.8fr);gap:56px;align-items:start" data-stack>
        <div>
        <h2>${ea.open ? "What happens after you apply" : "Applications are closed"}</h2>
        <p class="muted">${ea.open ? "You fill in the application form with your firm's details. Then:" : "The firms have been chosen. This is how early access works:"}</p>
        <ol class="steps" style="margin-top:28px">
          <li>
            <h3>We choose 10 to 15 valuation firms</h3>
            <p>We choose from the applications. Not every firm that applies will be chosen.</p>
          </li>
          <li>
            <h3>We write to the firms we choose</h3>
            <p>Each chosen firm hears from us before it starts.</p>
          </li>
          <li>
            <h3>Six weeks, free</h3>
            <p>Chosen firms use Maulya free for six weeks. In return we ask for real use and feedback: use it on your firm's real work, and tell us what helps and what doesn't.</p>
          </li>
        </ol>
        </div>
        <aside>
          <div class="note green">
            <h2 style="font-size:1.25rem">Your firm's reports stay your firm's</h2>
            <p>Nothing from one firm's reports ever reaches another firm. That includes market and guideline rates, values, comparables and suggestions.</p>
            <p class="small">How this website handles what you send it: <a href="/privacy/">the privacy notice</a>.</p>
          </div>
          <div class="note green" style="margin-top:20px">
            <h2 style="font-size:1.25rem">Not sure yet?</h2>
            <p>See <a href="/product/">the product</a> and <a href="/for-whom/">who it's for</a>, or read <a href="/pricing/">the prices</a>.</p>
          </div>
          <div class="note" style="margin-top:20px">
            <h2 style="font-size:1.25rem">Already invited?</h2>
            <p>If your firm or a colleague has invited you, sign in with the same email the invitation came to.</p>
            <p><a class="btn btn-line" href="${L.signIn}">Sign in</a></p>
          </div>
          <p class="small muted" style="margin-top:20px">Questions? Write to <a href="${L.mail("Early access")}">${cfg.site.supportEmail}</a>.</p>
        </aside>
      </div>
    </section>
`,
  };
};
