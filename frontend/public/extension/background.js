chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
  if (msg.type === "startCapture") {
    chrome.tabCapture.capture({ audio: false, video: true }, (stream) => {
      sendResponse({ streamId: stream?.id, ok: Boolean(stream) });
    });
    return true;
  }

  if (msg.type === "getActiveTabInfo") {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const tab = tabs[0];
      sendResponse({ tab: tab ? { id: tab.id, title: tab.title, url: tab.url } : null });
    });
    return true;
  }

  return false;
});
