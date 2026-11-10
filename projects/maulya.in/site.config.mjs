// MLP/ARK-668: every address the site sends people to, in one file. Change a line here, run `node build/build.mjs`,
// upload the zip. Nothing else in the site writes an app or survey address by hand.

export default {
  site: {
    origin: "https://maulya.in", // canonical links, Open Graph, the sitemap and the feed
    name: "Maulya",
    supportEmail: "support@maulya.in",
  },

  app: {
    // ARK, Sat 7 Nov 14:5x: the host strangers go to stays app.maulya.in (FUNNEL.md, step 2).
    origin: "https://app.maulya.in",
    signInPath: "/auth/sign-in",
    signUpPath: "/auth/sign-up",
  },

  earlyAccess: {
    // MLP/ARK-683: the site's one gold button, "Apply for early access" (header, hero, the end of each page).
    // MLP/ARK-719: it opens the site's own application page, /early-access/apply/ (the form the founder approved on 10 Nov);
    // /early-access/ stays the intro page that leads to it. MLP/SRK-99 (addenda 1 and 2) added apiBase, sendTo and phase.
    //   formUrl:        where every gold button goes: /early-access/apply/. If it is emptied the buttons still go there.
    //   open:           false turns every button into the words "Applications are closed" (when the 10 to 15 are chosen).
    //   phase:          "open" (default) or "waitlist" (the founder's A7). "waitlist": every "Apply for early access" button and link reads
    //                   "Join the waiting list", and the start line on the form becomes "The first group is full. Join the waiting list
    //                   and we'll write when places open." The form, its keys and its sending are the same in both phases.
    //   apiBase:        Maulya's server, for the visit counting and (sendTo "server") the application and the Survey.
    //   sendTo:         "sheet" (default until ARK's server part is live, about 16-17 Nov) or "server". The founders choose.
    //                   "sheet": the application goes to the Google Apps Script below, and the Survey page sends to its own Apps Script as
    //                   it always did. "server": both go to apiBase and not to the Sheet.
    //                   (Visit counting on the early-access pages goes to apiBase in both settings; the Survey counts only when "server".)
    //   appsScriptUrl:  the Google Apps Script web app that writes each application to the Sheet (early-access-apps-script/code.gs).
    //                   EMPTY until ARK deploys the script in Google: with sendTo "sheet" the form shows, but at "Send my application" it says
    //                   "Applications open shortly" and WhatsApp 99801 40777, and sends nothing. The build warns (only when sendTo is "sheet").
    formUrl: "/early-access/apply/",
    open: true,
    phase: "open", // "open" | "waitlist"
    apiBase: "https://app.maulya.in",
    sendTo: "sheet", // "sheet" | "server"
    appsScriptUrl: "",
  },

  survey: {
    // The canonical survey's Google Apps Script web app (survey-apps-script/code.gs). On 7 Nov this address answered
    // "Page not found" (FUNNEL.md step 5): paste the redeployed /exec address here and rebuild.
    appsScriptUrl:
      "https://script.google.com/macros/s/AKfycbysv3x76e57dsR_VQKo3d85tbH59SDm0OCnNicxLQvPosIvZRULL37bei35SpFm7l4A/exec",
  },

  blog: {
    // A post goes live when its front matter's `status` is one of these. Shrinivas's posts arrive as
    // "Draft for Review", "Content Bank Ready" or "Ready to Publish"; approving one = set its status to "Published".
    publishStatuses: ["Published"],
    perPageFeed: 30,
  },
};
