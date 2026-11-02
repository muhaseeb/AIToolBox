// Service worker: handles the toolbar click and the actual pixel capture.
// captureVisibleTab can only be called from here, so the content script
// asks us for each tile over the message channel.

// Chrome rate-limits captureVisibleTab (~2/sec). Keep a minimum gap and
// retry if we still hit the limit.
const MIN_GAP_MS = 220;
let lastCaptureAt = 0;
let captureChain = Promise.resolve();

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function captureOnce(windowId) {
  const now = Date.now();
  const wait = MIN_GAP_MS - (now - lastCaptureAt);
  if (wait > 0) await sleep(wait);

  for (let attempt = 0; attempt < 5; attempt++) {
    try {
      const dataUrl = await chrome.tabs.captureVisibleTab(windowId, {
        format: "png",
      });
      lastCaptureAt = Date.now();
      return dataUrl;
    } catch (err) {
      const msg = String(err && err.message ? err.message : err);
      // Back off on the rate-limit error and try again.
      if (/MAX_CAPTURE|too many|rate/i.test(msg) && attempt < 4) {
        await sleep(350 * (attempt + 1));
        continue;
      }
      throw err;
    }
  }
  throw new Error("captureVisibleTab failed after retries");
}

// Serialize captures so two tiles never race the rate limiter.
function captureSerialized(windowId) {
  const next = captureChain.then(() => captureOnce(windowId));
  // Keep the chain alive even if one capture rejects.
  captureChain = next.catch(() => {});
  return next;
}

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg && msg.type === "CAPTURE_TILE") {
    const windowId = sender.tab ? sender.tab.windowId : undefined;
    captureSerialized(windowId)
      .then((dataUrl) => sendResponse({ ok: true, dataUrl }))
      .catch((err) => sendResponse({ ok: false, error: String(err) }));
    return true; // async response
  }
});

chrome.action.onClicked.addListener(async (tab) => {
  if (!tab || !tab.id) return;

  const url = tab.url || "";
  // We cannot inject into browser-internal pages or the web store.
  if (!/^https?:|^file:/i.test(url)) {
    await flashBadge(tab.id, "x", "#d93025");
    return;
  }

  try {
    await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      files: ["content.js"],
    });
  } catch (err) {
    console.error("Full Page Screenshot: injection failed", err);
    await flashBadge(tab.id, "!", "#d93025");
  }
});

async function flashBadge(tabId, text, color) {
  try {
    await chrome.action.setBadgeBackgroundColor({ tabId, color });
    await chrome.action.setBadgeText({ tabId, text });
    setTimeout(() => chrome.action.setBadgeText({ tabId, text: "" }), 2500);
  } catch (_) {
    /* ignore */
  }
}
