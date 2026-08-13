browser.browserAction.onClicked.addListener(async (tab) => {
  if (!tab.id || !tab.url || !tab.url.includes("soybooru.com")) return;
  try {
    await browser.tabs.sendMessage(tab.id, { action: "togglePanel" });
  } catch (_) {}
});
