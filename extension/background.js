function isLocalPdf(url) {
  if (!url) return false;
  const lowerUrl = url.toLowerCase();
  return lowerUrl.startsWith("file:///") && lowerUrl.endsWith(".pdf");
}

function getFilePathFromUrl(url) {
  if (!url || !url.startsWith("file:///")) return null;
  const decoded = decodeURIComponent(url);
  return decoded.substring(8).replace(/\//g, "\\");
}

function updateIconState(tabId, url) {
  if (isLocalPdf(url)) {
    chrome.action.enable(tabId);
  } else {
    chrome.action.disable(tabId);
  }
}

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (tab.url) updateIconState(tabId, tab.url);
});

chrome.tabs.onActivated.addListener(async (activeInfo) => {
  const tab = await chrome.tabs.get(activeInfo.tabId);
  if (tab && tab.url) updateIconState(activeInfo.tabId, tab.url);
});

async function processPdfDeletion(tab) {
  if (!tab || !isLocalPdf(tab.url)) return;

  const filePath = getFilePathFromUrl(tab.url);
  
  // Extract just the filename from the path (e.g. "C:\Docs\sample.pdf" -> "sample.pdf")
  const fileName = filePath ? filePath.split("\\").pop() : "PDF file";

  const tabId = tab.id;
  const nativeHostName = "com.pdf.deleter";

  try {
    await chrome.tabs.remove(tabId);
  } catch (e) {
    // Tab already closed
  }

  chrome.runtime.sendNativeMessage(
    nativeHostName,
    { filePath: filePath },
    (response) => {
      if (chrome.runtime.lastError || !response || response.status !== "success") {
        showErrorNotification(fileName);
      } else {
        showSuccessNotification(fileName);
      }
    }
  );
}

// Fixed Notifications with File Name
function showSuccessNotification(fileName) {
  const name = fileName || "PDF file";
  chrome.notifications.create({
    type: "basic",
    iconUrl: "icons/icon48.png",
    title: "PDF Deleter",
    message: `Moved "${name}" to the Recycle Bin.`
  });
}

function showErrorNotification(fileName) {
  const name = fileName || "PDF file";
  chrome.notifications.create({
    type: "basic",
    iconUrl: "icons/icon48.png",
    title: "PDF Deleter",
    message: `Couldn't move "${name}" to the Recycle Bin.`
  });
}

chrome.action.onClicked.addListener(processPdfDeletion);

chrome.commands.onCommand.addListener(async (command) => {
  if (command === "delete-pdf") {
    const [activeTab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (activeTab) processPdfDeletion(activeTab);
  }
});

chrome.runtime.onMessage.addListener((message, sender) => {
  if (message.action === "delete_current_pdf" && sender.tab) {
    processPdfDeletion(sender.tab);
  }
});