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
    //   formUrl: the Google Form's address (Shrinivas sends it). While it is empty the build still works, every button
    //            goes to the site's own /early-access/ page, and the build prints a loud warning. Paste the link
    //            here, run `node build/build.mjs`, and every button goes straight to the form (same tab).
    //   open:    false turns every button into the words "Applications are closed" (when the 10 to 15 are chosen).
    formUrl: "",
    open: true,
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
