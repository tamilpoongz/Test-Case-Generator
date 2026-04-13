const express = require('express');
const cors = require('cors');
require('dotenv').config();
const axios = require('axios');
const multer = require('multer');
const { parse } = require('csv-parse/sync');
const XLSX = require('xlsx');

// Configure multer to store uploaded files in memory
const ALLOWED_MIMETYPES = [
  'text/csv',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
];
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB max
  fileFilter: (req, file, cb) => {
    const isAllowedMime = ALLOWED_MIMETYPES.includes(file.mimetype);
    const isAllowedExt = /\.(csv|xlsx|xls)$/i.test(file.originalname);
    if (isAllowedMime || isAllowedExt) {
      cb(null, true);
    } else {
      cb(new Error('Only CSV and Excel (.xlsx, .xls) files are supported'));
    }
  }
});

const app = express();
const port = process.env.PORT || 8000;

// Middleware
app.use(express.json());
app.use(cors({
  origin: process.env.CORS_ORIGINS?.split(',') || ['http://localhost:5173', 'http://localhost:3000']
}));

// Groq API Service
class GroqService {
  constructor(apiKey, model) {
    this.apiKey = apiKey;
    this.model = model;
    this.baseURL = 'https://api.groq.com/openai/v1';
  }

  async generateTestCases(userStory) {
    try {
      const response = await axios.post(
        `${this.baseURL}/chat/completions`,
        {
          model: this.model,
          messages: [
            {
              role: 'system',
              content: `You are a senior QA engineer with deep expertise in writing detailed, executable test cases for web applications.

Your goal is to generate thorough, step-by-step test cases from a user story. Follow these rules strictly:

STEP WRITING RULES:
- Every test step must be a complete, actionable instruction that a tester can execute without guessing.
- Begin each step with a strong action verb: Navigate, Click, Enter, Select, Verify, Wait, Scroll, Hover, Submit, etc.
- For the FIRST step, always describe full navigation from the starting point (e.g., "Navigate to the application URL [e.g., https://app.example.com] and ensure the Home/Login page is displayed").
- For subsequent navigation steps, describe the exact UI path (e.g., "Click the 'Cart' icon in the top-right header to open the Cart page").
- When entering data, specify the exact field name and value (e.g., "Enter 'John Doe' in the 'Full Name' input field under the Delivery Details section").
- When clicking buttons or links, specify the exact label and location (e.g., "Click the 'Proceed to Checkout' button at the bottom of the Cart page").
- When verifying, describe exactly what should be visible or true (e.g., "Verify that the Order Confirmation page is displayed with a unique Order ID and a success message 'Your order has been placed!'").
- Include any wait or loading states where relevant (e.g., "Wait for the page to load and verify the checkout form is displayed").
- For negative test cases, include the specific invalid input and what error message/behavior is expected.
- Aim for 5–10 detailed steps per test case.

TEST CASE COVERAGE RULES:
- Always generate a MINIMUM of 5 test cases and ideally 6–8 per user story.
- Cover ALL of the following categories — do not skip any:
  1. Happy path / positive flow (end-to-end success scenario)
  2. Negative flow — invalid or missing required fields
  3. Negative flow — unauthorized or restricted access attempt
  4. Boundary validation — empty cart, max items, field length limits, etc.
  5. Functional verification — each acceptance criterion maps to at least one test case
  6. Edge cases — e.g., network interruption, back-button navigation, session expiry

OUTPUT FORMAT:
Return ONLY a valid JSON object — no markdown, no code fences, no explanation. Structure:
{
  "testCases": [
    {
      "testCaseId": "TC-001",
      "testCaseTitle": "Descriptive title of what is being tested",
      "testType": "Functional|Positive|Negative|Boundary Validation",
      "preconditions": [
        "Precondition 1 (e.g., Application is accessible at the test URL)",
        "Precondition 2 (e.g., User has at least one item added to the cart)"
      ],
      "testSteps": [
        "Step 1: Navigate to ...",
        "Step 2: Click ...",
        "Step 3: Enter ... in the '...' field",
        "Step 4: Verify ..."
      ],
      "testData": ["field: value", "field: value"],
      "expectedResult": "Clear, specific statement of what should happen when all steps pass",
      "priority": "Critical|High|Medium|Low"
    }
  ]
}`
            },
            {
              role: 'user',
              content: `Generate detailed, step-by-step test cases for the following user story:

${userStory}

REQUIREMENTS:
- Generate a MINIMUM of 6 test cases (aim for 6–8).
- Cover positive, negative, boundary, and functional scenarios.
- Every test step must be specific and actionable with exact field names, button labels, navigation paths, and verification checkpoints.`
            }
          ],
          temperature: 0.4,
          max_tokens: 4096
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return response.data.choices[0].message.content;
    } catch (error) {
      throw new Error(`Groq API error: ${error.message}`);
    }
  }

  async scoreConfidence(testCase) {
    try {
      const response = await axios.post(
        `${this.baseURL}/chat/completions`,
        {
          model: this.model,
          messages: [
            {
              role: 'system',
              content: 'You are a test case quality evaluator. Return ONLY a number between 0 and 1 representing confidence score.'
            },
            {
              role: 'user',
              content: `Score this test case (0-1): ${testCase}`
            }
          ],
          temperature: 0.3,
          max_tokens: 10
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      const content = response.data.choices[0].message.content.trim();
      return parseFloat(content) || 0.8;
    } catch (error) {
      console.error('Error scoring confidence:', error.message);
      return 0.8;
    }
  }
}

// Test Case Service
class TestCaseService {
  constructor(groqService) {
    this.groqService = groqService;
  }

  async generateTestCases(userStory) {
    try {
      const storyText = `
        Title: ${userStory.title}
        Description: ${userStory.description}
        Acceptance Criteria: ${userStory.acceptanceCriteria.join(', ')}
      `;

      const response = await this.groqService.generateTestCases(storyText);
      
      let testCases = [];
      try {
        // Strip markdown code fences if LLM wraps response in ```json ... ```
        const cleaned = response
          .replace(/^```(?:json)?\s*/i, '')
          .replace(/\s*```\s*$/g, '')
          .trim();
        const parsed = JSON.parse(cleaned);
        testCases = parsed.testCases || [];
      } catch (parseError) {
        console.error('Failed to parse response:', parseError.message);
        testCases = this.generateSampleTestCases(userStory);
      }

      // Normalize to snake_case fields expected by the frontend
      testCases = testCases.map(tc => ({
        test_case_id: tc.testCaseId || tc.test_case_id || '',
        test_case_title: tc.testCaseTitle || tc.test_case_title || '',
        test_type: tc.testType || tc.test_type || '',
        preconditions: tc.preconditions || [],
        test_steps: tc.testSteps || tc.test_steps || [],
        test_data: tc.testData || tc.test_data || [],
        expected_result: tc.expectedResult || tc.expected_result || '',
        priority: tc.priority || 'Medium',
        confidence_score: tc.confidenceScore || tc.confidence_score || 0,
        review_status: tc.reviewStatus || tc.review_status || 'Draft',
      }));

      for (const testCase of testCases) {
        testCase.confidence_score = await this.groqService.scoreConfidence(
          JSON.stringify(testCase)
        );
      }

      const summary = this.generateSummary(testCases);

      return {
        status: 'success',
        draft_test_cases: testCases,
        summary
      };
    } catch (error) {
      return {
        status: 'error',
        draft_test_cases: [],
        summary: { total_test_cases: 0, by_type: {}, average_confidence: 0 },
        error: `Test case generation failed: ${error.message}`
      };
    }
  }

  generateSummary(testCases) {
    const byType = {};
    let totalConfidence = 0;

    testCases.forEach(tc => {
      const type = tc.test_type || tc.testType || 'Unknown';
      byType[type] = (byType[type] || 0) + 1;
      totalConfidence += tc.confidence_score || tc.confidenceScore || 0;
    });

    return {
      total_test_cases: testCases.length,
      by_type: byType,
      average_confidence: testCases.length > 0 ? totalConfidence / testCases.length : 0
    };
  }

  generateSampleTestCases(userStory) {
    return [
      {
        test_case_id: 'TC-001',
        test_case_title: `Verify ${userStory.title} - Positive Flow`,
        test_type: 'Positive',
        preconditions: ['System is initialized', 'User is authenticated'],
        test_steps: [
          'Navigate to the feature',
          'Perform the action',
          'Verify the result'
        ],
        test_data: ['Sample data 1'],
        expected_result: 'Feature works as expected',
        priority: 'High',
        confidence_score: 0.85,
        review_status: 'Draft'
      },
      {
        test_case_id: 'TC-002',
        test_case_title: `Verify ${userStory.title} - Negative Flow`,
        test_type: 'Negative',
        preconditions: ['System is initialized'],
        test_steps: [
          'Attempt invalid input',
          'System should reject',
          'Error message displayed'
        ],
        test_data: ['Invalid data'],
        expected_result: 'Error handling works correctly',
        priority: 'Medium',
        confidence_score: 0.75,
        review_status: 'Draft'
      }
    ];
  }
}

// Initialize services
const groqService = new GroqService(
  process.env.GROQ_API_KEY || '',
  process.env.GROQ_MODEL || 'llama-3.3-70b-versatile'
);
const testCaseService = new TestCaseService(groqService);

// Routes
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'Test Case Generation Agent',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

app.get('/api/testcases/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'Test Case Generation Agent',
    version: '1.0.0'
  });
});

app.post('/api/testcases/generate', async (req, res) => {
  try {
    const { title, description, acceptanceCriteria } = req.body;

    if (!title || !description || !acceptanceCriteria) {
      return res.status(400).json({
        status: 'error',
        message: 'Missing required fields: title, description, acceptanceCriteria'
      });
    }

    const userStory = {
      title,
      description,
      acceptanceCriteria: Array.isArray(acceptanceCriteria)
        ? acceptanceCriteria
        : [acceptanceCriteria]
    };

    const result = await testCaseService.generateTestCases(userStory);
    res.json(result);
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: `Generation failed: ${error.message}`
    });
  }
});

