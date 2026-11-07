// About. The founders' names, credentials and photos are kept exactly as the page has had them (allowed by the brief).

export default ({ L }) => ({
  path: "/about/",
  title: "About Maulya and Not Alone Studios",
  description: "Maulya is built by a practising registered valuer and a product engineer, inside Not Alone Studios in Karnataka, for the way valuation offices actually work.",
  ogImage: "/assets/media/maulya/founders/shrinivas-blue-blazer.jpeg",
  body: `
    <section class="page-head on-body">
      <div class="wrap">
        <span class="kicker">About</span>
        <h1>Built by the people closest to the work.</h1>
        <p class="lead">Maulya did not start as a software idea. It started because valuation work was being run across WhatsApp threads, scattered documents, memory and repeated follow-up, and the people closest to that decided to build the system they wanted to use.</p>
      </div>
    </section>
    <section class="section">
      <div class="wrap">
        <div class="founders">
          <article class="founder">
            <img src="/assets/media/maulya/founders/shrinivas-blue-blazer.jpeg" alt="Shrinivas in a blue blazer." width="140" height="170" loading="lazy" decoding="async" />
            <div>
              <p class="small muted" style="margin:0 0 4px">Domain and valuation</p>
              <h2 style="font-size:1.5rem;margin-bottom:6px">Shrinivas</h2>
              <p class="creds">B.E. (Civil), M.Tech (CTM), A.M.I.E., C.Engg (I)<br />Registered Valuer, ICMAI RVO/L&amp;B/00075</p>
              <p>A practising property valuer. He knows where assignments slow down, where evidence goes missing, and why approvals turn into friction. That shaped Maulya's files, documents, site visits and report process. He writes <a href="/blog/">the blog</a>.</p>
            </div>
          </article>
          <article class="founder">
            <img src="/assets/media/maulya/founders/sriram-purple-suit.jpeg" alt="Sriram in a purple suit." width="140" height="170" loading="lazy" decoding="async" />
            <div>
              <p class="small muted" style="margin:0 0 4px">Product and engineering</p>
              <h2 style="font-size:1.5rem;margin-bottom:6px">Sriram</h2>
              <p class="creds">MBBS, NMC 2018<br />Founder and Lead Engineer, Not Alone Studios</p>
              <p>Builds the product: turning the office's daily pressure into software that explains itself, holds up under real work, and stays calm on a busy day.</p>
            </div>
          </article>
        </div>
      </div>
    </section>
    <section class="section face">
      <div class="wrap feature" style="align-items:start">
        <div>
          <h2>Not Alone Studios</h2>
          <p>The parent company behind Maulya. The studio builds software for people doing real operational work, where the product has to explain itself clearly and hold up beyond a demo.</p>
        </div>
        <div>
          <h2>What we believe</h2>
          <p>Valuers do not need more hustle. They need better systems. Maulya's job is to help a valuation office know where every file stands, who owns the next step and what is pending, without replacing the valuer's professional judgment.</p>
          <p class="small muted">From <a href="/blog/what-is-maulya-valuation-workflow-platform/">What is Maulya?</a></p>
        </div>
      </div>
    </section>
    <section class="closing on-body">
      <div class="wrap">
        <h2>Talk to the people who built it.</h2>
        <div class="actions">${L.apply("btn btn-gold")}<a class="btn btn-line" href="${L.mail("Hello from maulya.in")}">Write to us</a></div>
      </div>
    </section>
`,
});
