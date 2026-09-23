async function getMusicTab() {
  const tabs = await chrome.tabs.query({ url: "https://music.youtube.com/*" });
  return tabs[0];
}

chrome.runtime.onMessage.addListener(async (message, sender) => {
  const tab = await getMusicTab();
  if (!tab?.id) return;
  chrome.tabs.sendMessage(tab.id, message).catch(() => {});
});

chrome.runtime.onMessageExternal.addListener(async (message, sender, sendResponse) => {
  const tab = await getMusicTab();
  if (!tab?.id) {
    sendResponse({ ok: false, error: "Open YouTube Music first." });
    return;
  }
  chrome.tabs.sendMessage(tab.id, message)
    .then(() => sendResponse({ ok: true }))
    .catch(err => sendResponse({ ok: false, error: String(err) }));
  return true;
});
