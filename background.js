// const GEMINI_API_KEY = "AIzaSyCNLQNcJLbstoJeqx0huP0ZKzlanvFaZgM";
chrome.tabs.onActivated.addListener(async (activeInfo) => {
  try {
    const tab = await chrome.tabs.get(activeInfo.tabId);
    if (tab.url && tab.url.includes("leetcode.com/problems")) {
      console.log("NEW TAB", tab.url);
      const pathSegments = new URL(tab.url).pathname.split("/");
      const problemTitle = pathSegments[2]; // "two-sum"
      chrome.tabs.sendMessage(tab.id, {
        type: "NEW",
        problemTitle: problemTitle,
      });
    }
  } catch (error) {
    console.error("Error getting active tab on activation", error);
  }
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  // Only proceed if the page has finished loading and has a valid URL
  if (
    changeInfo.status === "complete" &&
    tab.url &&
    tab.url.includes("leetcode.com/problems")
  ) {
    // console.log("LeetCode problem detected:", tab.url);

    // Extract problem name from the URL path, e.g., https://leetcode.com/problems/two-sum/
    const pathSegments = new URL(tab.url).pathname.split("/");
    const problemTitle = pathSegments[2]; // "two-sum"

    // console.log(problemTitle);

    chrome.tabs.sendMessage(tabId, {
      type: "NEW",
      problemTitle: problemTitle,
    });
  }
});

chrome.runtime.onMessage.addListener(async (message, sender, sendResponse) => {
  if (message.type === "FETCH_HINTS") {
    problemText = message.problemText;
    console.log(problemText);
    chrome.storage.local.get([problemText], async (result) => {
      console.log(result);
      if (result[problemText]) {
        console.log("Serving cached hint for:", problemText);
        chrome.tabs.sendMessage(sender.tab.id, {
          type: "SHOW_HINT",
          hint: result[problemText],
        });
        return;
      }
    });
    const prompt = `For leetcode problem ${problemText}, give me 10 sequentially stronger hints that would help me solve this problem starting with moderately subtle hints and gradually becoming more direct and detailed.No other words don't say anything else, in the form 1)<text>2)<text>`;

    try {
      // console.log("CALL API");
      // console.log(message.currentProblem, GEMINI_API_KEY);
      // const response = await fetch(
      //   `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
      //   {
      //     method: "POST",
      //     headers: {
      //       "Content-Type": "application/json",
      //     },
      //     body: JSON.stringify({
      //       contents: [{ parts: [{ text: prompt }] }],
      //     }),
      //   }
      // );

      // const data = await response.json();
      // const hint =
      //   data?.candidates?.[0]?.content?.parts?.[0]?.text || "No hint received.";
      console.log(hint);
      hint = `1) Consider how you might represent the tree's structure to make it easier to traverse and compare.
      2) Think about using recursion to explore both trees simultaneously.
      3) Focus on the base cases for your recursive function: when a node is null.
      4) The trees are identical if the root values are the same and their corresponding subtrees are identical.
      5) What should the recursive function return if both nodes are null? What if only one is?
      6) The function should check if the current node values are equal before recursively calling itself on the subtrees.
      7) The recursive function should take two tree nodes as input and return "true" if the subtrees rooted at those nodes are identical, and "false" otherwise.
      8) The outline of your recursive function should be: check for null cases, compare node values, and then recursively compare the left and right subtrees.
      9) Specifically, if both nodes are null return true, if one is null and the other isn't, return false. If the values are different return false, otherwise call recursively on left subtrees and right subtrees. Return the "and" of these recursive calls.
      10) Implement a function like "areTreesEqual(TreeNode p, TreeNode q)" that returns "true" if the trees rooted at "p" and "q" are identical. Start with null checks (both null, one null), then compare node values. If they are equal, recursively call "areTreesEqual" on "p.left" and "q.left", and on "p.right" and "q.right". Return the "and" of those recursive calls.`;

      chrome.storage.local.set({ [problemText]: hint });
      console.log(hint);
      chrome.tabs.sendMessage(sender.tab.id, {
        type: "SHOW_HINT",
        hint: hint,
      });
    } catch (error) {
      console.error("Error fetching hint:", error);
      console.log(message);
      chrome.tabs.sendMessage(sender.tab.id, {
        type: "SHOW_HINT",
        hint: "An error occurred while fetching the hint.",
      });
    }
  }
});
