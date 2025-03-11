// backend/server.js
const express = require('express');
const path = require('path');
const cors = require('cors');
const bodyParser = require('body-parser');
const sequelize = require('./database');
const DataTypes = require('sequelize').DataTypes;
const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'secret_key';

// Import models
const Submission = require('./models/submission')(sequelize, DataTypes);
const ForumPost  = require('./models/forumPost')(sequelize, DataTypes);
const Channel    = require('./models/channel')(sequelize, DataTypes);
const Message    = require('./models/message')(sequelize, DataTypes);
const Problem    = require('./models/problem')(sequelize, DataTypes);
const Skill      = require('./models/skill')(sequelize, DataTypes);

// Import utilities
const codeExecutor = require('./utils/codeExecutor');  // Real code execution via Judge0 (or similar)
const aiEngine     = require('./utils/aiEngine');      // Advanced AI help integration

// Import additional routes if needed
const authRoutes      = require('./routes/auth');
const communityRoutes = require('./routes/community');
const challengeRoutes = require('./routes/challenge');
const profileRoutes   = require('./routes/profile');
const skillsRoutes    = require('./routes/skills');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, '../public')));

// Mount API routes
app.use('/api/auth', authRoutes);
app.use('/api/community', communityRoutes);
app.use('/api/challenge', challengeRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/skills', skillsRoutes);

// ------------------------
// PROBLEMS ENDPOINTS
// ------------------------

// GET /api/problems - List all problems (without solution field)
app.get('/api/problems', async (req, res) => {
  try {
    const problems = await Problem.findAll();
    const sanitized = problems.map(p => {
      const obj = p.toJSON();
      delete obj.solution;
      return obj;
    });
    res.json(sanitized);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/problems/:id - Get a single problem’s details (without solution)
app.get('/api/problems/:id', async (req, res) => {
  try {
    const problem = await Problem.findByPk(req.params.id);
    if (!problem) return res.status(404).json({ error: 'Problem not found' });
    const obj = problem.toJSON();
    delete obj.solution;
    res.json(obj);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/problems/:id/solution - Return ONLY the solution
app.get('/api/problems/:id/solution', async (req, res) => {
  try {
    const problem = await Problem.findByPk(req.params.id);
    if (!problem) return res.status(404).json({ error: 'Problem not found' });
    res.json({ solution: problem.solution || "No solution available." });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/problems/:id/aihelp - Advanced AI suggestion (dummy integration)
app.get('/api/problems/:id/aihelp', async (req, res) => {
  try {
    const problem = await Problem.findByPk(req.params.id);
    if (!problem) return res.status(404).json({ error: 'Problem not found' });
    // Here you can pass partial user code if available; for now, we pass an empty string.
    const suggestion = await aiEngine.getAdvancedAISuggestion(problem, "");
    res.json({ suggestion });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/problems/:id/submit - Submit code; execute via Judge0 and track anti-cheat usage
app.post('/api/problems/:id/submit', async (req, res) => {
  const { code, language, usageData } = req.body;
  try {
    const problem = await Problem.findByPk(req.params.id);
    if (!problem) return res.status(404).json({ error: 'Problem not found' });
    
    // Parse test cases (assumed stored as a JSON string)
    let testCases = [];
    try {
      testCases = JSON.parse(problem.testCases);
    } catch (error) {
      return res.status(500).json({ error: 'Invalid test cases in DB' });
    }
    
    // For demonstration, run only the first test case.
    const testCase = testCases[0];
    const input = testCase.input;
    const expected = testCase.expectedOutput;
    
    // Execute code via Judge0 using our codeExecutor
    const judge0Response = await codeExecutor.executeCode({ language, code, input });
    const stdout = judge0Response.stdout ? judge0Response.stdout.trim() : "";
    const result = (stdout === expected) ? "Accepted" : "Wrong Answer";
    
    // Award honest points if usageData.honest is true
    const honestPoints = usageData && usageData.honest ? 10 : 0;
    
    // Optionally, you could save the submission record here.
    res.json({ output: stdout, expected, result, honestPoints });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ------------------------
// SOCKET.IO SETUP (Optional for real-time updates)
// ------------------------
const http = require('http');
const server = http.createServer(app);
const { Server } = require('socket.io');
const io = new Server(server);

io.on('connection', (socket) => {
  console.log('New client connected');
  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});

// ------------------------
// DATABASE SYNC & SEEDING
// ------------------------
function getProblemsData() {
  // Create 10 detailed problems with robust details, then 20 placeholders.
  const data = [
    {
      id: 1,
      title: "1. Two Sum",
      description: "Given an array of integers and a target, return indices of the two numbers such that they add up to the target.",
      constraints: "2 <= nums.length <= 10^4, -10^9 <= nums[i] <= 10^9, -10^9 <= target <= 10^9",
      examples: "Input: nums = [2,7,11,15], target = 9; Output: [0,1]",
      functionSignature: "vector<int> twoSum(vector<int>& nums, int target)",
      hints: "Use a hash map to track indices.",
      difficulty: "easy",
      solution: "// C++ solution\nvector<int> twoSum(vector<int>& nums, int target) {\n    unordered_map<int, int> map;\n    for (int i = 0; i < nums.size(); i++) {\n        int complement = target - nums[i];\n        if (map.count(complement)) return {map[complement], i};\n        map[nums[i]] = i;\n    }\n    return {};\n}",
      testCases: JSON.stringify([{ input: "[2,7,11,15], target=9", expectedOutput: "[0,1]" }])
    },
    {
      id: 2,
      title: "2. Add Two Numbers",
      description: "Given two non-empty linked lists representing two non-negative integers in reverse order, add the two numbers and return the sum as a linked list.",
      constraints: "1 <= l1.length, l2.length <= 100; digits are stored in reverse order",
      examples: "Input: l1 = [2,4,3], l2 = [5,6,4]; Output: [7,0,8]",
      functionSignature: "ListNode* addTwoNumbers(ListNode* l1, ListNode* l2)",
      hints: "Use a carry variable to handle digit sums.",
      difficulty: "medium",
      solution: "// C++ solution\nListNode* addTwoNumbers(ListNode* l1, ListNode* l2) {\n    ListNode dummy(0);\n    ListNode* curr = &dummy;\n    int carry = 0;\n    while (l1 || l2 || carry) {\n        int sum = (l1 ? l1->val : 0) + (l2 ? l2->val : 0) + carry;\n        carry = sum / 10;\n        curr->next = new ListNode(sum % 10);\n        curr = curr->next;\n        if (l1) l1 = l1->next;\n        if (l2) l2 = l2->next;\n    }\n    return dummy.next;\n}",
      testCases: JSON.stringify([{ input: "l1=[2,4,3], l2=[5,6,4]", expectedOutput: "[7,0,8]" }])
    },
    {
      id: 3,
      title: "3. Longest Substring Without Repeating Characters",
      description: "Given a string s, find the length of the longest substring without repeating characters.",
      constraints: "0 <= s.length <= 50,000",
      examples: "Input: s = 'abcabcbb'; Output: 3",
      functionSignature: "int lengthOfLongestSubstring(string s)",
      hints: "Use a sliding window with a hash map to track indices.",
      difficulty: "medium",
      solution: "// C++ solution\nint lengthOfLongestSubstring(string s) {\n    unordered_map<char, int> map;\n    int maxLen = 0, start = 0;\n    for (int i = 0; i < s.length(); i++) {\n        if (map.count(s[i]) && map[s[i]] >= start) {\n            start = map[s[i]] + 1;\n        }\n        map[s[i]] = i;\n        maxLen = max(maxLen, i - start + 1);\n    }\n    return maxLen;\n}",
      testCases: JSON.stringify([{ input: "abcabcbb", expectedOutput: "3" }])
    },
    {
      id: 4,
      title: "4. Median of Two Sorted Arrays",
      description: "Given two sorted arrays, find the median of the two arrays in O(log(m+n)) time.",
      constraints: "0 <= m, n <= 10,000; arrays are sorted; arrays may be empty.",
      examples: "Input: nums1 = [1,3], nums2 = [2]; Output: 2.0",
      functionSignature: "double findMedianSortedArrays(vector<int>& nums1, vector<int>& nums2)",
      hints: "Use binary search on the smaller array to partition the arrays.",
      difficulty: "hard",
      solution: "// C++ solution\n// double findMedianSortedArrays(vector<int>& nums1, vector<int>& nums2) { /* ... */ }",
      testCases: JSON.stringify([{ input: "nums1=[1,3], nums2=[2]", expectedOutput: "2.0" }])
    },
    {
      id: 5,
      title: "5. Longest Palindromic Substring",
      description: "Given a string s, return the longest palindromic substring.",
      constraints: "1 <= s.length <= 1000",
      examples: "Input: s = 'babad'; Output: 'bab' (or 'aba')",
      functionSignature: "string longestPalindrome(string s)",
      hints: "Expand around each center.",
      difficulty: "medium",
      solution: "// C++ solution\n// string longestPalindrome(string s) { /* ... */ }",
      testCases: JSON.stringify([{ input: "babad", expectedOutput: "bab" }])
    },
    {
      id: 6,
      title: "6. Reverse Integer",
      description: "Given a 32-bit signed integer x, reverse its digits. Return 0 if the reversed integer overflows.",
      constraints: "-2^31 <= x <= 2^31 - 1",
      examples: "Input: x = 123; Output: 321",
      functionSignature: "int reverse(int x)",
      hints: "Watch out for overflow.",
      difficulty: "medium",
      solution: "// C++ solution\n// int reverse(int x) { /* ... */ }",
      testCases: JSON.stringify([{ input: "123", expectedOutput: "321" }])
    },
    {
      id: 7,
      title: "7. Palindrome Number",
      description: "Determine whether an integer is a palindrome. Negative numbers are not palindromes.",
      constraints: "-2^31 <= x <= 2^31 - 1",
      examples: "Input: x = 121; Output: true",
      functionSignature: "bool isPalindrome(int x)",
      hints: "Convert to string or reverse half the number.",
      difficulty: "easy",
      solution: "// C++ solution\n// bool isPalindrome(int x) { /* ... */ }",
      testCases: JSON.stringify([{ input: "121", expectedOutput: "true" }])
    },
    {
      id: 8,
      title: "8. Container With Most Water",
      description: "Given an array of non-negative integers representing an elevation map, find two lines that together with the x-axis form a container that holds the most water.",
      constraints: "2 <= height.length <= 10^5, 0 <= height[i] <= 10^4",
      examples: "Input: [1,8,6,2,5,4,8,3,7]; Output: 49",
      functionSignature: "int maxArea(vector<int>& height)",
      hints: "Use a two-pointer approach.",
      difficulty: "medium",
      solution: "// C++ solution\n// int maxArea(vector<int>& height) { /* ... */ }",
      testCases: JSON.stringify([{ input: "[1,8,6,2,5,4,8,3,7]", expectedOutput: "49" }])
    },
    {
      id: 9,
      title: "9. 3Sum",
      description: "Given an integer array, return all unique triplets that sum to zero.",
      constraints: "0 <= nums.length <= 3000, -10^5 <= nums[i] <= 10^5",
      examples: "Input: [-1,0,1,2,-1,-4]; Output: [[-1,-1,2],[-1,0,1]]",
      functionSignature: "vector<vector<int>> threeSum(vector<int>& nums)",
      hints: "Sort and use two pointers for each element.",
      difficulty: "medium",
      solution: "// C++ solution\n// vector<vector<int>> threeSum(vector<int>& nums) { /* ... */ }",
      testCases: JSON.stringify([{ input: "[-1,0,1,2,-1,-4]", expectedOutput: "[[-1,-1,2],[-1,0,1]]" }])
    },
    {
      id: 10,
      title: "10. Longest Common Prefix",
      description: "Write a function to find the longest common prefix string among an array of strings.",
      constraints: "1 <= strs.length <= 200, 1 <= strs[i].length <= 200",
      examples: "Input: [\"flower\",\"flow\",\"flight\"]; Output: \"fl\"",
      functionSignature: "string longestCommonPrefix(vector<string>& strs)",
      hints: "Compare characters, or sort and compare first and last strings.",
      difficulty: "easy",
      solution: "// C++ solution\n// string longestCommonPrefix(vector<string>& strs) { /* ... */ }",
      testCases: JSON.stringify([{ input: "[\"flower\",\"flow\",\"flight\"]", expectedOutput: "\"fl\"" }])
    }
  ];

  // Fill remaining problems (11 to 30) with placeholders.
  for (let i = 11; i <= 30; i++) {
    data.push({
      id: i,
      title: `${i}. Placeholder Problem`,
      description: `Detailed description for Problem ${i}. Solve this problem using appropriate algorithms.`,
      constraints: "No specific constraints",
      examples: `Example: Input => Output`,
      functionSignature: `// Function signature not provided for Problem ${i}`,
      hints: "Think about edge cases.",
      difficulty: (i <= 20) ? 'medium' : 'hard',
      solution: "// No official solution provided for this placeholder.",
      testCases: JSON.stringify([{ input: "sample input", expectedOutput: "sample output" }])
    });
  }
  return data;
}

sequelize.sync({ force: true }).then(async () => {
  console.log('Database synced');
  const count = await Problem.count();
  if (count === 0) {
    console.log('Seeding 30 robust problems...');
    const problemsData = getProblemsData();
    for (const data of problemsData) {
      await Problem.create(data);
    }
  }
  server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}).catch(err => {
  console.error('Error syncing database:', err);
});