app.post('/api/testcases/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ status: 'error', message: 'No file uploaded. Please upload a CSV or Excel file.' });
    }

    const isExcel = /\.(xlsx|xls)$/i.test(req.file.originalname) ||
      req.file.mimetype === 'application/vnd.ms-excel' ||
      req.file.mimetype === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';

    let rows;
    try {
      if (isExcel) {
        const workbook = XLSX.read(req.file.buffer, { type: 'buffer' });
        const sheetName = workbook.SheetNames[0];
        if (!sheetName) {
          return res.status(400).json({ status: 'error', message: 'Excel file has no sheets.' });
        }
        rows = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], { defval: '' });
      } else {
        const csvText = req.file.buffer.toString('utf-8');
        rows = parse(csvText, {
          columns: true,
          skip_empty_lines: true,
          trim: true,
        });
      }
    } catch (parseErr) {
      return res.status(400).json({ status: 'error', message: `File parsing failed: ${parseErr.message}` });
    }

    if (!rows || rows.length === 0) {
      return res.status(400).json({ status: 'error', message: 'File is empty or has no valid rows.' });
    }

    // Detect column names (case-insensitive)
    const normalizeKey = (key) => key.toLowerCase().replace(/[^a-z]/g, '');
    const sampleRow = rows[0];
    const keyMap = {};
    for (const key of Object.keys(sampleRow)) {
      keyMap[normalizeKey(key)] = key;
    }

    const titleCol = keyMap['title'] || keyMap['storytitle'] || keyMap['userstorytitle'];
    const descCol = keyMap['description'] || keyMap['desc'] || keyMap['storydescription'];
    const acCol = keyMap['acceptancecriteria'] || keyMap['ac'] || keyMap['criteria'] || keyMap['acceptancecriteria'];

    if (!titleCol || !descCol || !acCol) {
      return res.status(400).json({
        status: 'error',
        message: `File must have columns: Title, Description, Acceptance Criteria. Found: ${Object.keys(sampleRow).join(', ')}`
      });
    }

    const allTestCases = [];
    const errors = [];

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const title = (row[titleCol] || '').trim();
      const description = (row[descCol] || '').trim();
      const acRaw = (row[acCol] || '').trim();

      if (!title || !description || !acRaw) {
        errors.push(`Row ${i + 2}: Skipped — missing Title, Description, or Acceptance Criteria.`);
        continue;
      }

      const acceptanceCriteria = acRaw
        .split(/[|\n]/)  // support pipe-separated or newline-separated ACs
        .map(s => s.trim())
        .filter(s => s.length > 0);

      const userStory = { title, description, acceptanceCriteria };

      try {
        const result = await testCaseService.generateTestCases(userStory);
        if (result.status === 'success' && result.draft_test_cases.length > 0) {
          // Tag each test case with the source story
          result.draft_test_cases.forEach(tc => {
            tc.source_story = title;
          });
          allTestCases.push(...result.draft_test_cases);
        }
      } catch (genErr) {
        errors.push(`Row ${i + 2} ("${title}"): Generation failed — ${genErr.message}`);
      }
    }

    const summary = {
      total_test_cases: allTestCases.length,
      total_stories_processed: rows.length - errors.length,
      by_type: {},
    };
    allTestCases.forEach(tc => {
      const t = tc.test_type || 'Unknown';
      summary.by_type[t] = (summary.by_type[t] || 0) + 1;
    });

    res.json({
      status: 'success',
      draft_test_cases: allTestCases,
      summary,
      warnings: errors.length > 0 ? errors : undefined,
    });
  } catch (error) {
    console.error('Upload error:', error.message);
    res.status(500).json({ status: 'error', message: `Upload failed: ${error.message}` });
  }
});

