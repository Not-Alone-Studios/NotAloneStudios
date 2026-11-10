// MLP/SRK-99 addenda 1 and 2: Maulya's server contract for the site, written out here SEPARATELY from the page's own table
// (src/pages/early-access-apply.mjs SERVER, src/survey/index.html CODES), so the tests can check the page against it.
// Source: PROMPT_LANE_A_SRK99_ADDENDUM_SERVER_CONTRACT.md §2 (ARK's plan §3 to 4) and ADDENDUM2 §2. Do not change a name here
// without the server's owner: these names are fixed. build/tools/stub-server.cjs uses the validators.
const UUID4 = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;

const EVENTS = ["ea_view", "apply_view", "apply_started", "survey_done", "site_survey_view", "site_survey_started", "site_survey_done"];

// key -> { one: [values] } | { many: [values] } | { text: max, optional?: true } | { email: true } | { digits: 10 }
const APPLICATION = {
  lost_next_file: { one: ["yes_more_than_once", "once_or_twice", "no"] },
  report_time: { one: ["same_day", "1_2_days", "3_5_days", "more_than_5_days"] },
  rate_change_time: { one: ["under_10_min", "10_30_min", "30_60_min", "more_than_an_hour"] },
  calc_mistake: { one: ["yes", "nearly", "no"] },
  lost_payment: { one: ["yes_more_than_once", "once_or_twice", "never"] },
  invoices_today: { one: ["word_or_excel", "tally", "billing_app", "by_hand", "usually_none"] },
  file_tracking: { one: ["diary", "excel", "whatsapp", "software", "in_my_head"] },
  full_name: { text: 120 },
  email: { email: true },
  whatsapp: { digits: 10 },
  place: { text: 120 },
  years_in_practice: { one: ["under_3", "3_10", "over_10"] },
  firm_name: { text: 160 },
  people_on_files: { one: ["just_me", "2_5", "6_15", "more_than_15"] },
  team: { many: ["assistant_valuers", "site_engineers", "office_staff", "associates"] },
  files_per_month: { one: ["under_10", "10_30", "30_60", "over_60"] },
  nationalised_banks: { one: ["none", "1_2", "3_5", "6_or_more"] },
  other_lenders: { one: ["none", "1_2", "3_5", "6_or_more"] },
  districts: { one: ["1", "2_3", "4_6", "more_than_6"] },
  property_types: { many: ["houses", "flats", "plots", "commercial", "industrial", "agricultural_land"] },
  report_method: { one: ["word_templates", "excel", "other_software", "someone_else_types"] },
  time_sinks: { many: ["typing", "calculations", "documents", "travel", "bank_corrections", "payment_followup", "other"] },
  time_sinks_other: { text: 300, optional: true },
  worth_paying: { many: ["faster_reports", "fewer_mistakes", "file_tracking", "payment_tracking", "bank_formats", "phone_visits", "other"] },
  worth_paying_other: { text: 300, optional: true },
  real_files_six_weeks: { one: ["yes", "no"] },
  calls_every_2_3_days: { one: ["yes", "no"] },
  site_visits_on: { one: ["android", "iphone", "paper"] },
  anything_else: { text: 2000, optional: true },
};

function checkAnswers(table, answers, problems, label) {
  if (!answers || typeof answers !== "object" || Array.isArray(answers)) { problems.push(label + ": answers is not an object"); return; }
  for (const k of Object.keys(answers)) if (!table[k]) problems.push(`${label}: unknown key "${k}"`);
  for (const [k, rule] of Object.entries(table)) {
    const v = answers[k];
    const has = v !== undefined && v !== null && v !== "";
    if (!has) { if (!rule.optional && !rule.skippable) problems.push(`${label}: missing "${k}"`); continue; }
    if (rule.one) { if (!rule.one.includes(v)) problems.push(`${label}: "${k}" = ${JSON.stringify(v)} is not one of ${rule.one.join("/")}`); }
    else if (rule.many) {
      if (!Array.isArray(v) || !v.length || v.some((x) => !rule.many.includes(x)) || new Set(v).size !== v.length) problems.push(`${label}: "${k}" = ${JSON.stringify(v)} is not a list of ${rule.many.join("/")}`);
    } else if (rule.text !== undefined) { if (typeof v !== "string" || v.length > rule.text) problems.push(`${label}: "${k}" is not text of at most ${rule.text} characters`); }
    else if (rule.email) { if (typeof v !== "string" || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) problems.push(`${label}: "${k}" is not an email address`); }
    else if (rule.digits) { if (typeof v !== "string" || !new RegExp("^\\d{" + rule.digits + "}$").test(v)) problems.push(`${label}: "${k}" is not ${rule.digits} digits`); }
  }
}

