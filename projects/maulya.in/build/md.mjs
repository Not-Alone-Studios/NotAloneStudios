// MLP/ARK-668: a small Markdown reader for the blog, written for the posts Shrinivas writes (no package, no server).
// It knows: front matter (YAML subset), headings, paragraphs, **bold**, *italic*, `code`, [links](url), lists
// (bulleted, numbered, "- [ ]" checklists), tables, block quotes, rules, and HTML comments (dropped).
// It never changes the words: it only decides how they are drawn.

/** Front matter: `key: "value"`, `key: value`, and `key:` followed by `  - "item"` lines. */
export function parseFrontMatter(src) {
  const text = src.replace(/^﻿/, "").replace(/\r\n?/g, "\n");
  const m = text.match(/^---\n([\s\S]*?)\n---\n?/);
  if (!m) return { data: {}, body: text };
  const data = {};
  let listKey = null;
  for (const line of m[1].split("\n")) {
    if (!line.trim() || line.trim().startsWith("#")) continue;
    const item = line.match(/^\s+-\s+(.*)$/);
    if (item && listKey) { data[listKey].push(unquote(item[1])); continue; }
    const kv = line.match(/^([A-Za-z0-9_-]+):\s*(.*)$/);
    if (!kv) continue;
    const [, key, raw] = kv;
    if (raw === "") { data[key] = []; listKey = key; continue; }
    listKey = null;
    data[key] = unquote(raw);
  }
  return { data, body: text.slice(m[0].length) };
}

function unquote(v) {
  v = v.trim();
  if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) v = v.slice(1, -1);
  if (v === "true") return true;
  if (v === "false") return false;
  return v.replace(/\\"/g, '"');
}

/** Everything from the internal notes onward is the publisher's, never the reader's. */
const INTERNAL_HEADING = /^#{1,6}\s*(publisher notes|repurposing notes|internal link suggestions|internal notes|editor'?s? notes)\b/i;
export function stripInternal(body) {
  const lines = body.split("\n");
  let cut = lines.length;
  for (let i = 0; i < lines.length; i++) {
    if (/<!--\s*=*\s*-->/.test(lines[i]) && /INTERNAL/i.test(lines[i + 1] || "")) { cut = i; break; }
    if (/<!--.*INTERNAL.*DO NOT PUBLISH/i.test(lines[i])) { cut = i; break; }
    if (INTERNAL_HEADING.test(lines[i])) { cut = i; break; }
  }
  let kept = lines.slice(0, cut);
  // a trailing rule left in front of the notes
  while (kept.length && /^\s*(---|\*\*\*|___)?\s*$/.test(kept[kept.length - 1])) kept.pop();
  return kept.join("\n").replace(/<!--[\s\S]*?-->/g, "");
}

export const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

export function slugify(s) {
  return String(s).toLowerCase().replace(/<[^>]+>/g, "").replace(/&[a-z]+;/g, "").replace(/[^a-z0-9\s-]/g, "")
    .trim().replace(/\s+/g, "-").replace(/-+/g, "-").slice(0, 80);
}

export function inline(s) {
  let out = esc(s);
  out = out.replace(/`([^`]+)`/g, "<code>$1</code>");
  out = out.replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (_, t, u) => `<a href="${u}">${t}</a>`);
  out = out.replace(/\*\*([^*]+?)\*\*/g, "<strong>$1</strong>");
  out = out.replace(/(^|[^*\w])\*([^*\n]+?)\*(?!\w)/g, "$1<em>$2</em>");
  out = out.replace(/(^|\s)_([^_\n]+?)_(?=\s|[.,;:!?)]|$)/g, "$1<em>$2</em>");
  return out;
}

/** Markdown to a list of blocks; the renderer in blog.mjs decides how each block is drawn. */
export function toBlocks(md) {
  const lines = md.replace(/\r\n?/g, "\n").split("\n");
  const blocks = [];
  let i = 0;
  const isBlank = (l) => !l || !l.trim();
  while (i < lines.length) {
    const line = lines[i];
    if (isBlank(line)) { i++; continue; }
    let m;
    if ((m = line.match(/^(#{1,6})\s+(.*?)\s*#*\s*$/))) { blocks.push({ type: "heading", level: m[1].length, text: m[2] }); i++; continue; }
    if (/^\s*(---|\*\*\*|___)\s*$/.test(line)) { blocks.push({ type: "rule" }); i++; continue; }
    if (/^\s*\|/.test(line) && lines[i + 1] && /^\s*\|?\s*:?-{2,}/.test(lines[i + 1])) {
      const rows = [];
      while (i < lines.length && /^\s*\|/.test(lines[i])) { rows.push(lines[i]); i++; }
      const split = (r) => r.trim().replace(/^\|/, "").replace(/\|$/, "").split("|").map((c) => c.trim());
      const head = split(rows[0]);
      const body = rows.slice(2).map(split).filter((r) => r.some((c) => c));
      blocks.push({ type: "table", head, body });
      continue;
    }
    if (/^>\s?/.test(line)) {
      const q = [];
      while (i < lines.length && /^>\s?/.test(lines[i])) { q.push(lines[i].replace(/^>\s?/, "")); i++; }
      blocks.push({ type: "quote", text: q.join(" ") });
      continue;
    }
    if (/^\s*([-*+]|\d+[.)])\s+/.test(line)) {
      const ordered = /^\s*\d+[.)]\s+/.test(line);
      const items = [];
      while (i < lines.length && (/^\s*([-*+]|\d+[.)])\s+/.test(lines[i]) || (/^\s{2,}\S/.test(lines[i]) && items.length))) {
        const l = lines[i];
        const im = l.match(/^(\s*)([-*+]|\d+[.)])\s+(.*)$/);
        if (im) {
          const depth = im[1].length >= 2 ? 1 : 0;
          let text = im[3];
          let task = null;
          const tm = text.match(/^\[( |x|X)\]\s+(.*)$/);
          if (tm) { task = tm[1] !== " "; text = tm[2]; }
          items.push({ text, depth, task });
        } else items[items.length - 1].text += " " + l.trim();
        i++;
      }
      const isChecklist = items.length > 0 && items.every((it) => it.task !== null);
      blocks.push({ type: isChecklist ? "checklist" : "list", ordered, items });
      continue;
    }
    // paragraph: until a blank line or another block starts
    const para = [line];
    i++;
    while (i < lines.length && !isBlank(lines[i]) && !/^(#{1,6}\s|>|\s*([-*+]|\d+[.)])\s+|\s*\|)/.test(lines[i]) && !/^\s*(---|\*\*\*|___)\s*$/.test(lines[i])) {
      para.push(lines[i]);
      i++;
    }
    blocks.push({ type: "para", lines: para });
  }
  return blocks;
}

export function wordCount(md) {
  return md.replace(/[#>*_`|\-\[\]()]/g, " ").split(/\s+/).filter(Boolean).length;
}