app.post('/api/testcases/download', (req, res) => {
  try {
    const { format } = req.body;
    const testCases = req.body.test_cases || req.body.testCases;

    if (!testCases || testCases.length === 0) {
      return res.status(400).json({ error: 'No test cases to download' });
    }

    if (format === 'csv') {
      const csv = convertToCSV(testCases);
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename="test-cases.csv"');
      res.send(csv);
    } else if (format === 'json') {
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', 'attachment; filename="test-cases.json"');
      res.send(JSON.stringify(testCases, null, 2));
    } else {
      res.status(400).json({ error: 'Invalid format' });
    }
  } catch (error) {
    res.status(500).json({ error: `Download failed: ${error.message}` });
  }
});

function convertToCSV(testCases) {
  const headers = [
    'Test Case ID',
    'Title',
    'Type',
    'Preconditions',
    'Test Steps',
    'Test Data',
    'Expected Result',
    'Priority',
    'Confidence'
  ];

  const rows = testCases.map(tc => [
    tc.test_case_id || tc.testCaseId || '',
    tc.test_case_title || tc.testCaseTitle || '',
    tc.test_type || tc.testType || '',
    (tc.preconditions || []).join('; '),
    (tc.test_steps || tc.testSteps || []).join('; '),
    Array.isArray(tc.test_data || tc.testData) ? (tc.test_data || tc.testData).join('; ') : '',
    tc.expected_result || tc.expectedResult || '',
    tc.priority || '',
    ((tc.confidence_score || tc.confidenceScore) || 0).toFixed(2)
  ]);

  const csv = [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
  ].join('\n');

  return csv;
}

// Error handling
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({
    status: 'error',
    message: err.message || 'Internal server error'
  });
});

// Start server
app.listen(port, '0.0.0.0', () => {
  console.log(`✓ Test Case Generation Agent v1.0.0`);
  console.log(`✓ Server running on port ${port}`);
  console.log(`✓ LLM Provider: Groq`);
  console.log(`✓ LLM Model: ${process.env.GROQ_MODEL}`);
  console.log(`✓ Health check: http://localhost:${port}/health`);
  console.log(`✓ API Base: http://localhost:${port}/api/testcases`);
});
