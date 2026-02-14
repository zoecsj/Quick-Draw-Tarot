(function () {
  const BASE_PATH = "/Quick-Draw-Tarot";
  const STORAGE_KEY = "tarot_spread_v1";
  const POSITIONS = ["past", "present", "future"];

  function getSpread() {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;

    try {
      const parsed = JSON.parse(raw);
      if (!parsed || parsed.type !== "past-present-future" || !parsed.positions) {
        return null;
      }
      return parsed;
    } catch (error) {
      return null;
    }
  }

  function saveSpread(spread) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(spread));
    return spread;
  }

  function startSpread() {
    const spread = {
      type: "past-present-future",
      createdAt: new Date().toISOString(),
      positions: {
        past: null,
        present: null,
        future: null,
      },
    };

    return saveSpread(spread);
  }

  function clearSpread() {
    localStorage.removeItem(STORAGE_KEY);
  }

  function nextOpenPosition(spread) {
    const current = spread || getSpread();
    if (!current) return null;

    for (const position of POSITIONS) {
      if (!current.positions[position]) {
        return position;
      }
    }

    return null;
  }

  function hasDuplicate(spread, slug) {
    return POSITIONS.some((position) => {
      const card = spread.positions[position];
      return card && card.slug === slug;
    });
  }

  function addCardToSpread(cardMeta) {
    const spread = getSpread();
    if (!spread) {
      return { ok: false, message: "Start a spread first." };
    }

    const open = nextOpenPosition(spread);
    if (!open) {
      return { ok: false, message: "Spread complete." };
    }

    if (hasDuplicate(spread, cardMeta.slug)) {
      return { ok: false, message: "Already in this spread." };
    }

    spread.positions[open] = {
      slug: cardMeta.slug,
      title: cardMeta.title,
      path: cardMeta.path,
    };

    saveSpread(spread);
    return { ok: true, position: open, message: `Added to ${capitalize(open)}.` };
  }

  function getCardMetaFromPage() {
    const node = document.getElementById("card-meta");
    if (!node) return null;

    try {
      return JSON.parse(node.textContent);
    } catch (error) {
      return null;
    }
  }

  function capitalize(value) {
    return value.charAt(0).toUpperCase() + value.slice(1);
  }

  function setMessage(container, text) {
    const messageNode = container.querySelector('[data-role="spread-message"]');
    if (!messageNode) return;
    messageNode.textContent = text;
  }

  function renderSpreadPanel(selector) {
    const container = document.querySelector(selector);
    if (!container) return;

    const spread = getSpread();
    const open = spread ? nextOpenPosition(spread) : null;
    const cardMeta = getCardMetaFromPage();

    let html = '<div class="panel">';
    html += '<h2>Spread</h2>';
    html += '<p data-role="spread-message" class="nfc-progress"></p>';

    if (!spread) {
      html += '<p>No spread is active yet.</p>';
      html += '<button type="button" class="button" data-action="start">Start a Past / Present / Future spread</button>';
    } else if (!open) {
      html += '<p>Spread complete.</p>';
      html += `<a class="button secondary" href="${BASE_PATH}/spread/">View spread summary</a> `;
      html += '<button type="button" class="button" data-action="restart">Start new spread</button>';
    } else {
      html += `<p>Spread in progress: Next position = ${capitalize(open)}</p>`;
      html += `<button type="button" class="button" data-action="add">Add this card to ${capitalize(open)}</button> `;
      html += `<a class="button secondary" href="${BASE_PATH}/spread/">View spread</a> `;
      html += '<button type="button" class="button secondary" data-action="end">End spread</button>';
    }

    html += "</div>";
    container.innerHTML = html;

    const startButton = container.querySelector('[data-action="start"]');
    const addButton = container.querySelector('[data-action="add"]');
    const endButton = container.querySelector('[data-action="end"]');
    const restartButton = container.querySelector('[data-action="restart"]');

    if (startButton) {
      startButton.addEventListener("click", function () {
        startSpread();
        renderSpreadPanel(selector);
        setMessage(container, "Spread started.");
      });
    }

    if (addButton && cardMeta) {
      addButton.addEventListener("click", function () {
        const result = addCardToSpread(cardMeta);
        renderSpreadPanel(selector);
        setMessage(container, result.message);
      });
    }

    if (endButton) {
      endButton.addEventListener("click", function () {
        clearSpread();
        renderSpreadPanel(selector);
        setMessage(container, "Spread cleared.");
      });
    }

    if (restartButton) {
      restartButton.addEventListener("click", function () {
        clearSpread();
        startSpread();
        renderSpreadPanel(selector);
        setMessage(container, "Started a new spread.");
      });
    }
  }

  window.TarotSpread = {
    BASE_PATH,
    STORAGE_KEY,
    getSpread,
    startSpread,
    clearSpread,
    nextOpenPosition,
    addCardToSpread,
    getCardMetaFromPage,
    renderSpreadPanel,
    capitalize,
  };
})();
