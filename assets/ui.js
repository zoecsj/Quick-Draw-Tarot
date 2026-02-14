(function () {
  function renderHomeSpreadStatus(selector) {
    const container = document.querySelector(selector);
    if (!container || !window.TarotSpread) return;

    const spread = window.TarotSpread.getSpread();
    if (!spread) {
      container.innerHTML = "";
      return;
    }

    const next = window.TarotSpread.nextOpenPosition(spread);
    const status = next ? "Past/Present/Future" : "Complete";

    container.innerHTML = `
      <div class="panel">
        <h2>Spread in progress: ${status}</h2>
        <p>${next ? `Next position: ${window.TarotSpread.capitalize(next)}.` : "All positions are filled."}</p>
        <div class="list">
          <a class="button" href="${window.TarotSpread.BASE_PATH}/spread/">View spread</a>
          <button class="button secondary" type="button" data-action="clear-home-spread">Clear spread</button>
        </div>
      </div>
    `;

    const clearButton = container.querySelector('[data-action="clear-home-spread"]');
    clearButton.addEventListener("click", function () {
      window.TarotSpread.clearSpread();
      renderHomeSpreadStatus(selector);
    });
  }

  function renderSpreadSummary(selector, cardDetailsMap) {
    const container = document.querySelector(selector);
    if (!container || !window.TarotSpread) return;

    const spread = window.TarotSpread.getSpread();
    const positions = spread && spread.positions ? spread.positions : { past: null, present: null, future: null };

    container.innerHTML = ["past", "present", "future"]
      .map(function (position) {
        const card = positions[position];
        if (!card) {
          return `
            <article class="card">
              <h3>${window.TarotSpread.capitalize(position)}</h3>
              <p>Empty — tap a card to add.</p>
            </article>
          `;
        }

        const details = cardDetailsMap[card.slug];
        return `
          <article class="card">
            <h3>${window.TarotSpread.capitalize(position)}</h3>
            <a href="${window.TarotSpread.BASE_PATH}${card.path}">${card.title}</a>
            <p>${details.description}</p>
            <p><strong>Keywords:</strong> ${details.keywords}</p>
            <p><strong>Upright:</strong> ${details.upright}</p>
            <p><strong>Reversed:</strong> ${details.reversed}</p>
            <p><strong>Reflection:</strong> ${details.reflection}</p>
          </article>
        `;
      })
      .join("");
  }

  window.TarotUI = {
    renderHomeSpreadStatus,
    renderSpreadSummary,
  };
})();
