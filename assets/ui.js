(function () {
  function renderHomeSpreadStatus(selector) {
    const container = document.querySelector(selector);
    if (!container || !window.TarotSpread) return;

    const spread = window.TarotSpread.getSpread();
    if (!spread) {
      container.innerHTML = '';
      return;
    }

    const spreadType = window.TarotSpread.SPREAD_TYPES[spread.type];
    const spreadLabel = spreadType ? spreadType.label : spread.type;
    const next = window.TarotSpread.nextOpenPosition(spread);

    container.innerHTML = `
      <div class="panel">
        <h2>Spread in progress: ${spreadLabel}</h2>
        <p>${next ? `Next position: ${window.TarotSpread.getPositionLabel(spread.type, next)}.` : 'All positions are filled.'}</p>
        <div class="list">
          <a class="button" href="${window.TarotSpread.BASE_PATH}/spread/">View spread</a>
          <button class="button secondary" type="button" data-action="clear-home-spread">Clear spread</button>
        </div>
      </div>
    `;

    const clearButton = container.querySelector('[data-action="clear-home-spread"]');
    clearButton.addEventListener('click', function () {
      window.TarotSpread.clearSpread();
      renderHomeSpreadStatus(selector);
    });
  }

  function renderSpreadSummary(selector, cardDetailsMap) {
    const container = document.querySelector(selector);
    if (!container || !window.TarotSpread) return;

    const spread = window.TarotSpread.getSpread();
    if (!spread) {
      container.innerHTML = '<article class="card"><h3>No active spread</h3><p>Start a spread from any card page.</p></article>';
      return;
    }

    const positions = window.TarotSpread.getPositionList(spread);
    container.innerHTML = positions
      .map(function (position) {
        const card = spread.positions[position.key];
        if (!card) {
          return `
            <article class="card">
              <h3>${position.label}</h3>
              <p>Empty — tap a card to add.</p>
            </article>
          `;
        }

        const details = cardDetailsMap[card.slug] || {};
        return `
          <article class="card">
            <h3>${position.label}</h3>
            <a href="${window.TarotSpread.BASE_PATH}${card.path}">${card.title}</a>
            <p>${details.description || ''}</p>
            <p><strong>Keywords:</strong> ${details.keywords || ''}</p>
            <p><strong>Upright:</strong> ${details.upright || ''}</p>
            <p><strong>Reversed:</strong> ${details.reversed || ''}</p>
            <p><strong>Reflection:</strong> ${details.reflection || ''}</p>
          </article>
        `;
      })
      .join('');
  }

  window.TarotUI = {
    renderHomeSpreadStatus,
    renderSpreadSummary,
  };
})();
