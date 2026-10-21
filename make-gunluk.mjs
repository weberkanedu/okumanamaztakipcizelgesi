// Günün ayeti ve hadisi verisini üretir: node make-gunluk.mjs  →  gunluk.json
// Ayet: Diyanet İşleri Kur'an-ı Kerim Türkçe Meali (acikkuran.com, çevirmen adı belirtilerek alıntı serbest).
// Hadis: Tercüme Edilmiş Nebevi Hadisler Ansiklopedisi (hadeethenc.com), "Faziletler ve Adaplar" ile
// "Kur'an'ın Faziletleri" bölümleri; sadece sahih/hasen ve kısa olanlar.
import { writeFileSync } from "node:fs";

const AYETLER = [
  "1:5", "1:6", "2:21", "2:43", "2:45", "2:110", "2:115", "2:152", "2:153", "2:155", "2:156", "2:163", "2:186",
  "2:201", "2:208", "2:238", "2:255", "2:261", "2:263", "2:269", "2:274", "2:277", "2:284",
  "2:285", "2:286", "3:8", "3:17", "3:26", "3:31", "3:92", "3:102", "3:103", "3:104", "3:110", "3:133", "3:134",
  "3:135", "3:139", "3:147", "3:159", "3:185", "3:190", "3:191", "3:193", "3:194", "3:200", "4:1", "4:36",
  "4:58", "4:86", "4:103", "4:110", "4:135", "5:8", "5:9", "6:59", "6:103", "6:160", "6:162", "7:23", "7:31",
  "7:55", "7:56", "7:180", "7:199", "7:205", "8:2", "9:51", "9:71", "9:72", "9:105", "9:119", "9:129",
  "10:57", "10:62", "11:6", "11:88", "11:114", "11:115", "12:87", "12:101", "13:11", "13:28", "14:7", "14:24",
  "14:31", "14:40", "14:41", "15:99", "16:18", "16:53", "16:90", "16:96", "16:97", "16:125", "16:128", "17:9",
  "17:23", "17:24", "17:36", "17:37", "17:53", "17:78", "17:80", "17:82", "18:10", "18:28", "18:46", "18:107",
  "18:110", "19:96", "20:14", "20:25", "20:82", "20:114", "20:130", "20:132", "21:35", "21:83", "21:87", "21:89",
  "22:77", "23:97", "23:98", "23:118", "24:22", "24:35", "25:63", "25:70", "25:71", "25:74", "27:19", "28:24",
  "28:77", "28:88", "29:2", "29:45", "29:57", "29:69", "30:21", "30:41", "31:17", "31:18", "31:19", "32:16",
  "33:21", "33:41", "33:56", "33:70", "33:71", "35:15", "35:29", "35:34", "39:10", "39:53", "39:54", "40:44",
  "40:55", "40:60", "41:30", "41:34", "42:43", "43:67", "46:15", "47:7", "48:4", "49:10", "49:11", "49:12",
  "49:13", "50:16", "51:17", "51:18", "51:19", "51:56", "52:48", "55:13", "55:26", "55:27", "55:60", "57:4",
  "57:16", "57:20", "57:21", "58:11", "59:9", "59:18", "59:19", "59:22", "59:23", "59:24", "61:2", "61:3",
  "62:10", "63:9", "63:10", "64:11", "64:15", "64:16", "66:6", "66:8", "67:2", "71:10", "73:8", "73:9", "76:8",
  "76:9", "87:14", "87:15", "89:27", "89:28", "93:5", "93:11", "94:5", "94:6", "94:7", "94:8", "96:1", "96:19",
  "98:5", "99:7", "99:8", "103:3", "108:1", "110:3"
];
const HADIS_KATEGORI = [5, 12];
const UA = { "User-Agent": "kaza-takip-gunluk/1.0 (+https://kaza.erkanicil.me)" };
const wait = (ms) => new Promise((r) => setTimeout(r, ms));

async function get(url, type = "text", tries = 4) {
  for (let i = 0; i < tries; i++) {
    try {
      const r = await fetch(url, { headers: UA });
      if (r.ok) return type === "json" ? r.json() : r.text();
      if (r.status === 404) throw new Error("404 " + url);
    } catch (e) { if (String(e.message).startsWith("404")) throw e; }
    await wait(1500 * (i + 1));
  }
  throw new Error("alınamadı: " + url);
}

