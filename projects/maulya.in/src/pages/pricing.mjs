// Pricing: only the app's own plan list (services/api/app/services/billing/catalogue.py on main 9a94cade8, and its words on
// Settings > Maulya plan in review mode). No trial numbers and no founding-firm offer here until ARK says so (LW_ACTIONS,
// question 3; BUILD_NOTES keeps trial mechanics off the public site). "Tier 1" is the app's working name for the plan.

export default ({ L }) => ({
  path: "/pricing/",
  title: "Pricing",
  description:
    "Maulya's plans: Platform at ₹2,000 a month, Tier 1 at ₹3,500 a month with 100 reports, Assisted (coming soon) and Enterprise. Up to 7 people and 100 GB on every plan. Prices before GST.",
  jsonLd: [{
    "@context": "https://schema.org", "@type": "Product", name: "Maulya",
    offers: [
      { "@type": "Offer", name: "Platform", price: "2000", priceCurrency: "INR" },
      { "@type": "Offer", name: "Tier 1", price: "3500", priceCurrency: "INR" },
    ],
  }],
  body: `
    <section class="page-head on-body">
      <div class="wrap">
        <span class="kicker">Pricing</span>
        <h1>Plain prices, the same ones the app shows.</h1>
        <p class="lead">Every plan has room for 7 people and 100 GB for your files. Prices are a month, before GST.</p>
        <p class="lead">Firms chosen for early access use Maulya free for six weeks. <a href="/early-access/">About early access</a>.</p>
      </div>
    </section>
    <section class="section">
      <div class="wrap">
        <h2 class="sr-only">The plans</h2>
        <div class="plans">
          <div class="plan">
            <h3>Platform</h3>
            <p class="price">₹2,000 <small>a month + GST</small></p>
            <p>Files, people and Maulya's office tools for up to 7 people. Making reports is not included.</p>
          </div>
          <div class="plan">
            <h3>Tier 1</h3>
            <p class="price">₹3,500 <small>a month + GST</small></p>
            <p>100 reports a month, for up to 7 people, with 100 GB for your files.</p>
          </div>
          <div class="plan">
            <h3>Assisted <span class="tag">Coming soon</span></h3>
            <p class="price">₹6,000 <small>a month + GST</small></p>
            <p>100 reports a month, for up to 7 people, with 100 GB for your files.</p>
          </div>
          <div class="plan">
            <h3>Enterprise <span class="tag tag-green">Talk to us</span></h3>
            <p class="price">Agreed with you</p>
            <p>For larger firms: reports, places and price agreed with you, billed by invoice.</p>
          </div>
        </div>

        <div class="feature" style="margin-top:56px;align-items:start">
          <div>
            <h2>What every plan includes</h2>
            <ul class="facts">
              <li><span>People in your office</span><b>7 places</b></li>
              <li><span>Each extra place</span><b>₹500 a month + GST</b></li>
              <li><span>Space for your files</span><b>100 GB</b></li>
              <li><span>GST</span><b>18%, added to each bill</b></li>
            </ul>
            <p class="small muted" style="margin-top:12px">Maulya never stops you for space.</p>
          </div>
          <div>
            <h2>How reports are counted</h2>
            <ul class="facts">
              <li><span>A report is counted</span><b>the first time it is made</b></li>
              <li><span>Making it again in a new version</span><b>costs nothing</b></li>
              <li><span>Borrower and bank</span><b>fixed after the first report</b></li>
              <li><span>Unused reports</span><b>don't carry over</b></li>
            </ul>
          </div>
        </div>

        <div class="note" style="margin-top:48px">
          <p><strong>Payments aren't open in the app yet.</strong> Talk to us and we'll set up your plan with you. The app shows your plan, what it includes, and Maulya's bills to you, in Settings.</p>
        </div>
      </div>
    </section>
    <section class="section face">
      <div class="wrap narrow">
        <h2>Questions</h2>
        <div class="faq">
          <details><summary>Which plan do I need if my firm makes reports in Maulya?</summary><div><p>Platform has the files, people and office tools, without making reports. Tier 1 adds 100 reports a month.</p></div></details>
          <details><summary>What if we are more than 7 people?</summary><div><p>Each extra place is ₹500 a month + GST, on any plan. Larger firms can agree places, reports and price with us on Enterprise.</p></div></details>
          <details><summary>What is Assisted?</summary><div><p>A plan with the same 100 reports a month where we help fill in the report's details from what you send. It is coming soon and can't be chosen yet. The valuer reviews everything, and the report stays the valuer's.</p></div></details>
          <details><summary>Can I see the product first?</summary><div><p>Yes. <a href="/product/">The product page</a> shows the app's screens.</p></div></details>
        </div>
      </div>
    </section>
    <section class="closing on-body">
      <div class="wrap">
        <h2>Early access is free for six weeks.</h2>
        <div class="actions">${L.apply("btn btn-gold")}<a class="btn btn-line" href="${L.mail("Maulya plan")}">Write to us</a></div>
      </div>
    </section>
`,
});
