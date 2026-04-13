/// <reference types="vite/client" />
import axios from 'axios';
import { UserStory, GenerationResponse, TestCase } from '../types/index';

const API_BASE_URL = (import.meta.env.VITE_API_URL as string) || 'http://localhost:3001';

console.log('🔧 Testcase Service Initialized');
console.log('🌐 API Base URL:', API_BASE_URL);

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add response interceptor for debugging
apiClient.interceptors.response.use(
  response => {
    console.log('✅ API Response received:', response.status);
    console.log('Response data:', response.data);
    return response;
  },
  error => {
    console.error('❌ API Error:', error.message);
    console.error('Error response:', error.response?.data);
    console.error('Error status:', error.response?.status);
    return Promise.reject(error);
  }
);

export const checkHealth = async (): Promise<any> => {
  try {
    console.log('🏥 Checking health...');
    const response = await apiClient.get('/api/testcases/health');
    console.log('✅ Health check passed');
    return response.data;
  } catch (error) {
    console.error('❌ Health check failed:', error);
    throw new Error(`Health check failed: ${error}`);
  }
};

export const generateTestCases = async (userStory: any): Promise<GenerationResponse> => {
  try {
    console.log('🧪 Generating test cases...');
    console.log('Input userStory:', userStory);
    
    const payload = {
      title: (userStory.title || '').trim(),
      description: (userStory.description || '').trim(),
      acceptanceCriteria: Array.isArray(userStory.acceptanceCriteria) 
        ? userStory.acceptanceCriteria.filter(ac => (ac || '').trim().length > 0)
        : []
    };

    console.log('📤 Sending payload:', JSON.stringify(payload, null, 2));
    
    const response = await apiClient.post('/api/testcases/generate', payload);
    
    console.log('✅ Response received');
    console.log('Response status:', response.status);
    console.log('Response data:', response.data);
    console.log('Test cases count:', response.data?.draftTestCases?.length);
    
    return response.data;
  } catch (error: any) {
    console.error('❌ Error generating test cases:', error);
    console.error('Error message:', error.message);
    console.error('Error response:', error.response?.data);
    throw error;
  }
};

export const downloadTestCasesAsCSV = async (testCases: TestCase[]): Promise<Blob> => {
  try {
    const response = await apiClient.post(
      '/api/testcases/download',
      { testCases, format: 'csv' },
      { responseType: 'blob' }
    );
    return response.data;
  } catch (error) {
    throw new Error(`CSV Download failed: ${error}`);
  }
};

export const downloadTestCasesAsJSON = async (testCases: TestCase[]): Promise<Blob> => {
  try {
    const response = await apiClient.post(
      '/api/testcases/download',
      { testCases, format: 'json' },
      { responseType: 'blob' }
    );
    return response.data;
  } catch (error) {
    throw new Error(`JSON Download failed: ${error}`);
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

const testcaseService = {
  checkHealth,
  generateTestCases,
  downloadTestCasesAsCSV,
  downloadTestCasesAsJSON,
  downloadFile
};

export default testcaseService;
