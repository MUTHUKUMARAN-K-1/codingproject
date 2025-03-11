// backend/utils/codeExecutor.js

const axios = require('axios');

// Map language strings to Judge0 language IDs.
const languageMap = {
  cpp: 52,
  'c++': 52,
  java: 62,
  python: 71,
  javascript: 63
};

/**
 * Executes code via Judge0's API (hosted on RapidAPI).
 *
 * @param {Object} params
 * @param {string} params.language - The language name (e.g., "cpp", "java", "python", "javascript").
 * @param {string} params.code - The user's source code to compile/run.
 * @param {string} params.input - The input string (stdin) for the code.
 *
 * @returns {Promise<Object>} - The raw response from Judge0, containing fields like:
 *    { stdout, stderr, compile_output, status, ... }
 */
exports.executeCode = async ({ language, code, input }) => {
  // Determine the Judge0 language ID or default to JavaScript (63)
  const languageId = languageMap[language.toLowerCase()] || 63;

  // Build the submission object
  const submission = {
    source_code: code,
    language_id: languageId,
    stdin: input
  };

  try {
    // Send request to Judge0 via RapidAPI
    const response = await axios.post(
      'https://judge0-ce.p.rapidapi.com/submissions?base64_encoded=false&wait=true',
      submission,
      {
        headers: {
          'content-type': 'application/json',
          'x-rapidapi-host': 'judge0-ce.p.rapidapi.com',
          // YOUR KEY HERE (as requested)
          'x-rapidapi-key': '59798e9311mshc17e89675a59c5cp15d49bjsnc4a55f06c1cc'
        }
      }
    );

    // Return the entire Judge0 response (contains stdout, stderr, etc.)
    return response.data;
  } catch (error) {
    // Throw an error if the API call fails
    throw new Error("Judge0 API call failed: " + error.message);
  }
};
