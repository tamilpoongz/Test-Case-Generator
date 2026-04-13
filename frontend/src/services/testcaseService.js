import axios from 'axios';
import { transformAcceptanceCriteria } from '../utils/helpers';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Check backend health status
 */
export const checkHealth = async () => {
  try {
    const response = await apiClient.get('/api/testcases/health');
    return response.data;
  } catch (error) {
    throw new Error(`Health check failed: ${error.message}`);
  }
};

/**
 * Generate test cases from user story
 */
export const generateTestCases = async (title, description, acceptanceCriteria) => {
  try {
    // Transform acceptance criteria text into array
    const criteria = transformAcceptanceCriteria(acceptanceCriteria);
    
    if (criteria.length === 0) {
      throw new Error('Acceptance Criteria must contain at least one item');
    }

    const payload = {
      title: title.trim(),
      description: description.trim(),
      acceptanceCriteria: criteria,
    };

    const response = await apiClient.post('/api/testcases/generate', payload);
    
    if (response.data.status === 'success') {
      return response.data;
    } else {
      throw new Error(response.data.error || 'Failed to generate test cases');
    }
  } catch (error) {
    if (error.response) {
      // Backend returned error
      if (error.response.status === 422) {
        const details = error.response.data.detail;
        if (Array.isArray(details)) {
          const messages = details.map(d => `${d.loc.join('.')}: ${d.msg}`).join('; ');
          throw new Error(`Validation Error: ${messages}`);
        }
      }
      throw new Error(error.response.data.message || `Error: ${error.response.statusText}`);
    }
    throw error;
  }
};

/**
 * Download test cases as CSV
 */
export const downloadTestCasesAsCSV = async (testCases) => {
  try {
    const payload = {
      format: 'csv',
      test_cases: testCases,
    };

    const response = await apiClient.post('/api/testcases/download', payload, {
      responseType: 'blob',
    });

    return response.data;
  } catch (error) {
    throw new Error(`Download failed: ${error.message}`);
  }
};

/**
 * Download test cases as JSON
 */
export const downloadTestCasesAsJSON = async (testCases) => {
  try {
    const payload = {
      format: 'json',
      test_cases: testCases,
    };

    const response = await apiClient.post('/api/testcases/download', payload, {
      responseType: 'blob',
    });

    return response.data;
  } catch (error) {
    throw new Error(`Download failed: ${error.message}`);
  }
};

/**
 * Upload a CSV or Excel file of user stories and generate test cases in bulk
 */
export const uploadUserStories = async (file) => {
  try {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${API_BASE_URL}/api/testcases/upload`, {
      method: 'POST',
      body: formData,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || `Upload failed with status ${response.status}`);
    }

    if (!Array.isArray(data.draft_test_cases)) {
      throw new Error('Invalid response from server');
    }

    return data;
  } catch (error) {
    throw new Error(`Upload failed: ${error.message}`);
  }
};

export default apiClient;
