// Injected into the active tab on toolbar click.
// Scrolls the page top-to-bottom, asks the background worker to capture each
// viewport tile, stitches them onto one tall canvas, then downloads a PNG.

(async function () {
  // Guard against double-runs if the user clicks the icon again mid-capture.
  if (window.__fullPageShotRunning) return;
  window.__fullPageShotRunning = true;

  const docEl = document.documentElement;
  const body = document.body;

  // --- remember state we are about to change, so we can restore it ---
  const original = {
    scrollX: window.scrollX,
    scrollY: window.scrollY,
    scrollBehavior: docEl.style.scrollBehavior,
  };

  // Kill smooth-scroll so scrollTo is instant.
  docEl.style.scrollBehavior = "auto";

  // Hide scrollbars (just the visual line) during capture.
  const hideScrollbarStyle = document.createElement("style");
  hideScrollbarStyle.textContent =
    "::-webkit-scrollbar{display:none !important}";
  docEl.appendChild(hideScrollbarStyle);

  const ui = createOverlay();

  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

  function fullHeight() {
    return Math.max(
      body ? body.scrollHeight : 0,
      body ? body.offsetHeight : 0,
      docEl.scrollHeight,
      docEl.offsetHeight,
      docEl.clientHeight
    );
  }

  function captureTile() {
    return new Promise((resolve, reject) => {
      chrome.runtime.sendMessage({ type: "CAPTURE_TILE" }, (resp) => {
        if (chrome.runtime.lastError) {
          reject(new Error(chrome.runtime.lastError.message));
        } else if (!resp || !resp.ok) {
          reject(new Error(resp ? resp.error : "no response"));
        } else {
          resolve(resp.dataUrl);
        }
      });
    });
  }

  function loadImage(dataUrl) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error("tile decode failed"));
      img.src = dataUrl;
    });
  }

  // Collect position:fixed / sticky elements so we can hide them on every
  // tile except the first — otherwise headers repeat down the whole image.
  function collectFixed() {
    const out = [];
    const all = document.body ? document.body.querySelectorAll("*") : [];
    for (const el of all) {
      if (el === ui.root || ui.root.contains(el)) continue;
      const pos = getComputedStyle(el).position;
      if (pos === "fixed" || pos === "sticky") {
        out.push({ el, visibility: el.style.visibility });
      }
    }
    return out;
  }

  function setFixedHidden(list, hidden) {
    for (const item of list) {
      item.el.style.visibility = hidden ? "hidden" : item.visibility;
    }
  }

  try {
    const viewportH = window.innerHeight;
    const totalH = fullHeight();

    // Canvas pixel dimensions come from the actual captured tiles (which are
    // already at the device pixel ratio), so retina displays stay sharp.
    window.scrollTo(0, 0);
    await sleep(120);

    const fixedEls = collectFixed();

    // First tile: everything visible.
    ui.setProgress(0, 1);
    const firstDataUrl = await captureTile();
    const firstImg = await loadImage(firstDataUrl);

    const scale = firstImg.width / (docEl.clientWidth || window.innerWidth);
    const canvas = document.createElement("canvas");
    canvas.width = firstImg.width;
    // Guard against the browser's max canvas height.
    const MAX_H = 32767;
    canvas.height = Math.min(Math.round(totalH * scale), MAX_H);
    const ctx = canvas.getContext("2d");
    ctx.drawImage(firstImg, 0, 0);

    // Build the list of scroll positions.
    const positions = [];
    for (let y = viewportH; y < totalH; y += viewportH) positions.push(y);

    let done = 1;
    const totalTiles = positions.length + 1;

    for (const targetY of positions) {
      // Hide sticky/fixed stuff so it doesn't repeat.
      setFixedHidden(fixedEls, true);
      window.scrollTo(0, targetY);
      await sleep(180); // let paint + lazy content settle

      const realY = window.scrollY;
      ui.hide();
      let dataUrl;
      try {
        dataUrl = await captureTile();
      } finally {
        ui.show();
      }
      const img = await loadImage(dataUrl);
      ctx.drawImage(img, 0, Math.round(realY * scale));

      done += 1;
      ui.setProgress(done, totalTiles);

      // If we couldn't scroll any further, we've hit the bottom.
      if (realY + viewportH >= totalH) break;
    }

    setFixedHidden(fixedEls, false);

    ui.setStatus("Saving…");
    const filename = buildFilename();
    await saveCanvas(canvas, filename);
    ui.success();
    await sleep(900);
  } catch (err) {
    console.error("Full Page Screenshot error:", err);
    ui.error(err && err.message ? err.message : String(err));
    await sleep(2500);
  } finally {
    // --- restore everything ---
    try {
      hideScrollbarStyle.remove();
    } catch (_) {}
    docEl.style.scrollBehavior = original.scrollBehavior;
    window.scrollTo(original.scrollX, original.scrollY);
    ui.destroy();
    window.__fullPageShotRunning = false;
  }

  // ---------- helpers ----------

  function buildFilename() {
    const host = location.hostname.replace(/^www\./, "") || "page";
    const d = new Date();
    const pad = (n) => String(n).padStart(2, "0");
    const stamp =
      `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}` +
      `_${pad(d.getHours())}-${pad(d.getMinutes())}-${pad(d.getSeconds())}`;
    return `fullpage_${host}_${stamp}.png`;
  }

  function saveCanvas(canvas, filename) {
    return new Promise((resolve, reject) => {
      const finish = (blob) => {
        if (!blob) return reject(new Error("toBlob returned null"));
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        a.remove();
        setTimeout(() => URL.revokeObjectURL(url), 15000);
        resolve();
      };
      try {
        canvas.toBlob(finish, "image/png");
      } catch (e) {
        reject(e);
      }
    });
  }

  function createOverlay() {
    const root = document.createElement("div");
    root.setAttribute("data-fullpage-shot", "ui");
    Object.assign(root.style, {
      position: "fixed",
      zIndex: "2147483647",
      top: "16px",
      right: "16px",
      padding: "12px 16px",
      background: "rgba(17,17,17,0.92)",
      color: "#fff",
      font: "500 13px/1.4 system-ui, -apple-system, Segoe UI, Roboto, sans-serif",
      borderRadius: "12px",
      boxShadow: "0 8px 30px rgba(0,0,0,0.35)",
      minWidth: "190px",
      pointerEvents: "none",
      transition: "opacity .15s ease",
    });

    const label = document.createElement("div");
    label.textContent = "📸 Full page capture…";
    label.style.marginBottom = "8px";

    const barWrap = document.createElement("div");
    Object.assign(barWrap.style, {
      height: "6px",
      width: "100%",
      background: "rgba(255,255,255,0.18)",
      borderRadius: "999px",
      overflow: "hidden",
    });
    const bar = document.createElement("div");
    Object.assign(bar.style, {
      height: "100%",
      width: "0%",
      background: "linear-gradient(90deg,#4f9cff,#6ad0ff)",
      borderRadius: "999px",
      transition: "width .2s ease",
    });
    barWrap.appendChild(bar);
    root.appendChild(label);
    root.appendChild(barWrap);
    (document.body || document.documentElement).appendChild(root);

    return {
      root,
      setProgress(done, total) {
        const pct = Math.round((done / total) * 100);
        bar.style.width = pct + "%";
        label.textContent = `📸 Capturing… ${done}/${total}`;
      },
      setStatus(text) {
        label.textContent = text;
      },
      success() {
        label.textContent = "✅ Saved!";
        bar.style.width = "100%";
        bar.style.background = "#34c759";
      },
      error(m) {
        label.textContent = "⚠️ " + m;
        bar.style.background = "#ff5a5a";
      },
      hide() {
        root.style.opacity = "0";
      },
      show() {
        root.style.opacity = "1";
      },
      destroy() {
        try {
          root.remove();
        } catch (_) {}
      },
    };
  }
})();
