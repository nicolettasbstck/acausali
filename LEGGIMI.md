# Pagina-macchina Acausali

Una pagina web che ricostruisce da sola l'elenco degli articoli di Acausali ogni giorno, leggendo l'archivio pubblico di Visione Laterale. Si pubblica gratis su GitHub Pages e si collega al menù di Substack come link esterno.

## Impostazione, una volta sola

1. Crea un account gratuito su github.com. Scegli un nome utente che accetti di vedere nell'indirizzo finale.
2. Crea un nuovo repository **pubblico**, per esempio con nome `acausali`.
3. Carica nel repository le cartelle `scripts` e `test` e il file `LEGGIMI.md` (pulsante Add file > Upload files).
4. Crea a mano il file del processo automatico: Add file > Create new file, nel campo del nome scrivi `.github/workflows/update.yml` (le barre creano le cartelle), incolla il contenuto del file `update.yml` incluso nello zip, poi Commit.
5. Vai su Settings > Pages e, alla voce Source, scegli **GitHub Actions**.
6. Vai sulla scheda Actions, apri "Aggiorna sommario Acausali" e premi **Run workflow**. Dopo circa un minuto la pagina è online.
7. L'indirizzo sarà `https://NOMEUTENTE.github.io/acausali/`.
8. In Substack, nelle impostazioni del sito, aggiungi alla barra di navigazione un link esterno a quell'indirizzo, con l'etichetta che preferisci.

## Come funziona

Ogni giorno lo script chiede a Substack gli articoli che contengono "Acausali", tiene solo quelli che portano la parola nel titolo o nell'incipit, li ordina dal I in poi e riscrive la pagina. Se l'archivio non risponde o non trova nulla, la pagina precedente resta online.

## Cosa modificare

Tutto si cambia in testa a `scripts/build.mjs`:
- `TITLE` e `INTRO`: titolo e testo di presentazione.
- `ORDER`: `'asc'` dal I in poi, `'desc'` dal più recente.
- `PUB`: indirizzo della pubblicazione.

## Prova in locale

`node scripts/build.mjs --fixture test/fixture.json` genera la pagina con dati di prova in `docs/index.html`.
