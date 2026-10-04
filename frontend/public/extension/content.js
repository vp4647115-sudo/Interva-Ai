console.log("IntervAI Buddy content script loaded");

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message?.type === "getPageText") {
    const text = document.body?.innerText || document.body?.textContent || "";
    sendResponse({ text: text.slice(0, 4000) });
    return true;
  }

  if (message?.type === "getPageMetadata") {
    sendResponse({
      url: location.href,
      title: document.title,
      text: (document.body?.innerText || document.body?.textContent || "").slice(0, 4000),
    });
    return true;
  }

  return false;
});
