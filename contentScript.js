(() => {
  // Get the Problem number, the problem text
  // Grab existing problem hints, add event listener for new problems

  let currentProblem = "";
  let currentHints = [];
  let hints = "";

  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    // console.log(message);
    if (message.type === "NEW") {
      console.log("NEW");
      currentProblem = message.problemTitle;
      newProblemLoaded();
    } else if (message.type == "SHOW_HINT") {
      hints = message.hint;

      showHints();
    }
  });

  const newProblemLoaded = async () => {
    const storedHints = await fetchHintsFromStorage();

    // console.log(currentProblem, storedHints);

    if (!storedHints) {
      // No stored hints, request new ones
      chrome.runtime.sendMessage({
        type: "FETCH_HINTS",
        problemText: currentProblem,
      });
    } else {
      hints = storedHints;
      showHints();
    }
  };

  const fetchHintsFromStorage = () => {
    return new Promise((resolve) => {
      chrome.storage.local.get([currentProblem], (result) => {
        if (result[currentProblem]) {
          const parsed = JSON.parse(result[currentProblem]);
          resolve(parsed.hints || "");
        } else {
          resolve(null);
        }
      });
    });
  };

  const showHints = () => {
    console.log(hints);
    const parsedHints = hints
      .trim()
      .split(/\d+\)\s/)
      .filter(Boolean);

    chrome.runtime.sendMessage({
      type: "DISPLAY_HINTS",
      hints: parsedHints,
    });
  };
})();
