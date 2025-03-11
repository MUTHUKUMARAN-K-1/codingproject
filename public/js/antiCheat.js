// public/js/antiCheat.js

// Global usageData object to track anti-cheat status
window.usageData = { honest: true };

// Detect tab switching (loss of focus)
let tabSwitched = false;

window.addEventListener('blur', () => {
  console.log("Tab lost focus");
  tabSwitched = true;
});

window.addEventListener('focus', () => {
  console.log("Tab regained focus");
  if (tabSwitched) {
    // Prompt the user to confirm the tab switch is legitimate.
    // Replace "yourSecretPassword" with your actual verification logic.
    const password = prompt("Tab switch detected. To continue earning honest points, please enter your password:");
    if (!password || password !== "yourSecretPassword") {
      window.usageData.honest = false;
      console.warn("Unauthorized tab switch detected; honest points will be reduced.");
    }
    tabSwitched = false;
  }
});

// Detect copy, cut, and paste events
document.addEventListener('copy', () => {
  window.usageData.honest = false;
  console.warn("Copy event detected; marking submission as not honest.");
});
document.addEventListener('cut', () => {
  window.usageData.honest = false;
  console.warn("Cut event detected; marking submission as not honest.");
});
document.addEventListener('paste', () => {
  window.usageData.honest = false;
  console.warn("Paste event detected; marking submission as not honest.");
});
