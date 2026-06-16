import { extractPageSignals } from "@/lib/extract";

export default defineBackground(() => {
  browser.runtime.onMessage.addListener((message, _sender, sendResponse) => {
    if (message.type === "EXTRACT_SIGNALS") {
      (async () => {
        try {
          const [tab] = await browser.tabs.query({ active: true, currentWindow: true });
          if (!tab?.id) {
            sendResponse({ ok: false, error: "No active tab found" });
            return;
          }
          const results = await browser.scripting.executeScript({
            target: { tabId: tab.id },
            func: extractPageSignals,
          });
          const signals = results?.[0]?.result;
          if (!signals) {
            sendResponse({ ok: false, error: "Could not extract page signals" });
            return;
          }
          sendResponse({ ok: true, signals });
        } catch (err) {
          sendResponse({
            ok: false,
            error: err instanceof Error ? err.message : "Unknown error",
          });
        }
      })();
      return true;
    }
  });
});
