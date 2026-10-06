(() => {
  const SITE = location.hostname.includes("facebook") ? "Facebook" : "Instagram";

  let badge = null;
  let timer = null;

  // ---------- countdown badge (top-right) ----------
  function ensureBadge() {
    if (badge) return badge;
    badge = document.createElement("div");
    badge.id = "ft-badge";
    document.documentElement.appendChild(badge);
    return badge;
  }

  function fmt(ms) {
    const s = Math.max(0, Math.ceil(ms / 1000));
    const m = Math.floor(s / 60);
    const r = s % 60;
    return m + ":" + String(r).padStart(2, "0");
  }

  function startCountdown(minutes) {
    const endTime = Date.now() + minutes * 60 * 1000;
    const el = ensureBadge();

    const tick = () => {
      const left = endTime - Date.now();
      if (left <= 0) {
        clearInterval(timer);
        el.textContent = "Time's up";
        // Ask the background script to close this tab
        chrome.runtime.sendMessage({ type: "closeTab" });
        return;
      }
      el.textContent = fmt(left) + " left";
    };

    tick();
    timer = setInterval(tick, 1000);
  }

  // ---------- asking overlay ----------
  function ask() {
    const overlay = document.createElement("div");
    overlay.id = "ft-overlay";
    overlay.innerHTML = `
      <div class="ft-card">
        <div class="ft-site">${SITE}</div>
        <h1>How many minutes?</h1>
        <div class="ft-quick">
          <button data-min="5">5</button>
          <button data-min="10">10</button>
          <button data-min="15">15</button>
          <button data-min="30">30</button>
        </div>
        <div class="ft-custom">
          <input id="ft-input" type="number" min="1" max="300" placeholder="custom">
          <span>minutes</span>
        </div>
        <button id="ft-start">Start</button>
        <button id="ft-cancel">Not now — close tab</button>
      </div>
    `;
    document.documentElement.appendChild(overlay);

    const input  = overlay.querySelector("#ft-input");
    const start  = overlay.querySelector("#ft-start");
    const cancel = overlay.querySelector("#ft-cancel");

    const go = (mins) => {
      const n = Number(mins);
      if (!Number.isFinite(n) || n <= 0) {
        input.focus();
        return;
      }
      overlay.remove();
      startCountdown(Math.min(n, 300));
    };

    overlay.querySelectorAll(".ft-quick button").forEach((b) => {
      b.addEventListener("click", () => go(b.dataset.min));
    });

    start.addEventListener("click", () => go(input.value));
    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter") go(input.value);
    });

    cancel.addEventListener("click", () => {
      chrome.runtime.sendMessage({ type: "closeTab" });
    });

    input.focus();
  }

  ask();
})();