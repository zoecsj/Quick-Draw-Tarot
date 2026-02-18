#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const BASE_PATH = '/Quick-Draw-Tarot';
const ROOT = path.resolve(__dirname, '..');
const dataPath = path.join(ROOT, 'data', 'cards.json');
const cardsDir = path.join(ROOT, 'cards');

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function cardPageHtml(card) {
  const keywords = card.keywords.join(' · ');
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${escapeHtml(card.title)} | Quick Draw Tarot</title>
    <link rel="stylesheet" href="${BASE_PATH}/main.css" />
  </head>
  <body>
    <header>
      <nav class="nav">
        <a href="${BASE_PATH}/">Quick Draw Tarot</a>
        <div class="nav-links">
          <a href="${BASE_PATH}/">Home</a>
          <a href="${BASE_PATH}/spread/">Spreads</a>
          <a href="${BASE_PATH}/cards/">Cards</a>
          <a href="${BASE_PATH}/guide">How to Read</a>
        </div>
      </nav>
    </header>

    <main>
      <section class="section">
        <div class="panel">
          <span class="tag">${escapeHtml(card.tag)}</span>
          <h1>${escapeHtml(card.title)}</h1>
          <p>${escapeHtml(card.description)}</p>
          <div id="spread-panel"></div>
        </div>
      </section>

      <section class="section">
        <div class="grid">
          <article class="card">
            <h3>Keywords</h3>
            <p>${escapeHtml(keywords)}</p>
          </article>
          <article class="card">
            <h3>Upright</h3>
            <p>${escapeHtml(card.upright)}</p>
          </article>
          <article class="card">
            <h3>Reversed</h3>
            <p>${escapeHtml(card.reversed)}</p>
          </article>
        </div>
      </section>

      <section class="section">
        <div class="panel">
          <h2>Reflection</h2>
          <p>${escapeHtml(card.prompt)}</p>
        </div>
      </section>

    </main>

    <script type="application/json" id="card-meta">
      { "slug": "${escapeHtml(card.slug)}", "title": "${escapeHtml(card.title)}", "path": "/cards/${escapeHtml(card.slug)}.html" }
    </script>
    <script src="${BASE_PATH}/assets/spread.js"></script>
    <script>
      window.TarotSpread.renderSpreadPanel("#spread-panel");
    </script>
  </body>
</html>
`;
}

function cardsIndexHtml(cards) {
  const groups = [
    { title: 'Major Arcana', key: 'major' },
    { title: 'Wands', key: 'wands' },
    { title: 'Cups', key: 'cups' },
    { title: 'Swords', key: 'swords' },
    { title: 'Pentacles', key: 'pentacles' },
  ];

  const grouped = {
    major: cards.filter((card) => card.tag === 'Major Arcana'),
    wands: cards.filter((card) => card.tag.includes('Wands')),
    cups: cards.filter((card) => card.tag.includes('Cups')),
    swords: cards.filter((card) => card.tag.includes('Swords')),
    pentacles: cards.filter((card) => card.tag.includes('Pentacles')),
  };

  const sections = groups
    .map((group) => {
      const entries = grouped[group.key]
        .map((card) => `
          <article class="card">
            <h3>${escapeHtml(card.title)}</h3>
            <p>${escapeHtml(card.description)}</p>
            <a href="${BASE_PATH}/cards/${escapeHtml(card.slug)}.html">Open card</a>
          </article>
        `)
        .join('');

      return `
        <section class="section">
          <h2>${group.title}</h2>
          <div class="grid">
            ${entries}
          </div>
        </section>
      `;
    })
    .join('');

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Cards | Quick Draw Tarot</title>
    <link rel="stylesheet" href="${BASE_PATH}/main.css" />
  </head>
  <body>
    <header>
      <nav class="nav">
        <a href="${BASE_PATH}/">Quick Draw Tarot</a>
        <div class="nav-links">
          <a href="${BASE_PATH}/">Home</a>
          <a href="${BASE_PATH}/spread/">Spreads</a>
          <a href="${BASE_PATH}/cards/">Cards</a>
          <a href="${BASE_PATH}/guide">How to Read</a>
        </div>
      </nav>
    </header>

    <main>
      <section class="section">
        <div class="panel">
          <span class="tag">Card Library</span>
          <h1>All Cards</h1>
          <p>Tap NFC cards to open pages directly.</p>
        </div>
      </section>
      ${sections}
    </main>
  </body>
</html>
`;
}

function writeFile(targetPath, content) {
  fs.writeFileSync(targetPath, content, 'utf8');
}

function run() {
  const dataset = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
  const cards = dataset.cards;

  for (const card of cards) {
    const pagePath = path.join(cardsDir, `${card.slug}.html`);
    writeFile(pagePath, cardPageHtml(card));
  }

  writeFile(path.join(cardsDir, 'index.html'), cardsIndexHtml(cards));

  console.log(`Generated ${cards.length} card pages and cards/index.html`);
}

run();
