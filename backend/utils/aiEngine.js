// backend/utils/aiEngine.js
exports.getAIHelp = async (problemId) => {
    // Return a dummy suggestion based on the problem ID
    if (problemId === 1) {
      return "Hint from AI: Use a simple addition operator for sum.";
    } else {
      return "No specific AI help available for this problem yet.";
    }
  };
  