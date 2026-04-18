/// <reference types="vite/client" />
import { GenerationResponse, TestCase, ImpactAnalysisResponse, IngestResponse, EvalResponse } from '../types/index';

// Use relative URLs for Vite proxy to work correctly in dev mode
const API_BASE_PATH = '/api';

console.log('🔧 Testcase Service Initialized with Fetch');
console.log('🌐 API Base Path:', API_BASE_PATH);

export const checkHealth = async (): Promise<any> => {
  try {
    const url = `${API_BASE_PATH}/testcases/health`;
    console.log('🏥 [Health] Fetching from:', url);
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    
    const data = await response.json();
    console.log('✅ Health check passed:', data);
    return data;
  } catch (error: any) {
    console.error('❌ Health check failed:', error);
    throw new Error(`Health check failed: ${error.message}`);
  }
};

export const generateTestCases = async (userStory: any): Promise<GenerationResponse> => {
  try {
    console.log('🧪 [Generate] Starting test case generation');
    console.log('Input userStory:', userStory);
    
    const payload = {
      title: (userStory?.title || '').trim(),
      description: (userStory?.description || '').trim(),
      acceptanceCriteria: Array.isArray(userStory?.acceptanceCriteria) 
        ? userStory.acceptanceCriteria.filter((ac: string) => (ac || '').trim().length > 0)
        : []
    };

    console.log('📤 [Generate] Payload:', JSON.stringify(payload, null, 2));
    const url = `${API_BASE_PATH}/testcases/generate`;
    console.log('📤 [Generate] Posting to:', url);
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload)
    });

    console.log('✅ [Generate] Response status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ [Generate] HTTP Error:', response.status, errorText);
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }

    const data = await response.json();
    
    console.log('✅ [Generate] Response received');
    console.log('Response data:', data);
    console.log('Test cases count:', data?.draftTestCases?.length);
    
    if (!data || typeof data !== 'object') {
      console.error('❌ [Generate] Invalid response type:', typeof data);
      throw new Error('Invalid response format');
    }
    
    if (!Array.isArray(data.draftTestCases)) {
      console.error('❌ [Generate] draftTestCases is not an array:', data.draftTestCases);
      throw new Error('draftTestCases is not an array');
    }

    console.log('✅ [Generate] SUCCESS - Returning', data.draftTestCases.length, 'test cases');
    return data;
  } catch (error: any) {
    console.error('❌ [Generate] Exception caught:', error);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    throw error;
  }
};

export const uploadUserStories = async (file: File): Promise<GenerationResponse> => {
  try {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${API_BASE_PATH}/testcases/upload`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }

    const data = await response.json();
    if (!Array.isArray(data.draft_test_cases)) {
      throw new Error('Invalid response format from upload endpoint');
    }
    return data;
  } catch (error: any) {
    throw new Error(`Upload failed: ${error.message}`);
  }
};

export const downloadTestCasesAsCSV = async (testCases: TestCase[]): Promise<Blob> => {
  try {
    const response = await fetch(`${API_BASE_PATH}/testcases/download`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ testCases, format: 'csv' })
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    return await response.blob();
  } catch (error: any) {
    throw new Error(`CSV Download failed: ${error.message}`);
  }
};

export const downloadTestCasesAsJSON = async (testCases: TestCase[]): Promise<Blob> => {
  try {
    const response = await fetch(`${API_BASE_PATH}/testcases/download`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ testCases, format: 'json' })
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    return await response.blob();
  } catch (error: any) {
    throw new Error(`JSON Download failed: ${error.message}`);
  }
};

export const downloadFile = (blob: Blob, filename: string): void => {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};

export const generateWithImpact = async (userStory: any): Promise<ImpactAnalysisResponse> => {
  try {
    const payload = {
      title: (userStory?.title || '').trim(),
      description: (userStory?.description || '').trim(),
      acceptanceCriteria: Array.isArray(userStory?.acceptanceCriteria)
        ? userStory.acceptanceCriteria.filter((ac: string) => (ac || '').trim().length > 0)
        : [],
    };

    const response = await fetch(`${API_BASE_PATH}/testcases/generate-with-impact`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }

    return response.json();
  } catch (error: any) {
    throw new Error(`Generate with impact failed: ${error.message}`);
  }
};

export const ingestTestCases = async (
  testCases: any[],
  defaultUserStoryTitle: string,
  defaultUserStoryDescription: string
): Promise<IngestResponse> => {
  try {
    const response = await fetch(`${API_BASE_PATH}/testcases/ingest`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ testCases, defaultUserStoryTitle, defaultUserStoryDescription }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }

    return response.json();
  } catch (error: any) {
    throw new Error(`Ingest failed: ${error.message}`);
  }
};

export const evaluateTestCases = async (
  userStory: { title: string; description: string; acceptanceCriteria: string[] },
  testCases: TestCase[]
): Promise<EvalResponse> => {
  try {
    const response = await fetch(`${API_BASE_PATH}/testcases/evaluate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: userStory.title,
        description: userStory.description,
        acceptanceCriteria: userStory.acceptanceCriteria,
        testCases,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }

    return response.json();
  } catch (error: any) {
    throw new Error(`Evaluation failed: ${error.message}`);
  }
};

const testcaseService = {
  checkHealth,
  generateTestCases,
  generateWithImpact,
  ingestTestCases,
  evaluateTestCases,
  downloadTestCasesAsCSV,
  downloadTestCasesAsJSON,
  downloadFile
};

export default testcaseService;
