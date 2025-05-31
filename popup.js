document.addEventListener("DOMContentLoaded", async () => {
  let currentIndex = 0;
  const numOfHints = 10;
  let hints = "";

  const hintDiv = document.getElementById("hints");
  const prevBtn = document.getElementById("prevHint");
  const nextBtn = document.getElementById("nextHint");
  const hintTitle = document.getElementById("leetcode-hint-title");

  // Get current tab URL and derive problem ID
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  const url = tab.url;
  const pathSegments = new URL(url).pathname.split("/");
  const problemId = pathSegments[2]; // e.g., "two-sum"

  // Fetch saved hints from chrome.storage.local
  chrome.storage.local.get([problemId], (result) => {
    if (result[problemId]) {
      const hintObj = result[problemId];

      hints = hintObj
        .trim()
        .split(/\d+\)\s/)
        .filter(Boolean);

      showHint();
    }
  });

  const showHint = () => {
    hintTitle.textContent = `Leetcode Hint #${currentIndex + 1}`;

    // Check if a <p> already exists inside #hints
    let hintParagraph = hintDiv.querySelector("p");

    if (!hintParagraph) {
      // If it doesn't exist, create it
      hintParagraph = document.createElement("p");
      hintDiv.appendChild(hintParagraph);
    }

    // Update the text content
    hintParagraph.textContent = `${currentIndex + 1}) ${hints[currentIndex]}`;
    console.log(hints);

    // Enable/disable navigation buttons
    prevBtn.disabled = currentIndex === 0;
    nextBtn.disabled = currentIndex === hints.length - 1;
  };

  chrome.runtime.onMessage.addListener((request) => {
    if (request.type === "DISPLAY_HINTS") {
      console.log(request.hints);
      hints = request.hints;
      currentIndex = 0;
      showHint();
    }
  });

  prevBtn.addEventListener("click", () => {
    console.log("Click Previous");
    if (currentIndex > 0) {
      currentIndex--;
      showHint();
    }
  });

  nextBtn.addEventListener("click", () => {
    console.log("Click Next");
    if (currentIndex < numOfHints - 1) {
      currentIndex++;
      showHint();
    }
  });
});
