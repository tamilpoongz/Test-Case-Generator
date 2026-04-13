# Test Case Generation Agent - Frontend

A modern React-based web application for generating test cases from user stories using AI.

## 📋 Features

- ✅ User story input form with validation
- ✅ Automatic test case generation via AI (Groq LLM)
- ✅ Test case review and approval workflow
- ✅ CSV & JSON export capabilities
- ✅ Real-time feedback and error handling
- ✅ Responsive Material-UI design
- ✅ Backend API integration

## 🛠️ Technology Stack

- **React 18.2.0** - UI framework
- **Vite** - Build tool
- **Material-UI 5.14** - Component library
- **React Hook Form** - Form handling
- **Zod** - Schema validation
- **Axios** - HTTP client
- **Emotion** - CSS-in-JS styling

## 📦 Installation

### Prerequisites

- Node.js 16+ and npm
- Backend running on `http://localhost:8000`

### Setup

1. **Navigate to frontend directory:**
   ```bash
   cd frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Create .env file** (already created, but verify):
   ```env
   VITE_API_URL=http://localhost:8000
   VITE_ENV=development
   ```

## 🚀 Development

### Start Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:5173`

### Build for Production

```bash
npm run build
```

Output will be in the `dist/` directory.

### Preview Production Build

```bash
npm run preview
```

## 📁 Project Structure

```
frontend/
├── src/
│   ├── components/           # React components
│   │   ├── AppHeader.jsx
│   │   ├── StoryInputForm.jsx
│   │   ├── GenerationStatus.jsx
│   │   ├── TestCaseSummary.jsx
│   │   ├── TestCaseTable.jsx
│   │   └── ReviewActionBar.jsx
│   ├── pages/                # Page components
│   │   └── TestCaseGeneratorPage.jsx
│   ├── services/             # API services
│   │   └── testcaseService.js
│   ├── schemas/              # Validation schemas
│   │   └── storyFormSchema.js
│   ├── utils/                # Utility functions
│   │   └── helpers.js
│   ├── App.jsx               # Main app component
│   └── main.jsx              # Entry point
├── public/                   # Static assets
├── index.html                # HTML template
├── vite.config.js            # Vite configuration
├── package.json              # Dependencies
├── .env                      # Development environment
├── .env.production           # Production environment
└── README.md                 # This file
```

## 🔌 API Integration

### Backend API Endpoints

The frontend communicates with the backend API:

- **Health Check**: `GET /api/testcases/health`
- **Generate**: `POST /api/testcases/generate`
- **Download**: `POST /api/testcases/download`

### Request Format

```json
{
  "title": "User Registration Feature",
  "description": "User should be able to register with email and password",
  "acceptance_criteria": [
    "Email must be valid format",
    "Password minimum 8 characters",
    "System should send confirmation email"
  ]
}
```

### Response Format

```json
{
  "status": "success",
  "draft_test_cases": [
    {
      "test_case_id": "TC001",
      "test_case_title": "Valid User Registration",
      "test_type": "Functional",
      "priority": "High",
      "confidence_score": 0.85,
      "preconditions": [],
      "test_steps": [],
      "test_data": {},
      "expected_result": "...",
      "review_status": "Draft"
    }
  ],
  "summary": {
    "total_test_cases": 8,
    "by_type": {
      "Functional": 4,
      "Positive": 2,
      "Negative": 1,
      "Boundary Validation": 1
    },
    "generation_timestamp": "2024-04-11T10:30:00Z"
  }
}
```

## ✨ Features in Detail

### 1. Input Form
- **Title**: 5-200 characters
- **Description**: 20-2000 characters
- **Acceptance Criteria**: Multi-line format (auto-parsed)
- **Validation**: Real-time feedback with Zod schema

### 2. Generation
- Click "Generate Test Cases" to start
- Loading state with spinner
- Success/error feedback
- Automatic test case creation

### 3. Result Display
- Summary statistics (total, by type)
- Expandable test case table
- Confidence score visualization
- Review status indicators

