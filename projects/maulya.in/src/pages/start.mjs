// /start/: how a firm joins Maulya today (FUNNEL.md: the app has no public sign-up yet; Studio sets up a firm and
// invites its owner, services/api/app/services/firm_setup.py:219,252). #29's call, ARK may overrule: when the app's
// sign-up works, site.config.mjs start.mode = "app" sends every "Start your firm" button straight there instead.

export default ({ L, cfg }) => {
  const body = [
    "Firm name:",
    "Town or city:",
    "Your name and job (owner, valuer, ...):",
    "Phone:",
    "How many people work on valuation files:",
    "Banks you work with:",
  ].join("\n");
  const mail = `mailto:${cfg.site.supportEmail}?subject=${encodeURIComponent("Start my firm on Maulya")}&body=${encodeURIComponent(body + "\n")}`;
  return {
    path: "/start/",
    title: "Start your firm on Maulya",
    description: "How a valuation firm joins Maulya today: tell us about your office, we set up your firm, the owner gets an invitation, signs in and brings the team in.",
    body: `
    <section class="page-head on-body">
      <div class="wrap">
        <span class="kicker">Start your firm</span>
        <h1>Four steps from here to your first file.</h1>
        <p class="lead">During the beta we set up each firm with its owner, so everything is right from the first day. This is how it goes.</p>
      </div>
    </section>
    <section class="section">
      <div class="wrap" style="display:grid;grid-template-columns:minmax(0,1.2fr) minmax(0,0.8fr);gap:56px;align-items:start" data-stack>
        <ol class="steps">
          <li>
            <h3>Tell us about your office</h3>
            <p>Write to us with your firm's name, town, how many people work on files, and the banks you work with. A short email is enough.</p>
            <div class="actions" style="margin-top:12px"><a class="btn btn-gold" href="${mail}">Write to us</a><span class="small muted">${cfg.site.supportEmail}</span></div>
            <p class="small muted" style="margin-top:16px">If you have a few minutes more, <a href="/survey/">the survey</a> tells us how your office tracks work today, so we can set Maulya up around it.</p>
          </li>
          <li>
            <h3>We set up your firm</h3>
            <p>We create your firm in Maulya and send the owner an invitation by email.</p>
          </li>
          <li>
            <h3>Open the invitation and sign in</h3>
            <p>The owner opens the invitation, signs in, and finishes the firm's details.</p>
          </li>
          <li>
            <h3>Bring your team in</h3>
            <p>Invite each person with their job: associate or assistant valuer, office staff, site engineer or admin. Then make your first file.</p>
          </li>
        </ol>
        <aside>
          <div class="note green">
            <h2 style="font-size:1.25rem">Already invited?</h2>
            <p>If your firm or a colleague has invited you, sign in with the same email the invitation came to.</p>
            <p><a class="btn btn-line" href="${L.signIn}">Sign in</a></p>
          </div>
          <div class="note" style="margin-top:20px">
            <h2 style="font-size:1.25rem">Before you decide</h2>
            <p>See <a href="/product/">the product</a>, <a href="/for-whom/">who it's for</a> and <a href="/pricing/">the prices</a>. Payments aren't open in the app yet; we set up your plan with you.</p>
          </div>
        </aside>
      </div>
    </section>
`,
    extraCss: "",
  };
};
