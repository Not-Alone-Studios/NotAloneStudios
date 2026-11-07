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

  start: {
    // Where the site's main button ("Start your firm") goes.
    //   "page": the site's own /start/ page, which says how joining works today (the app has no public sign-up yet,
    //           FUNNEL.md steps 3 and 7). #29's call, ARK may overrule.
    //   "app":  straight to app.origin + app.signUpPath, the day the app's sign-up works.
    mode: "page",
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
