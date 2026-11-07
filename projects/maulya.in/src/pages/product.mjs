// Product. Sources: the app's review-mode screens (main 9a94cade8), services/api/app/services/billing (report counting),
// services/api/app/services/assignment_update_flow.py:279-389 (borrower and bank fixed after the first report).
import { fileScale } from "./parts.mjs";

export default ({ L, shot }) => ({
  path: "/product/",
  title: "The product: the web app and the phone",
  description:
    "How Maulya works: a file made once, the site visit on the phone, photos and documents on the file, reports in the bank's format, the valuer's approval, and the fees, on a computer and on a phone.",
  body: `
    <section class="page-head on-body">
      <div class="wrap">
        <span class="kicker">The product</span>
        <h1>One file, from intake to hand-over.</h1>
        <p class="lead">Maulya is a web app for the whole office, on a computer at the desk and on a phone at the site. Here is what is on each screen today, in the app's own words.</p>
        <div class="actions"><a class="btn btn-gold" href="${L.start}">Start your firm</a><a class="btn btn-line" href="#scale">How a file moves</a></div>
      </div>
    </section>

    <section class="section">
      <div class="wrap">
        <div class="feature">
          <div>
            <h2>Home: what needs you, first.</h2>
            <p>Each person's Home opens on "Needs your attention", with readouts for their own work and the files longest waiting first. Each row says where the file is, for how long, and the one thing to do: approve the report, give the file to someone, start the valuation.</p>
            <ul>
              <li>With you, waiting at desk, visits today, ready to go.</li>
              <li>Payments late, for those who see the money.</li>
              <li>"Waiting at the desk", with why each file is there.</li>
            </ul>
          </div>
          <figure class="frame-desk">${shot("desk-home-owner", "The owner's Home: five readouts and the files longest waiting first, each with what to do.")}</figure>
        </div>

        <div class="feature flip">
          <div>
            <h2>The Queue: every file, by where it is.</h2>
            <p>Tabs across the top count the files in each place: given to you, with you, waiting at desk, at desk, at site, not started, ready to go and finished. Each row has the file's reference, the borrower, the bank branch and the kind of property, how long it has been there and its next step.</p>
          </div>
          <figure class="frame-desk">${shot("desk-queue-owner", "The Queue with tabs and counts for each place a file can be.")}</figure>
        </div>

        <div class="feature">
          <div>
            <h2>A file's page: the whole story in one place.</h2>
            <p>The top of the file is a scale of where the work stands, with the date of each step. Beside it: who has the file now, since when, and what is next.</p>
            <ul>
              <li>Overview, property, photos and documents, valuation, activity, report and finance.</li>
              <li>Documents: which have come, which are missing, with an Upload button on each missing one.</li>
              <li>The site visit: who to meet, the photos that have come.</li>
            </ul>
          </div>
          <figure class="frame-desk">${shot("desk-file-overview", "A file's overview: the seven-step scale, documents 3 of 5 in with 2 missing, the site visit, and where the file is now.")}</figure>
        </div>

        <div class="feature flip">
          <div>
            <h2>A new file asks only what you know.</h2>
            <p>Who sent it, the property and the borrower, where it is, who does the work. The form counts what is filled, lets you save a draft, and shows the documents that bank will need once you choose the bank and the kind of property.</p>
          </div>
          <figure class="frame-desk">${shot("desk-new-file", "The New file form with details filled 1 of 7 and the documents this bank will need.")}</figure>
        </div>
      </div>
    </section>

    <section class="section face" id="scale">
      <div class="wrap">
        <div class="section-head"><h2>How a file moves</h2><p>The seven places a file can be, with who works there.</p></div>
        ${fileScale(shot)}
      </div>
    </section>

    <section class="section">
      <div class="wrap">
        <div class="feature">
          <div>
            <span class="kicker">The phone</span>
            <h2>Built for the site, and for poor signal.</h2>
            <p>Maulya runs in the phone's browser today, for every job: Home, files, reports and the site visit. The site engineer's day starts with the visits waiting for a yes, each with Accept and Decline.</p>
            <ul>
              <li>Each photo is kept on the phone first, then goes to the office by itself.</li>
              <li>"As it was at 7:52 am. Pull down to get the newest." The phone says how fresh its page is.</li>
              <li>A new file can be started from the phone.</li>
            </ul>
            <p class="small muted" style="margin-top:16px"><span class="tag">In beta</span> The calmer phone design in these pictures is in beta and not yet switched on for every firm.</p>
          </div>
          <div class="phones">
            <figure class="frame-phone">${shot("phone-home-site-engineer", "The site engineer's Home on a phone: two visits waiting for a yes, each with Accept and Decline.", { phone: true })}</figure>
            <figure class="frame-phone">${shot("phone-files-owner", "Files on a phone: five files given to you, each with its bank branch, kind of property and where it is.", { phone: true })}</figure>
          </div>
        </div>
      </div>
    </section>

    <section class="section face">
      <div class="wrap">
        <div class="section-head">
          <span class="kicker">Reports and fees</span>
          <h2>Reports in the bank's format. Fees beside the work.</h2>
        </div>
        <div class="boundary">
          <div><h3>A report is counted once</h3><p>"A report is counted the first time it is made. Making it again in a new version costs nothing."</p></div>
          <div><h3>Borrower and bank stay fixed</h3><p>After the first report, the borrower's name and the bank can't be changed on that file, so a version can't drift.</p></div>
          <div><h3>Finance, for those allowed</h3><p>Invoices, payments and what is late, on the file and in Finance. A person without the Finance switch sees no fee, no invoice and no money anywhere.</p></div>
          <div><h3>The office's own records</h3><p>Who did what and when, kept in each file's activity and the firm's audit history.</p></div>
        </div>
      </div>
    </section>

    <section class="closing on-body">
      <div class="wrap">
        <h2>See it with your own files.</h2>
        <p class="lead">We set up your firm with you, and you bring your team in, each person with their own job.</p>
        <div class="actions"><a class="btn btn-gold" href="${L.start}">Start your firm</a><a class="btn btn-line" href="/for-whom/">Who it's for</a></div>
      </div>
    </section>
`,
});