### 4. Review & Download
- **Approve/Reject** buttons for review workflows
- **Download CSV** for spreadsheet import
- **Download JSON** for API integration
- Status feedback

## 🎨 UI/UX Features

- **Responsive Design** - Works on desktop, tablet, mobile
- **Material Design** - Professional, enterprise-grade styling
- **Error Handling** - User-friendly error messages
- **Loading States** - Visual feedback during operations
- **Color Coding** - Confidence scores with color gradients
- **Expandable Rows** - Detailed test case information

## 💡 Key Components

### AppHeader
Displays application title and subtitle.

### StoryInputForm
Multi-field form with validation for user story input.

### GenerationStatus
Shows loading, success, or error states during generation.

### TestCaseSummary
Displays generation statistics in card format.

### TestCaseTable
Expandable table showing all generated test cases with filtering.

### ReviewActionBar
Provides approval/rejection and download actions.

## 🔒 Error Handling

The application handles:
- **Network errors** - Clear messaging when backend unavailable
- **Validation errors** - Field-level validation feedback
- **API errors** - Detailed error messages from backend
- **Download errors** - Retry capability for failed downloads

## 📊 State Management

Application state includes:
- **Form State** - Title, description, acceptance criteria
- **Request State** - idle, loading, success, error
- **Response State** - Generated test cases, summary
- **Download State** - Download progress, errors
- **Approval State** - Approval/rejection status

## 🚢 Deployment

### Development Deployment
```bash
npm run dev
# Access at http://localhost:5173
```

### Production Build
```bash
npm run build
# Deploy dist/ folder to web server
```

### Environment Configuration
Update `.env.production` with your production API URL before building.

## 🐛 Troubleshooting

### Backend Not Available
**Error**: "Backend service is not available"
**Solution**: Ensure backend is running on http://localhost:8000

### CORS Errors
**Error**: "No 'Access-Control-Allow-Origin' header"
**Solution**: Backend CORS configuration needs to allow frontend origin

### API Errors (422)
**Error**: "Validation Error: ..."
**Solution**: Check input validation - ensure fields meet length requirements

### Download Not Working
**Error**: "Download failed"
**Solution**: Check backend download endpoint, ensure test cases are valid

## 📝 Usage Example

1. **Enter User Story**:
   - Title: "User Registration with Email Validation"
   - Description: "As a user, I want to register with email and password..."
   - Acceptance Criteria: (enter 3+ criteria)

2. **Generate**:
   - Click "✨ Generate Test Cases"
   - Wait for generation to complete

3. **Review**:
   - Check generated test cases
   - Click rows to see details
   - Review confidence scores

4. **Approve & Download**:
   - Click "Approve" to accept test cases
   - Click "Download CSV" or "Download JSON"
   - File will be saved to downloads folder

## 🔧 Development Tips

### Running with Hot Reload
```bash
npm run dev
# Changes are automatically reflected
```

### Debug API Calls
Open browser DevTools → Network tab to inspect API requests/responses.

### Add New Component
1. Create file in `src/components/`
2. Export as default in file
3. Import and use in pages

### Add API Method
1. Add function to `src/services/testcaseService.js`
2. Use in components via import
3. Handle errors appropriately

## 📚 Resources

- [React Documentation](https://react.dev)
- [Material-UI Documentation](https://mui.com)
- [React Hook Form](https://react-hook-form.com)
- [Zod Validation](https://zod.dev)
- [Vite Guide](https://vitejs.dev)

## ✅ Quality Assurance

### Before Deployment

- [ ] All components render correctly
- [ ] Form validation works
- [ ] API integration tested
- [ ] Download functionality verified
- [ ] Error states handled
- [ ] Responsive design checked
- [ ] No console errors

## 📞 Support

For issues or questions:
1. Check the troubleshooting section
2. Review API responses in browser DevTools
3. Verify backend is running and accessible
4. Check environment configuration

## 📄 License

This project is part of the Test Case Generation Agent application.

---

**Frontend Version**: 1.0.0  
**Last Updated**: April 11, 2026
