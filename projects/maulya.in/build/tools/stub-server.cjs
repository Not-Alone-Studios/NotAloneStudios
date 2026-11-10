// MLP/SRK-99 addenda 1 and 2: a small local stand-in for Maulya's server (the real one is not reachable yet). It answers the three
// endpoints of the contract, answers a browser's CORS preflight the way a server that allows maulya.in must, validates every body
// against build/tools/contract.cjs, and records every request (and every violation) so a test can read them. It listens on 127.0.0.1 only.
//
//   POST /api/v3/public/early-access/events         {"visit","event","page"}                      -> 204
//   POST /api/v3/public/early-access/applications   {"visit","answers","consent","website"}      -> 201 {"ok":true} (or the mode set below)
//   POST /api/v3/public/site-survey/responses       {"visit","version","answers","completed"}    -> 201 {"ok":true} (or the mode set below)
//
// Used in a test:   const stub = await require("./stub-server.cjs").start(8770);
//   stub.log            every request: { method, path, body (parsed or null), raw (length), problems: [...] , preflight }
//   stub.setMode(name, mode)   name: "events" | "applications" | "survey"; mode: "ok" | "missing" | "429" | "500" | "drop" (close the connection)
//   stub.setMissing([keys])    what a "missing" answer lists
//   stub.reset()        clears the log and sets every mode back to "ok"
//   stub.close()
// Or by hand:       node build/tools/stub-server.cjs 8770
const http = require("http");
const C = require("./contract.cjs");

function start(port) {
  const log = [];
  const modes = { events: "ok", applications: "ok", survey: "ok" };
  let missingKeys = ["whatsapp", "consent"];
  const PATHS = {
    "/api/v3/public/early-access/events": "events",
    "/api/v3/public/early-access/applications": "applications",
    "/api/v3/public/site-survey/responses": "survey",
  };
  const server = http.createServer((req, res) => {
    const origin = req.headers.origin || "*";
    const cors = { "Access-Control-Allow-Origin": origin, "Vary": "Origin", "Access-Control-Allow-Methods": "POST, OPTIONS", "Access-Control-Allow-Headers": "content-type", "Access-Control-Max-Age": "600" };
    const path = req.url.split("?")[0];
    if (req.method === "OPTIONS") {
      log.push({ method: "OPTIONS", path, preflight: true, problems: [] });
      res.writeHead(204, cors); res.end(); return;
    }
    let raw = "";
    req.on("data", (c) => { raw += c; });
    req.on("end", () => {
      const entry = { method: req.method, path, raw: raw.length, body: null, problems: [], contentType: req.headers["content-type"] || "", cookie: req.headers.cookie || "" };
      log.push(entry);
      const name = PATHS[path];
      if (req.method !== "POST" || !name) { entry.problems.push("not a contract endpoint"); res.writeHead(404, cors); res.end(); return; }
      try { entry.body = JSON.parse(raw); } catch (e) { entry.problems.push("body is not JSON"); }
      if (!/^application\/json/.test(entry.contentType)) entry.problems.push("content-type is not application/json: " + entry.contentType);
      if (entry.cookie) entry.problems.push("the request carried a cookie");
      if (entry.body) entry.problems.push(...(name === "events" ? C.validateEvent(entry.body) : name === "applications" ? C.validateApplication(entry.body, raw.length) : C.validateSurvey(entry.body, raw.length)));
      const mode = modes[name];
      if (mode === "drop") { req.socket.destroy(); return; }
      if (name === "events") { res.writeHead(mode === "500" ? 500 : 204, cors); res.end(); return; }
      const json = { "Content-Type": "application/json", ...cors };
      if (mode === "missing") { res.writeHead(422, json); res.end(JSON.stringify({ error_code: "early_access.missing", missing: missingKeys, message: "Some answers are missing." })); return; }
      if (mode === "429") { res.writeHead(429, json); res.end(JSON.stringify({ error_code: "early_access.rate_limited", message: "Too many applications from this connection. Please try again in an hour." })); return; }
      if (mode === "500") { res.writeHead(500, json); res.end(JSON.stringify({ error_code: "server_error" })); return; }
      res.writeHead(201, json); res.end(JSON.stringify({ ok: true }));
    });
  });
  return new Promise((resolve) => server.listen(port, "127.0.0.1", () => resolve({
    port, log,
    setMode: (name, mode) => { modes[name] = mode; },
    setMissing: (keys) => { missingKeys = keys; },
    reset: () => { log.length = 0; for (const k of Object.keys(modes)) modes[k] = "ok"; missingKeys = ["whatsapp", "consent"]; },
    close: () => new Promise((r) => { server.closeAllConnections && server.closeAllConnections(); server.close(() => r()); }),
  })));
}

module.exports = { start };
if (require.main === module) start(+process.argv[2] || 8770).then((s) => console.log(`stub server on http://127.0.0.1:${s.port}`));
