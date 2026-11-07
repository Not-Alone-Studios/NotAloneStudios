// Privacy and Terms: the March 2026 text kept, with only the lines that are no longer true changed (each listed in
// LW.md for ARK): no updates reader on the app host, no auth.maulya.in host in the app's routing, no 50-firm waitlist in
// force, and the property address is not locked after the first report (only borrower and bank are, in the code).

const head = (title, lead) => `
    <section class="page-head">
      <div class="wrap"><h1>${title}</h1><p class="lead">${lead}</p></div>
    </section>`;

export const privacy = ({ L }) => ({
  path: "/privacy/",
  title: "Privacy notice",
  description: "The privacy notice for the public Maulya website, maulya.in.",
  body: `${head("Privacy notice", "How the public site at maulya.in handles information. It is not a substitute for the policy you accept inside the Maulya app.")}
    <section class="section"><div class="wrap prose">
      <h2>What this notice covers</h2>
      <p>The public marketing and information site served from <strong>maulya.in</strong> and <strong>www.maulya.in</strong>: the product pages, pricing, the blog, the workflow survey, and the links into the app.</p>
      <h2>What it does not cover</h2>
      <p>Using Maulya itself, signing in and working in your firm happen in the app at <strong>${L.app.replace("https://", "")}</strong>. The app has its own policy, which you accept inside the product.</p>
      <h2>Information this site handles</h2>
      <ul>
        <li>Basic visit and hosting information needed to serve the site.</li>
        <li>Survey answers you choose to send through the workflow survey. They are about how your office works; the survey does not ask for your name or phone number.</li>
        <li>Emails you choose to send us from the site's links.</li>
        <li>An application for early access: the details you give in the application form are used to choose firms and to contact them.</li>
        <li>Your move into the app when you choose to sign in.</li>
      </ul>
      <p>The site sets no advertising cookies. The blog's checklists and search work only in your browser and are not sent anywhere.</p>
      <h2>Questions</h2>
      <p>Write to <a href="${L.mail("Privacy")}">support@maulya.in</a>.</p>
      <div class="note"><p><strong>The app's policy is the one that counts for your work.</strong> If you use Maulya, the current policy inside the app is where you accept it.</p></div>
    </div></section>`,
});

export const terms = ({ L }) => ({
  path: "/terms/",
  title: "Terms",
  description: "The public terms for the Maulya website and the product rules that matter before you start: reports, assisted reports and informational content.",
  body: `${head("Terms", "The public terms for the Maulya site, and the product rules that matter before you start.")}
    <section class="section"><div class="wrap prose">
      <h2>Using this site</h2>
      <p>maulya.in is an informational site: the product, pricing, the blog, the survey and the way in. Reading it does not create an account or give access to the Maulya app.</p>
      <h2>The app</h2>
      <p>Working in Maulya happens in the app at <strong>${L.app.replace("https://", "")}</strong>: signing in, your firm's files, reports, billing and settings. The app's own terms apply there.</p>
      <h2>Informational material</h2>
      <p>Articles, pricing explanations and product notes are informational. They do not replace the professional judgment of a registered valuer and are not legal, financial or regulatory advice.</p>
      <h2>Assisted report generation</h2>
      <p>When you use assisted report generation (coming soon), Not Alone Studios or Maulya helps fill in the property details form from the data you provide. The completed form is presented to you for review and approval before any report is generated.</p>
      <p>Once you approve and submit the form, the resulting valuation report and all details in it are your responsibility. Not Alone Studios does not verify the accuracy of property data, valuation calculations or any professional judgment. The valuer's signature on the report is the valuer's professional opinion, not the opinion of Not Alone Studios.</p>
      <h2>Reports and new versions</h2>
      <p>A report is counted the first time it is made. Making the same report again in a new version does not count again.</p>
      <p>The borrower's name and the bank can't be changed on a file after its first report. A report with a different borrower or bank needs a new file.</p>
      <h2>Beta</h2>
      <p>During the beta, firms are set up with us and plans are agreed with us. Any beta allowances are shown inside the app and can change while the beta is active.</p>
      <h2>Changes</h2>
      <p>These terms can be updated as the product, pricing and onboarding evolve. The latest public version is published on this page.</p>
    </div></section>`,
});

export const notFound = ({ L }) => ({
  path: "/404.html",
  title: "Page not found",
  description: "This page is not on maulya.in.",
  noindex: true,
  body: `
    <section class="section lost">
      <div class="wrap narrow">
        <h1>This page isn't here.</h1>
        <p class="lead">It may have moved when the site was rebuilt in November 2026. These are the places most people look for:</p>
        <ul class="facts" style="max-width:520px">
          <li><a href="/product/">The product</a><span></span></li>
          <li><a href="/pricing/">Pricing</a><span></span></li>
          <li><a href="/blog/">The blog</a><span></span></li>
          <li><a href="/early-access/">Early access</a><span></span></li>
          <li><a href="${L.signIn}">Sign in to Maulya</a><span></span></li>
        </ul>
      </div>
    </section>`,
});
