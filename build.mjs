// Genera docs/index.html: il sommario di Acausali, ricostruito dall'archivio pubblico di Substack.
// Uso:  node scripts/build.mjs            (legge l'archivio live)
//       node scripts/build.mjs --fixture dati.json   (prova offline)

import { readFile, writeFile, mkdir } from 'node:fs/promises';

const PUB = (process.env.PUB_URL ?? 'https://nicolettalolli.substack.com').replace(/\/$/, '');
const MARKER = 'Acausali';
const PAGE_SIZE = 50;
const OUT_DIR = 'docs';
const ORDER = 'asc'; // 'asc' = dal I in poi, 'desc' = dal più recente

const TITLE = 'Acausali: Occhi. Cervello. Mente. La lettura non è passiva.';
const INTRO = [
  'Acausali raccoglie esperimenti da fare insieme. Gli articoli non hanno per oggetto un’opera: hanno per oggetto te, mentre leggi. Ciascuno nasconde un meccanismo reale della lettura, della percezione o della lingua, che agisce sul tuo modo di leggere prima ancora che il testo lo nomini. Lo svela mentre è all’opera, infine una nota ne spiega il funzionamento.',
  'Il gioco è scoprire cosa fanno i tuoi occhi, il tuo cervello e la tua mente mentre leggi. La lettura non è mai passiva: lavora, anticipa, si lascia ingannare, a volte con grande eleganza.',
  'Gli esperimenti sono autonomi, quindi si può cominciare da qualunque punto. Scegli un titolo.',
];

const esc = (s = '') =>
  String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

async function fetchJson(url, tries = 3) {
  let last;
  for (let i = 1; i <= tries; i++) {
    try {
      const res = await fetch(url, { headers: { 'User-Agent': 'acausali-sommario/1.0', Accept: 'application/json' } });
      if (!res.ok) throw new Error(`HTTP ${res.status} su ${url}`);
      return await res.json();
    } catch (err) {
      last = err;
      await new Promise((r) => setTimeout(r, 2000 * i));
    }
  }
  throw last;
}

async function loadPosts() {
  const i = process.argv.indexOf('--fixture');
  if (i !== -1) return JSON.parse(await readFile(process.argv[i + 1], 'utf8'));

  const all = [];
  for (let offset = 0; offset < 1000; offset += PAGE_SIZE) {
    const url = `${PUB}/api/v1/archive?sort=new&search=${encodeURIComponent(MARKER)}&offset=${offset}&limit=${PAGE_SIZE}`;
    const batch = await fetchJson(url);
    if (!Array.isArray(batch)) throw new Error('Risposta inattesa dall’archivio: non è un elenco');
    all.push(...batch);
    if (batch.length < PAGE_SIZE) break;
  }
  return all;
}

// Tiene solo i pezzi di Acausali: marcatore nel titolo o nell'incipit.
// Scarta gli articoli che nominano la parola soltanto in mezzo al testo.
function isAcausali(p) {
  const m = MARKER.toLowerCase();
  return (
    String(p.title ?? '').toLowerCase().includes(m) ||
    String(p.truncated_body_text ?? '').toLowerCase().includes(m)
  );
}

// "II - Titolo" oppure "Acausali II - Titolo" -> { num: 'II', name: 'Titolo' }
function splitTitle(title = '') {
  const t = title.replace(new RegExp(`^${MARKER}\\s*[:.\\-–—|]?\\s*`, 'i'), '').trim();
  const m = t.match(/^([IVXLC]+)\s*[\-–—.:]\s*(.+)$/);
  return m ? { num: m[1], name: m[2] } : { num: '', name: t };
}

const fmtDate = (iso) =>
  new Intl.DateTimeFormat('it-IT', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Europe/Rome' }).format(new Date(iso));

function render(posts) {
  const items = posts
    .map((p) => {
      const { num, name } = splitTitle(p.title);
      const sub = p.subtitle || p.description || '';
      return `      <li>
        <a href="${esc(p.canonical_url)}">
          ${num ? `<span class="num">${esc(num)}</span>` : ''}<span class="name">${esc(name)}</span>
        </a>
        ${sub ? `<p class="sub">${esc(sub)}</p>` : ''}
        <time datetime="${esc(p.post_date)}">${esc(fmtDate(p.post_date))}</time>
      </li>`;
    })
    .join('\n');

  return `<!doctype html>
<html lang="it">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(TITLE)}</title>
<meta name="description" content="${esc(INTRO[0])}">
<style>
  :root { --bg:#fff7ed; --ink:#1f1b16; --soft:#6b6258; --pop:#ff6719; --line:#eadfce; }
  @media (prefers-color-scheme: dark) { :root { --bg:#17130f; --ink:#f3ece2; --soft:#a89d90; --line:#2e2822; } }
  * { box-sizing: border-box; }
  body { margin:0; background:var(--bg); color:var(--ink); font:18px/1.65 Georgia, 'Times New Roman', serif; }
  main { max-width: 640px; margin: 0 auto; padding: 48px 20px 72px; }
  .back { font:14px/1 system-ui, sans-serif; letter-spacing:.04em; text-transform:uppercase; color:var(--soft); text-decoration:none; }
  .back:hover { color:var(--pop); }
  h1 { font-size: clamp(28px, 6vw, 40px); line-height:1.15; margin: 28px 0 24px; font-weight:700; }
  .intro p { margin: 0 0 1em; }
  ol { list-style:none; margin: 40px 0 0; padding:0; border-top:1px solid var(--line); }
  li { padding: 20px 0; border-bottom:1px solid var(--line); }
  li a { color:var(--ink); text-decoration:none; font-size:1.15em; font-weight:700; }
  li a:hover .name { color:var(--pop); }
  .num { display:inline-block; min-width:2.2em; color:var(--pop); font-variant-numeric: tabular-nums; }
  .sub { margin: 4px 0 6px; color:var(--soft); }
  time { font:13px/1 system-ui, sans-serif; color:var(--soft); }
</style>
</head>
<body>
<main>
  <a class="back" href="${esc(PUB)}">Visione Laterale</a>
  <h1>${esc(TITLE)}</h1>
  <div class="intro">
${INTRO.map((t) => `    <p>${esc(t)}</p>`).join('\n')}
  </div>
  <ol>
${items}
  </ol>
</main>
</body>
</html>
`;
}

const posts = [...new Map((await loadPosts()).filter(isAcausali).map((p) => [p.id, p])).values()].sort(
  (a, b) => (new Date(a.post_date) - new Date(b.post_date)) * (ORDER === 'asc' ? 1 : -1),
);

// Se l'archivio non restituisce nulla, meglio non pubblicare: resta online l'ultima versione buona.
if (posts.length === 0) {
  console.error('Nessun articolo di Acausali trovato: non aggiorno la pagina.');
  process.exit(1);
}

await mkdir(OUT_DIR, { recursive: true });
await writeFile(`${OUT_DIR}/index.html`, render(posts));
await writeFile(`${OUT_DIR}/.nojekyll`, '');
console.log(`Pagina generata con ${posts.length} articoli.`);
