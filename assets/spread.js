(function () {
  const BASE_PATH = "/Quick-Draw-Tarot";
  const STORAGE_KEY = "tarot_spread_v1";
  const panelStateBySelector = {};

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

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/\"/g, "&quot;")
      .replace(/'/g, "&#39;");
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
    if (!spreadType) return null;

    const normalizedMeta = normalizeMeta(spreadTypeId, meta || {});
    if (spreadTypeId === "decision" && (!normalizedMeta.optionA || !normalizedMeta.optionB)) {
      return null;
    }

    const positions = {};
    spreadType.positions.forEach(function (position) {
      positions[position.key] = null;
    });

    return saveSpread({
      type: spreadTypeId,
      createdAt: new Date().toISOString(),
      meta: normalizedMeta,
      positions,
    });
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

    for (const position of getPositionList(current)) {
      if (!current.positions[position.key]) return position.key;
    }
    return null;
  }

  function getProgress(spread) {
    const current = spread || getSpread();
    const positions = getPositionList(current);
    const placed = positions.filter(function (position) {
      return current && current.positions[position.key];
    }).length;
    return { placed, total: positions.length };
  }

  function hasPlacedCards(spread) {
    return getProgress(spread).placed > 0;
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
    return getPositionList(spread).some(function (position) {
      const card = spread.positions[position.key];
      return card && card.slug === slug;
    });
  }

  function addCardToSpread(cardMeta) {
    const spread = getSpread();
    if (!spread) return { ok: false, message: "Start a spread first." };

    const open = nextOpenPosition(spread);
    if (!open) return { ok: false, message: "Spread complete." };
    if (hasDuplicate(spread, cardMeta.slug)) return { ok: false, message: "Already in this spread." };

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

  function getPanelState(selector) {
    if (!panelStateBySelector[selector]) {
      panelStateBySelector[selector] = {
        phase: "idle",
        timerId: null,
        overlayNode: null,
        form: {
          type: "past-present-future",
          intention: "",
          optionA: "",
          optionB: "",
        },
      };
    }
    return panelStateBySelector[selector];
  }

  function stopGroundingTransition(selector) {
    const state = getPanelState(selector);
    if (state.timerId) {
      clearTimeout(state.timerId);
      state.timerId = null;
    }
    if (state.overlayNode && state.overlayNode.parentNode) {
      state.overlayNode.parentNode.removeChild(state.overlayNode);
    }
    state.overlayNode = null;
    state.phase = "idle";
  }

  function buildStartMeta(state) {
    const meta = {};
    if (state.form.intention.trim()) {
      meta.intention = state.form.intention.trim();
    }
    if (state.form.type === "decision") {
      meta.optionA = state.form.optionA.trim();
      meta.optionB = state.form.optionB.trim();
    }
    return meta;
  }

  function runGroundingTransition(selector, onComplete) {
    const state = getPanelState(selector);
    stopGroundingTransition(selector);

    state.phase = "transition";

    const overlay = document.createElement("div");
    overlay.setAttribute("role", "button");
    overlay.setAttribute("aria-label", "Skip grounding and begin reading");
    overlay.style.position = "fixed";
    overlay.style.inset = "0";
    overlay.style.background = "rgba(20, 13, 28, 0.88)";
    overlay.style.display = "flex";
    overlay.style.alignItems = "center";
    overlay.style.justifyContent = "center";
    overlay.style.padding = "24px";
    overlay.style.zIndex = "9999";
    overlay.style.opacity = "0";
    overlay.style.transition = "opacity 300ms ease";

    const panel = document.createElement("div");
    panel.className = "panel";
    panel.style.maxWidth = "560px";
    panel.style.width = "100%";
    panel.style.textAlign = "center";
    panel.innerHTML =
      '<h2>Get Ready</h2>' +
      '<p>Take one steady breath.<br />Name your intention quietly.<br />Let the next card meet you where you are.</p>' ;

    overlay.appendChild(panel);
    document.body.appendChild(overlay);
    state.overlayNode = overlay;

    requestAnimationFrame(function () {
      overlay.style.opacity = "1";
    });

    let settled = false;
    function finish() {
      if (settled) return;
      settled = true;
      if (state.timerId) {
        clearTimeout(state.timerId);
        state.timerId = null;
      }

      overlay.style.opacity = "0";
      setTimeout(function () {
        if (overlay.parentNode) {
          overlay.parentNode.removeChild(overlay);
        }
        state.overlayNode = null;
        state.phase = "idle";
        onComplete();
      }, 300);
    }

    overlay.addEventListener("click", finish);
    state.timerId = setTimeout(finish, 3000);
  }

  function readFormFromDom(container, state) {
    const typeSelect = container.querySelector('#spread-type-select');
    const intentionInput = container.querySelector('#spread-intention');
    const optionAInput = container.querySelector('#decision-option-a');
    const optionBInput = container.querySelector('#decision-option-b');

    if (typeSelect) state.form.type = typeSelect.value;
    if (intentionInput) state.form.intention = intentionInput.value;
    state.form.optionA = optionAInput ? optionAInput.value : '';
    state.form.optionB = optionBInput ? optionBInput.value : '';
  }

  function decisionFieldsValid(state) {
    if (state.form.type !== 'decision') return true;
    return Boolean(state.form.optionA.trim() && state.form.optionB.trim());
  }

  function renderSpreadPanel(selector) {
    const container = document.querySelector(selector);
    if (!container) return;

    const spread = getSpread();
    const open = spread ? nextOpenPosition(spread) : null;
    const cardMeta = getCardMetaFromPage();
    const panelState = getPanelState(selector);

    if (spread && panelState.phase !== 'idle') {
      stopGroundingTransition(selector);
    }

    let html = '<div class="panel">';
    html += '<h2>Spread</h2>';
    html += '<p data-role="spread-message" class="nfc-progress"></p>';

    if (!spread) {
      const beginDisabled = !decisionFieldsValid(panelState) ? ' disabled' : '';

      html += '<p>Start a Spread</p>';
      html += '<div class="list">';
      html += '<label for="spread-type-select">Spread type</label>';
      html += `<select id="spread-type-select">${spreadTypeOptions(panelState.form.type)}</select>`;
      html += '<label for="spread-intention">Intention (optional)</label>';
      html += `<input id="spread-intention" type="text" placeholder="What do you want clarity on today?" value="${escapeHtml(panelState.form.intention)}" />`;
      html += '<p>This will appear at the top of your spread summary.</p>';

      if (panelState.form.type === 'decision') {
        html += `<label for="decision-option-a">Option A</label>`;
        html += `<input id="decision-option-a" type="text" placeholder="Name Option A" value="${escapeHtml(panelState.form.optionA)}" />`;
        html += `<label for="decision-option-b">Option B</label>`;
        html += `<input id="decision-option-b" type="text" placeholder="Name Option B" value="${escapeHtml(panelState.form.optionB)}" />`;
      }

      html += `<button type="button" class="button" data-action="begin"${beginDisabled}>Begin Reading</button>`;
      html += '</div>';
    } else {
      const spreadType = getSpreadType(spread.type);
      const spreadLabel = spreadType ? spreadType.label : spread.type;
      const progress = getProgress(spread);
      html += `<p>Spread: ${spreadLabel}</p>`;
      if (spread.meta && spread.meta.intention) {
        html += `<p>Intention: ${spread.meta.intention}</p>`;
      }

      if (!open) {
        html += '<p>Spread complete.</p>';
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

    html += '</div>';
    container.innerHTML = html;

    const beginButton = container.querySelector('[data-action="begin"]');
    const addButton = container.querySelector('[data-action="add"]');
    const endButton = container.querySelector('[data-action="end"]');
    const restartButton = container.querySelector('[data-action="restart"]');

    const typeSelect = container.querySelector('#spread-type-select');
    if (typeSelect) {
      typeSelect.addEventListener('change', function () {
        readFormFromDom(container, panelState);
        renderSpreadPanel(selector);
      });
    }

    if (beginButton || container.querySelector('#spread-intention') || container.querySelector('#decision-option-a') || container.querySelector('#decision-option-b')) {
      container.addEventListener('input', function () {
        readFormFromDom(container, panelState);
        const button = container.querySelector('[data-action="begin"]');
        if (button) {
          button.disabled = !decisionFieldsValid(panelState);
        }
      });
    }

    if (beginButton) {
      beginButton.addEventListener('click', function () {
        readFormFromDom(container, panelState);
        if (!decisionFieldsValid(panelState)) {
          setMessage(container, 'Please fill Option A and Option B first.');
          return;
        }

        runGroundingTransition(selector, function () {
          const started = startSpread(panelState.form.type, buildStartMeta(panelState));
          if (!started) {
            renderSpreadPanel(selector);
            setMessage(container, 'Please complete required fields before starting this spread.');
            return;
          }

          window.location.href = `${BASE_PATH}/spread/`;
        });
      });
    }

    if (addButton && cardMeta) {
      addButton.addEventListener('click', function () {
        const result = addCardToSpread(cardMeta);
        renderSpreadPanel(selector);
        setMessage(container, result.message);
      });
    }

    if (endButton) {
      endButton.addEventListener('click', function () {
        clearSpread();
        stopGroundingTransition(selector);
        renderSpreadPanel(selector);
        setMessage(container, 'Spread cleared.');
      });
    }

    if (restartButton) {
      restartButton.addEventListener('click', function () {
        clearSpread();
        stopGroundingTransition(selector);
        renderSpreadPanel(selector);
        setMessage(container, 'Start a new spread below.');
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
