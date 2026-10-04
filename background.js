// Link2QR — right-click menu: send link/page/selection to the QR page.
const MENU = {
  link: "l2qr-link",
  page: "l2qr-page",
  selection: "l2qr-selection",
};

chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.removeAll(() => {
    chrome.contextMenus.create({
      id: MENU.link,
      title: "把链接生成二维码",
      contexts: ["link"],
    });
    chrome.contextMenus.create({
      id: MENU.page,
      title: "把当前页面生成二维码",
      contexts: ["page"],
    });
    chrome.contextMenus.create({
      id: MENU.selection,
      title: "把选中文字生成二维码",
      contexts: ["selection"],
    });
  });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  const text =
    info.menuItemId === MENU.link
      ? info.linkUrl
      : info.menuItemId === MENU.selection
        ? info.selectionText
        : info.pageUrl;
  if (!text) return;
  const url = chrome.runtime.getURL(
    "popup.html?t=" + encodeURIComponent(text),
  );
  chrome.tabs.create({ url });
});
