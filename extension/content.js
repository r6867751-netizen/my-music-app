function clickFirst(selectors) {
  for (const selector of selectors) {
    const el = document.querySelector(selector);
    if (el) {
      el.click();
      return true;
    }
  }
  return false;
}

chrome.runtime.onMessage.addListener((message) => {
  if (message.action === "playPause") {
    clickFirst([
      "ytmusic-player-bar .play-pause-button",
      ".play-pause-button"
    ]);
  }

  if (message.action === "next") {
    clickFirst([
      "ytmusic-player-bar .next-button",
      ".next-button"
    ]);
  }

  if (message.action === "previous") {
    clickFirst([
      "ytmusic-player-bar .previous-button",
      ".previous-button"
    ]);
  }

  if (message.action === "search" && message.query) {
    location.href = "https://music.youtube.com/search?q=" + encodeURIComponent(message.query);
  }
});