// acikkuran.com sure adresleri (llms.txt dizininden)
const idx = await get("https://acikkuran.com/llms.txt");
const slug = {};
for (const m of idx.matchAll(/^- \[(\d+)\. [^\]]+\]\(https:\/\/acikkuran\.com\/([a-z0-9-]+)\.md\)/gm)) slug[m[1]] = m[2];
if (Object.keys(slug).length !== 114) throw new Error("sure dizini eksik: " + Object.keys(slug).length);

function section(md, startRe) {
  const m = md.match(startRe);
  if (!m) return "";
  const rest = md.slice(m.index + m[0].length);
  const end = rest.search(/^#{2,3} /m);
  return (end < 0 ? rest : rest.slice(0, end)).trim();
}

function trRaw(t) {
  const m = t.match(/^\((\d+)-(\d+)\)\s*/);
  return m ? { text: t.slice(m[0].length), span: m[1] + "-" + m[2] } : { text: t, span: "" };
}
// "Muttefekun aleyh" Buhârî ve Müslim'in birlikte rivayet ettiği demektir; tekrarlar atılır
function normRef(r) {
  let parts = String(r || "").split(" - ").map((x) => x.replace(/\s+/g, " ").trim()).filter(Boolean);
  if (parts.some((x) => /^muttefekun aleyh$/i.test(x))) {
    parts = ["Buhârî ve Müslim rivayet etmiştir"].concat(parts.filter((x) => !/^(muttefekun aleyh|buhârî rivayet etmiştir|müslim rivayet etmiştir)$/i.test(x)));
  }
  return [...new Set(parts)].join(", ");
}

const ayetler = [];
for (const ref of AYETLER) {
  const [s, a] = ref.split(":");
  const md = await get(`https://acikkuran.com/${slug[s]}/${a}-ayet-meali.md`);
  const head = md.match(/^# \d+\. (.+?) suresi (\d+)\. ayet/m);
  const ar = section(md, /^## Arapça\s*$/m);
  const tr = section(md, /^### Diyanet İşleri — [^\n]*$/m)
    .replace(/\[\d+\]/g, "").replace(/\s+/g, " ").trim();
  if (!head || !ar || !tr) { console.warn("atlandı (biçim):", ref); continue; }
  // Diyanet meali bazı ayetleri birlikte verir: "(70-71) ..." → referansa aralık yazılır, tekrar atlanır
  const range = trRaw(tr);
  if (ayetler.some((x) => x.tr === range.text)) continue;
  let arAll = ar;
  if (range.span) {
    const [from, to] = range.span.split("-").map(Number), parts = [];
    for (let n = from; n <= to; n++) {
      parts.push(n === Number(a) ? ar : section(await get(`https://acikkuran.com/${slug[s]}/${n}-ayet-meali.md`), /^## Arapça\s*$/m));
    }
    arAll = parts.join(" ");
  }
  ayetler.push({ ar: arAll, tr: range.text, ref: `${head[1]} Suresi, ${range.span || a}. ${range.span ? "ayetler" : "ayet"}` });
  await wait(250);
}

const hadisler = [];
const seen = new Set();
for (const cat of HADIS_KATEGORI) {
  for (let page = 1; ; page++) {
    const list = await get(`https://hadeethenc.com/api/v1/hadeeths/list/?language=tr&category_id=${cat}&page=${page}&per_page=100`, "json");
    for (const it of list.data) {
      if (seen.has(it.id)) continue;
      seen.add(it.id);
      const h = await get(`https://hadeethenc.com/api/v1/hadeeths/one/?language=tr&id=${it.id}`, "json");
      const tr = String(h.hadeeth || "").replace(/\s+/g, " ").trim();
      const grade = String(h.grade || "").trim();
      if (!/sahih|hasen/i.test(grade) || tr.length < 40 || tr.length > 600) continue;
      hadisler.push({ tr, ref: normRef(h.attribution), grade });
      await wait(120);
    }
    if (page >= Number(list.meta.last_page)) break;
  }
}

writeFileSync(new URL("./gunluk.json", import.meta.url), JSON.stringify({ v: 1, ayetler, hadisler }));
console.log(`gunluk.json: ${ayetler.length} ayet, ${hadisler.length} hadis`);