function validateEvent(b) {
  const p = [];
  if (!b || typeof b !== "object") return ["event: body is not an object"];
  if (!UUID4.test(b.visit || "")) p.push("event: visit is not a uuid v4");
  if (!EVENTS.includes(b.event)) p.push(`event: "${b.event}" is not a known event`);
  if (typeof b.page !== "string" || !b.page.startsWith("/")) p.push("event: page is not a path");
  const extra = Object.keys(b).filter((k) => !["visit", "event", "page"].includes(k));
  if (extra.length) p.push("event: unexpected keys " + extra.join(","));
  return p;
}

function validateApplication(b, rawLength) {
  const p = [];
  if (!b || typeof b !== "object") return ["application: body is not an object"];
  if (rawLength > 32 * 1024) p.push("application: body is over 32 KB");
  if (!UUID4.test(b.visit || "")) p.push("application: visit is not a uuid v4");
  if (b.consent !== true) p.push("application: consent is not true");
  if (typeof b.website !== "string") p.push("application: website (the trap field) is missing");
  const extra = Object.keys(b).filter((k) => !["visit", "answers", "consent", "website"].includes(k));
  if (extra.length) p.push("application: unexpected keys " + extra.join(","));
  checkAnswers(APPLICATION, b.answers, p, "application");
  return p;
}

// ---- the site's own Survey page (addendum 2): the page's existing ids as keys (lower_snake_case, ASCII), snake_case values.
const SURVEY_VERSION = "2026-11-survey-1";
const T = (n) => ({ text: n, skippable: true });
const O = (...v) => ({ one: v, skippable: true }); // a survey answer may be skipped: no key then
const SURVEY = {
  a1: O("independent", "team_2_5", "team_6_15", "team_over_15"),
  a2: O("1_5", "6_10", "11_20", "more_than_20"),
  a3: O("none", "1_2", "3_5", "more_than_5"),
  a4: O("ibbi", "section_34ab_34ap", "both", "prefer_not_to_say"),
  a5: O("0_3", "4_7", "8_15", "more_than_15"),
  b1: O("i_do_all", "team_member", "shared", "depends"),
  b2: O("few_hours", "same_day", "within_1_day", "2_days_or_more"),
  b3: O("under_4_hours", "same_day", "1_2_days", "more_than_2_days"),
  b4: O("very_often", "sometimes", "rarely", "almost_never"),
  c1: O("report_time", "market_rates", "manual_calculations", "multiple_assignments"),
  c2: O("frequently", "occasionally", "rarely", "never"),
  c3: O("manual_folders", "computer_folders", "cloud_storage", "no_system"),
  c4: O("a_lot", "moderate", "very_little", "do_not_train"),
  c5: T(2000),
  c6: T(2000),
  d1: O("age_life", "wdv", "depends", "other"),
  d2: O("more_confident", "equally_confident", "slightly_hesitant", "not_comfortable"),
  d3: O("absolutely_essential", "important", "somewhat_important", "not_necessary"),
  e1: O("memory_whatsapp_calls", "notebook_diary", "excel_sheets", "dedicated_software"),
  e2: O("extremely_useful", "useful", "somewhat_useful", "not_useful"),
  e3: O("extremely_helpful", "helpful", "somewhat_helpful", "not_needed"),
  f1: O("very_interested", "interested", "maybe", "not_interested"),
  f2: O("extremely_valuable", "useful", "somewhat_useful", "not_useful"),
  f3: O("yes_significantly", "yes_somewhat", "very_little_difference", "no"),
  f4: O("below_3000", "3000_5000", "5000_9000", "above_9000"),
};

function validateSurvey(b, rawLength) {
  const p = [];
  if (!b || typeof b !== "object") return ["survey: body is not an object"];
  if (rawLength > 32 * 1024) p.push("survey: body is over 32 KB");
  if (!UUID4.test(b.visit || "")) p.push("survey: visit is not a uuid v4");
  if (b.version !== SURVEY_VERSION) p.push(`survey: version is ${JSON.stringify(b.version)}, not ${SURVEY_VERSION}`);
  if (typeof b.completed !== "boolean") p.push("survey: completed is not true/false");
  const extra = Object.keys(b).filter((k) => !["visit", "version", "answers", "completed"].includes(k));
  if (extra.length) p.push("survey: unexpected keys " + extra.join(","));
  checkAnswers(SURVEY, b.answers, p, "survey");
  for (const k of Object.keys(b.answers || {})) if (!/^[a-z0-9_]+$/.test(k)) p.push(`survey: key "${k}" is not lower_snake_case ASCII`);
  return p;
}

module.exports = { UUID4, EVENTS, APPLICATION, SURVEY, SURVEY_VERSION, validateEvent, validateApplication, validateSurvey };
