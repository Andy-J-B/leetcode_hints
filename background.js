chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  // Only proceed if the page has finished loading and has a valid URL
  if (
    changeInfo.status === "complete" &&
    tab.url &&
    tab.url.includes("leetcode.com/problems")
  ) {
    console.log("LeetCode problem detected:", tab.url);

    // Extract problem name from the URL path, e.g., https://leetcode.com/problems/two-sum/
    const pathSegments = new URL(tab.url).pathname.split("/");
    const problemId = pathSegments[2]; // "two-sum"

    chrome.tabs.sendMessage(tabId, {
      type: "NEW",
      problemId: problemId,
    });
  }
});
