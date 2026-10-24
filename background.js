// คำสั่งให้เมื่อคลิกไอคอน Extension แล้วเปิด Side Panel เสมอ
chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true })
  .catch((error) => console.error("Error setting panel behavior:", error));