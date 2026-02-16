(function () {
  const BASE_PATH = "/Quick-Draw-Tarot";
  const STORAGE_KEY = "tarot_spread_v1";

  const SPREAD_TYPES = {
    daily: {
      label: "Daily Reading",
      positions: [{ key: "card", label: "Your Card" }],
    },
    "past-present-future": {
      label: "Past / Present / Future",
      positions: [
        { key: "past", label: "Past" },
        { key: "present", label: "Present" },
        { key: "future", label: "Future" },
      ],
    },
    hermit: {
      label: "Hermit's Guidance",
      positions: [
        { key: "dark", label: "Dark – What is the path before you?" },
        { key: "persona", label: "Persona – What mask do you present?" },
        { key: "true-self", label: "True Self – Who are you when alone?" },
        { key: "guiding-light", label: "Guiding Light – Your highest potential" },
      ],
    },
    clarity: {
      label: "Clarity",
      positions: [
        { key: "know", label: "What You Need to Know" },
        { key: "embrace", label: "What You Need to Embrace" },
        { key: "release", label: "What You Need to Release" },
        { key: "next", label: "What’s Next" },
      ],
    },
    "shadow-work": {
      label: "Shadow Work",
      positions: [
        { key: "trigger", label: "Trigger – What’s activating you right now?" },
        { key: "shadow", label: "Shadow – What part of you is being protected or hidden?" },
        { key: "root", label: "Root – Where did this pattern start?" },
        { key: "lesson", label: "Lesson – What is this trying to teach you?" },
        { key: "integration", label: "Integration – How can you heal and move forward?" },
      ],
    },
    decision: {
      label: "Decision",
      positions: [
        { key: "option-a", label: "Option A – What you gain" },
        { key: "option-a-cost", label: "Option A – What it costs" },
        { key: "option-b", label: "Option B – What you gain" },
        { key: "option-b-cost", label: "Option B – What it costs" },
        { key: "guidance", label: "Guidance – Best path or advice right now" },
      ],
    },
    "year-ahead": {
      label: "Year Ahead",
      positions: [
        { key: "january", label: "January" },
        { key: "february", label: "February" },
        { key: "march", label: "March" },
        { key: "april", label: "April" },
        { key: "may", label: "May" },
        { key: "june", label: "June" },
        { key: "july", label: "July" },
        { key: "august", label: "August" },
        { key: "september", label: "September" },
        { key: "october", label: "October" },
        { key: "november", label: "November" },
        { key: "december", label: "December" },
      ],
    },
  };

  function getSpreadType(type) {
    return SPREAD_TYPES[type] || null;
  }

  function normalizeMeta(type, meta) {
    const safeMeta = meta && typeof meta === "object" ? meta : {};
    const normalized = {};

    if (typeof safeMeta.intention === "string") {
      const trimmedIntention = safeMeta.intention.trim();
      if (trimmedIntention) {
        normalized.intention = trimmedIntention;
      }
    }

    if (type === "decision") {
      const optionA = typeof safeMeta.optionA === "string" ? safeMeta.optionA.trim() : "";
      const optionB = typeof safeMeta.optionB === "string" ? safeMeta.optionB.trim() : "";
      if (optionA) normalized.optionA = optionA;
      if (optionB) normalized.optionB = optionB;
    }

    return normalized;
  }

  function getSpread() {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;

    try {
      const parsed = JSON.parse(raw);
      const spreadType = parsed && parsed.type ? getSpreadType(parsed.type) : null;
      if (!parsed || !spreadType || !parsed.positions || typeof parsed.positions !== "object") {
        return null;
      }

      const normalizedPositions = {};
      spreadType.positions.forEach(function (position) {
        normalizedPositions[position.key] = parsed.positions[position.key] || null;
      });

      return {
        type: parsed.type,
        createdAt: parsed.createdAt || new Date().toISOString(),
        meta: normalizeMeta(parsed.type, parsed.meta || {}),
        positions: normalizedPositions,
      };
    } catch (error) {
      return null;
    }
  }

  function saveSpread(spread) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(spread));
    return spread;
  }

  function startSpread(type, meta) {
    const spreadTypeId = type || "past-present-future";
    const spreadType = getSpreadType(spreadTypeId);
    if (!spreadType) {
      return null;
    }

    const normalizedMeta = normalizeMeta(spreadTypeId, meta || {});
    if (spreadTypeId === "decision" && (!normalizedMeta.optionA || !normalizedMeta.optionB)) {
      return null;
    }

    const positions = {};
    spreadType.positions.forEach(function (position) {
      positions[position.key] = null;
    });

    const spread = {
      type: spreadTypeId,
      createdAt: new Date().toISOString(),
      meta: normalizedMeta,
      positions,
    };

    return saveSpread(spread);
  }

  function updateMeta(metaUpdates) {
    const spread = getSpread();
    if (!spread) return false;

    spread.meta = normalizeMeta(spread.type, Object.assign({}, spread.meta || {}, metaUpdates || {}));
    saveSpread(spread);
    return true;
  }

  function clearSpread() {
    localStorage.removeItem(STORAGE_KEY);
  }

  function getPositionList(spread) {
    const current = spread || getSpread();
    if (!current) return [];
    const spreadType = getSpreadType(current.type);
    if (!spreadType) return [];
    return spreadType.positions;
  }

  function nextOpenPosition(spread) {
    const current = spread || getSpread();
    if (!current) return null;

    const positions = getPositionList(current);
    for (const position of positions) {
      if (!current.positions[position.key]) {
        return position.key;
      }
    }

    return null;
  }

  function getProgress(spread) {
    const current = spread || getSpread();
    const positions = getPositionList(current);
    const placed = positions.filter(function (position) {
      return current && current.positions[position.key];
    }).length;

    return {
      placed,
      total: positions.length,
    };
  }

  function hasPlacedCards(spread) {
    const progress = getProgress(spread);
    return progress.placed > 0;
  }

  function getPositionLabel(type, key) {
    const spreadType = getSpreadType(type);
    if (!spreadType) return capitalize(key);
    const found = spreadType.positions.find(function (position) {
      return position.key === key;
    });
    return found ? found.label : capitalize(key);
  }

  function hasDuplicate(spread, slug) {
    const positions = getPositionList(spread);
    return positions.some(function (position) {
      const card = spread.positions[position.key];
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
    return { ok: true, position: open, message: `Added to ${getPositionLabel(spread.type, open)}.` };
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

  function spreadTypeOptions(selectedType) {
    return Object.keys(SPREAD_TYPES)
      .map(function (type) {
        const selected = selectedType === type ? " selected" : "";
        return `<option value="${type}"${selected}>${SPREAD_TYPES[type].label}</option>`;
      })
      .join("");
  }

  function renderSpreadPanel(selector) {
    const container = document.querySelector(selector);
    if (!container) return;

    const spread = getSpread();
    const open = spread ? nextOpenPosition(spread) : null;
    const cardMeta = getCardMetaFromPage();

    let html = '<div class="panel">';
    html += "<h2>Spread</h2>";
    html += '<p data-role="spread-message" class="nfc-progress"></p>';

    if (!spread) {
      html += '<p>Start a Spread</p>';
      html += '<div class="list">';
      html += '<label for="spread-type-select">Spread type</label>';
      html += `<select id="spread-type-select">${spreadTypeOptions("past-present-future")}</select>`;
      html += '<label for="spread-intention">Intention (optional)</label>';
      html += '<input id="spread-intention" type="text" placeholder="What do you want clarity on today?" />';
      html += '<p>This will appear at the top of your spread summary.</p>';
      html += '<div id="decision-meta-fields"></div>';
      html += '<button type="button" class="button" data-action="start">Start Spread</button>';
      html += "</div>";
    } else {
      const spreadType = getSpreadType(spread.type);
      const spreadLabel = spreadType ? spreadType.label : spread.type;
      const progress = getProgress(spread);
      html += `<p>Spread: ${spreadLabel}</p>`;
      if (spread.meta && spread.meta.intention) {
        html += `<p>Intention: ${spread.meta.intention}</p>`;
      }

      if (!open) {
        html += "<p>Spread complete.</p>";
        html += `<p>${progress.placed} of ${progress.total} cards placed.</p>`;
        html += `<a class="button secondary" href="${BASE_PATH}/spread/">View spread summary</a> `;
        html += '<button type="button" class="button" data-action="restart">Start new spread</button> ';
        html += '<button type="button" class="button secondary" data-action="end">End spread</button>';
      } else {
        html += `<p>Spread in progress: Next position = ${getPositionLabel(spread.type, open)}</p>`;
        html += `<p>${progress.placed} of ${progress.total} cards placed.</p>`;
        html += '<button type="button" class="button" data-action="add">Add this card</button> ';
        html += `<a class="button secondary" href="${BASE_PATH}/spread/">View spread</a> `;
        html += '<button type="button" class="button secondary" data-action="end">End spread</button>';
      }
    }

    html += "</div>";
    container.innerHTML = html;

    const startButton = container.querySelector('[data-action="start"]');
    const addButton = container.querySelector('[data-action="add"]');
    const endButton = container.querySelector('[data-action="end"]');
    const restartButton = container.querySelector('[data-action="restart"]');

    function updateDecisionFieldsAndStartState() {
      const typeSelect = container.querySelector('#spread-type-select');
      const metaFields = container.querySelector('#decision-meta-fields');
      const start = container.querySelector('[data-action="start"]');
      if (!typeSelect || !metaFields || !start) return;

      if (typeSelect.value === 'decision') {
        if (!container.querySelector('#decision-option-a')) {
          metaFields.innerHTML = [
            '<label for="decision-option-a">Option A</label>',
            '<input id="decision-option-a" type="text" placeholder="Name Option A" />',
            '<label for="decision-option-b">Option B</label>',
            '<input id="decision-option-b" type="text" placeholder="Name Option B" />'
          ].join('');
        }

        const optionA = container.querySelector('#decision-option-a');
        const optionB = container.querySelector('#decision-option-b');
        const filled = optionA && optionA.value.trim() && optionB && optionB.value.trim();
        start.disabled = !filled;
      } else {
        metaFields.innerHTML = '';
        start.disabled = false;
      }
    }

    if (startButton) {
      const typeSelect = container.querySelector('#spread-type-select');
      const intentionInput = container.querySelector('#spread-intention');

      if (typeSelect) {
        typeSelect.addEventListener('change', updateDecisionFieldsAndStartState);
      }

      container.addEventListener('input', function () {
        updateDecisionFieldsAndStartState();
      });

      updateDecisionFieldsAndStartState();

      startButton.addEventListener("click", function () {
        const spreadType = typeSelect ? typeSelect.value : "past-present-future";
        const meta = {};

        if (intentionInput && intentionInput.value.trim()) {
          meta.intention = intentionInput.value.trim();
        }

        if (spreadType === 'decision') {
          const optionA = container.querySelector('#decision-option-a');
          const optionB = container.querySelector('#decision-option-b');
          meta.optionA = optionA ? optionA.value.trim() : '';
          meta.optionB = optionB ? optionB.value.trim() : '';
        }

        const started = startSpread(spreadType, meta);
        if (!started) {
          setMessage(container, 'Please complete required fields before starting this spread.');
          return;
        }

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
        renderSpreadPanel(selector);
        setMessage(container, "Start a new spread below.");
      });
    }
  }

  window.TarotSpread = {
    BASE_PATH,
    STORAGE_KEY,
    SPREAD_TYPES,
    getSpread,
    startSpread,
    updateMeta,
    clearSpread,
    nextOpenPosition,
    addCardToSpread,
    getCardMetaFromPage,
    getPositionLabel,
    getPositionList,
    getProgress,
    hasPlacedCards,
    renderSpreadPanel,
    capitalize,
  };
})();
