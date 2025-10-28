const enabledTabs = new Set<number>();
const STYLE_ID = 'custom-direction-styles'; // Unique identifier for our styles

chrome.action.onClicked.addListener(async (tab) => {
  console.log('tab is:', tab);

  if (!tab.id) return;

  const tabId = tab.id;
  const isEnabled = enabledTabs.has(tabId);

  try {
    if (isEnabled) {
      await chrome.scripting.executeScript({
        target: { tabId },
        func: removeStyles,
        args: [STYLE_ID], // Pass the style ID to the function
      });
      enabledTabs.delete(tabId);
      await chrome.action.setIcon({
        tabId,
        // You might want to set a different icon here to indicate disabled state
      });
    } else {
      await chrome.scripting.executeScript({
        target: { tabId },
        func: applyStyles,
        args: [STYLE_ID], // Pass the style ID to the function
      });
      enabledTabs.add(tabId);
      await chrome.action.setIcon({
        tabId,
        // You might want to set a different icon here to indicate enabled state
      });
    }
  } catch (error) {
    console.error('Error toggling styles:', error);
  }
});

function applyStyles(styleId: string) {
  try {
    // Check if our style already exists to avoid duplicates
    const existingStyle = document.getElementById(styleId);
    if (existingStyle) return;

    const style = document.createElement('style');
    style.id = styleId; // Set the unique ID
    style.textContent = `
      .md-code-block.md-code-block-dark{
        direction: ltr;
      }
      .ds-scroll-area{
        direction: rtl;
      }
`;
    document.head.appendChild(style);
  } catch (error) {
    console.error('Error applying styles:', error);
  }
}

function removeStyles(styleId: string) {
  try {
    const style = document.getElementById(styleId);
    if (style) {
      style.remove();
    }
  } catch (error) {
    console.error('Error removing styles:', error);
  }
}

chrome.tabs.onRemoved.addListener((tabId) => {
  enabledTabs.delete(tabId);
});
