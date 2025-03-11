// public/js/script.js
document.addEventListener("DOMContentLoaded", function () {
  // Dark/Light Mode Toggle
  const toggleBtn = document.getElementById('theme-toggle');
  if (toggleBtn) {
    toggleBtn.addEventListener('click', function () {
      document.body.classList.toggle('dark-mode');
    });
  }
});

// Example: AI Course Recommender on index.html
async function getAICourseSuggestion() {
  const input = document.getElementById('aiCourseInput').value.trim();
  const output = document.getElementById('aiCourseOutput');
  if (!input) {
    output.textContent = "Please enter your interests!";
    return;
  }
  // Dummy AI logic
  output.textContent = `AI suggests focusing on courses related to "${input}". You can explore these in our platform!`;
}
