chrome.runtime.onMessage.addListener((msg, sender) => {
  if (msg.type === "closeTab" && sender.tab) {
    chrome.tabs.remove(sender.tab.id);
  }
});