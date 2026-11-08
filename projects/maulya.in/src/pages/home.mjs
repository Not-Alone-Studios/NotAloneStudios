// Home. Every product line here is seen on a review-mode screen of the app (main, 9a94cade8), is in Shrinivas's train
// (mlp/srk/srk-train-2026-11-08, see journey.mjs), or is said in Shrinivas's posts; the screens' words are quoted as the
// app says them. MLP/ARK-693: the working day in his words (the five places), the file's journey in motion, Ruling 20,
// who built it (as About has it), and what happens after applying (the early-access page's own steps).
import { fileJourney } from "./journey.mjs";

export default ({ L, shot, latest, card, cfg }) => ({
  extraHead: `<link rel="stylesheet" href="/assets/journey.css?v=${cfg.__buildId}" />`,
  path: "/",
  title: "Maulya: office software for property valuers",
  description:
    "Maulya keeps each bank valuation file in one place, from the day it comes in to the day the report goes out: site visits, photos, documents, reports, approvals and fees. The valuation stays the valuer's.",
  jsonLd: [{
    "@context": "https://schema.org", "@type": "SoftwareApplication", name: "Maulya", applicationCategory: "BusinessApplication",
    operatingSystem: "Web browser, on a computer or a phone",
    description: "Workflow software for property valuation offices in India: files, site visits, evidence, reports, approvals and fees.",
    offers: { "@type": "Offer", price: "2000", priceCurrency: "INR", description: "Platform plan, a month, before GST" },
  }],
  body: `
    <section class="hero on-body">
      <div class="wrap hero-grid">
        <div class="hero-copy">
          <span class="kicker">For property valuers and their offices</span>
          <h1>Know where every valuation file stands.</h1>
          <div class="hero-side">
            <p class="lead">Maulya keeps a bank valuation file in one place, from the day it comes in to the day the report goes out. Everyone in the office sees who has it and what is next.</p>
            <div class="actions">
              ${L.apply("btn btn-gold")}
              <a class="btn btn-line" href="#how-a-file-moves">See how a file moves</a>
            </div>
            <p class="hero-note">Already invited by your firm? <a href="${L.signIn}">Sign in</a>.</p>
          </div>
        </div>
        <div class="hero-stage">
          <figure class="frame-desk">${shot("desk-home-owner", "Maulya's Home for the owner: readouts for files with you, waiting at the desk, visits today, ready to go and payments late, then the files, longest waiting first, each with what to do next.", { eager: true })}</figure>
          <figure class="frame-phone">${shot("phone-home-owner", "Maulya on a phone: 2 reports are waiting for your approval, and tiles for files not given to anyone, late files, reports to fix and payments late.", { phone: true, eager: true })}</figure>
        </div>
      </div>
      <div class="hero-tail"></div>
    </section>

    <section class="section">
      <div class="wrap">
        <div class="section-head">
          <h2>Today, one file lives in five places.</h2>
          <p>A bank assignment arrives as a forwarded message or a phone call. Then the file spreads out. Nobody is careless; the work simply moves through messages and memory.</p>
        </div>
        <ul class="scatter scatter-wrap">
          <li><strong>WhatsApp</strong><span>the site engineer's measurement, somewhere between a payment screenshot and another file's photo</span></li>
          <li><strong>A Word template</strong><span>the report, half-finished, waiting for that one measurement</span></li>
          <li><strong>A laptop folder</strong><span>Final, Final1 and Final_new, and nobody fully sure which one went to the bank</span></li>
          <li><strong>The phone</strong><span>repeated calls to the site engineer, the branch and the borrower</span></li>
          <li><strong>The valuer's memory</strong><span>which branch called, and what they wanted</span></li>
        </ul>
        <p class="small muted" style="margin:12px 0 0;max-width:80ch">In Shrinivas's words, from <a href="/blog/property-valuation-report-inputs/">What inputs are usually needed for a property valuation report?</a>, <a href="/blog/old-valuation-report-retrieval/">Why old valuation reports become hard to retrieve</a> and <a href="/blog/property-valuation-site-visit-checklist/">the site visit checklist</a>.</p>
        <div class="into-one">
          <svg class="equals" viewBox="0 0 44 30" aria-hidden="true" data-equals><rect x="2" y="6" width="40" height="6" rx="1"/><rect x="2" y="18" width="40" height="6" rx="1"/></svg>
          <p style="margin:0"><strong>In Maulya it is one file.</strong> The bank and branch, the borrower and property, the site visit, the photos and documents, the report, the approval and the fee, together, with the person who has it now.</p>
        </div>
      </div>
    </section>

    <section class="section face" id="how-a-file-moves">
      <div class="wrap">
        <div class="section-head">
          <span class="kicker">How a file moves</span>
          <h2>From the day it comes in to the day it is paid.</h2>
          <p>One file's way through a valuer's office, in the app's own words. Each step names who does it and what they see on the screen.</p>
        </div>
        ${fileJourney()}
        <p style="margin-top:20px"><a href="/product/#scale">See the screen for each step</a></p>
      </div>
    </section>

    <section class="section">
      <div class="wrap">
        <div class="feature">
          <div>
            <span class="kicker">On the computer</span>
            <h2>The desk sees what needs it first.</h2>
            <p>Home opens on "Needs your attention": files with you, files waiting at the desk, visits today, reports ready to go and payments late. Below that, the files, longest waiting first, each with one thing to do.</p>
            <ul>
              <li>The Queue shows every file by where it is: given to you, with you, waiting at desk, at site, ready to go, finished.</li>
              <li>A file's page shows where the work stands, which documents have come and which are missing, and the site visit.</li>
              <li>A new file asks only what the office knows, and shows the documents that bank will need.</li>
            </ul>
            <p style="margin-top:20px"><a href="/product/">The whole product</a></p>
          </div>
          <figure class="frame-desk">${shot("desk-queue-owner", "Maulya's Queue: tabs for all files, given to you, with you, waiting at desk, at desk, at site, not started, ready to go and finished; each file with its reference, borrower, bank branch, where it is and its next step.")}</figure>
        </div>

        <div class="feature flip">
          <div>
            <span class="kicker">On the phone</span>
            <h2>The site engineer's visit, step by step.</h2>
            <p>The visit opens with when and where, who to meet, buttons to go there and to call, the site's exact location from the phone, and a check of the site in steps.</p>
            <ul>
              <li>Each photo is kept on the phone first, then goes to the office by itself.</li>
              <li>The office sees what came, while the engineer can still be reached.</li>
              <li>"Done at the site" when the visit is finished.</li>
            </ul>
            <p class="small muted" style="margin-top:16px"><span class="tag">In beta</span> Maulya works in the phone's browser today. The new phone design in these pictures is in beta.</p>
          </div>
          <div class="phones">
            <figure class="frame-phone">${shot("phone-visit", "A site visit on the phone: today at 9:30 am, the address and survey number, who to meet, buttons to go there, call to meet and call the office, and the site's exact location.", { phone: true })}</figure>
            <figure class="frame-phone">${shot("phone-visit-photos", "Photos for the report on the phone: 1 of 2 needed photos, each kept on this phone first then sent to the office by itself.", { phone: true })}</figure>
          </div>
        </div>
      </div>
    </section>

    <section class="section face">
      <div class="wrap">
        <div class="section-head">
          <span class="kicker">Who uses it</span>
          <h2>Six jobs, each with its own view.</h2>
          <p>Everyone in the firm signs in as themselves and sees the work that is theirs. These follow the app's own line for each job.</p>
        </div>
        <div class="jobs">
          <div class="job"><h3>Owner</h3><p class="line">Sees every file, the money and the team, and looks after the firm's Maulya plan.</p></div>
          <div class="job"><h3>Associate valuer</h3><p class="line">Sees every file, the money and the team. Everything except the subscription.</p></div>
          <div class="job"><h3>Assistant valuer</h3><p class="line">Sees every file at every stage. Makes files, gives them out, visits, enters figures and prepares reports.</p></div>
          <div class="job"><h3>Office staff</h3><p class="line">Makes files, gives site visits, prepares the report and hands it over.</p></div>
          <div class="job"><h3>Site engineer</h3><p class="line">Sees the files given to them, for the site visit.</p></div>
          <div class="job"><h3>Admin</h3><p class="line">Looks after the firm's settings. Sees no files and no money.</p></div>
        </div>
        <p style="margin-top:24px"><a href="/for-whom/">What each job does in Maulya</a></p>
      </div>
    </section>

    <section class="section">
      <div class="wrap">
        <div class="section-head">
          <span class="kicker">What Maulya is not</span>
          <h2>Maulya organises the work around the valuer's judgment. It does not decide a property's value.</h2>
        </div>
        <div class="boundary">
          <div><h3>Not a value calculator</h3><p>It does not produce a figure on its own, and it is not "AI valuation".</p></div>
          <div><h3>Not a replacement for the valuer</h3><p>Inspection, method, rates, adjustments and the final opinion stay the valuer's professional responsibility.</p></div>
          <div><h3>Not a legal guarantee</h3><p>It makes no claim about title, ownership or approvals.</p></div>
          <div><h3>Not for borrowers or buyers</h3><p>It is for valuation offices: valuers, firms, site engineers and office staff.</p></div>
        </div>
        <p class="small muted" style="margin-top:16px">From <a href="/blog/does-maulya-decide-property-value/">Does Maulya automatically decide property value?</a> and <a href="/blog/what-is-maulya-valuation-workflow-platform/">What is Maulya?</a></p>
        <div class="note green" style="margin-top:32px">
          <p><strong>Your firm's reports stay your firm's.</strong> Nothing from one firm's reports ever reaches another firm. That includes market and guideline rates, values, comparables and suggestions.</p>
          <p class="small">How this website handles what you send it: <a href="/privacy/">the privacy notice</a>.</p>
        </div>
      </div>
    </section>

    ${latest.length ? `
    <section class="section face">
      <div class="wrap">
        <div class="section-head">
          <span class="kicker">From the blog</span>
          <h2>Practical notes for valuation offices.</h2>
          <p>Written by a practising registered valuer, about the work itself: intake, site visits, evidence, reports and records.</p>
        </div>
        <div class="posts">${latest.slice(0, 3).map((p) => card(p, 3)).join("")}</div>
        <p style="margin-top:24px"><a href="/blog/">All articles</a></p>
      </div>
    </section>` : ""}

    <section class="section">
      <div class="wrap">
        <div class="maker">
          <img src="/assets/media/maulya/founders/shrinivas-face-240.jpg" alt="Shrinivas, a practising registered valuer." width="120" height="120" loading="lazy" decoding="async" />
          <div>
            <span class="kicker">Who built it</span>
            <h2>Built by a practising registered valuer.</h2>
            <p>Shrinivas is a practising property valuer. He knows where assignments slow down, where evidence goes missing, and why approvals turn into friction. That shaped Maulya's files, documents, site visits and report process. Sriram builds the product.</p>
            <p><a href="/about/">About the people behind Maulya</a></p>
          </div>
        </div>
      </div>
    </section>

    <section class="closing on-body">
      <div class="wrap">
        <h2>Bring your firm's files into one place.</h2>
        <p class="lead">We are choosing 10 to 15 valuation firms from the applications. They use Maulya free for six weeks, in return for real use and feedback.</p>
        <ol class="after-apply" aria-label="What happens after you apply">
          <li><b>You apply</b><span>with your firm's details.</span></li>
          <li><b>We choose 10 to 15 firms</b><span>and write to each firm we choose.</span></li>
          <li><b>Six weeks, free</b><span>on your firm's real work. Tell us what helps and what doesn't.</span></li>
        </ol>
        <div class="actions">
          ${L.apply("btn btn-gold")}
          <a class="btn btn-line" href="/early-access/">How early access works</a>
        </div>
      </div>
    </section>
`,
});
