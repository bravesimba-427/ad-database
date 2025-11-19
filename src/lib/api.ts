import { API_BASE } from "@/lib/config";
import { UploadedFile, Session, AnalysisResult } from "@/lib/types";

const headers = {
  "ngrok-skip-browser-warning": "true",
};

// Helper function to check if error is a network/server error
const isNetworkError = (error: Error | unknown): boolean => {
  if (error instanceof Error) {
    return (
      error.name === 'TypeError' ||
      error.message.includes('Failed to fetch') ||
      error.message.includes('NetworkError') ||
      error.message.includes('ERR_NETWORK') ||
      error.message.includes('ERR_INTERNET_DISCONNECTED') ||
      error.message.includes('ERR_CONNECTION_REFUSED') ||
      error.message.includes('ERR_CONNECTION_TIMED_OUT')
    );
  }
  return false;
};

// Helper function to create consistent error messages
const createErrorMessage = (status: number, message?: string): string => {
  switch (status) {
    case 0:
      return 'Network error: Unable to connect to server';
    case 400:
      return 'Bad request: Invalid data sent to server';
    case 401:
      return 'Unauthorized: Please check your credentials';
    case 403:
      return 'Forbidden: Access denied';
    case 404:
      return 'Not found: The requested resource was not found';
    case 408:
      return 'Request timeout: Server took too long to respond';
    case 429:
      return 'Too many requests: Please try again later';
    case 500:
      return 'Server error: Internal server error occurred';
    case 502:
      return 'Bad gateway: Server is temporarily unavailable';
    case 503:
      return 'Service unavailable: Server is under maintenance';
    case 504:
      return 'Gateway timeout: Server took too long to respond';
    default:
      return message || `HTTP error: ${status}`;
  }
};

export const fetchSessions = async (): Promise<Session[]> => {
  try {
    const response = await fetch(`${API_BASE}/sessions`, { 
      headers,
    });
    
    if (!response.ok) {
      throw new Error(createErrorMessage(response.status));
    }
    
    return response.json();
  } catch (error: unknown) {
    if (isNetworkError(error)) {
      throw new Error('Unable to connect to server. Please check your internet connection and try again.');
    }
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error('Request timed out. Please try again.');
    }
    throw error;
  }
};

export const createSession = async (name?: string): Promise<{ session_id: string }> => {
  try {
    const response = await fetch(`${API_BASE}/sessions`, {
      method: "POST",
      headers: { ...headers, "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });
    
    if (!response.ok) {
      throw new Error(createErrorMessage(response.status));
    }
    
    return response.json();
  } catch (error: unknown) {
    if (isNetworkError(error)) {
      throw new Error('Unable to connect to server. Please check your internet connection and try again.');
    }
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error('Request timed out. Please try again.');
    }
    throw error;
  }
};

export const uploadFileApi = async (file: File, type: UploadedFile["type"]): Promise<{ file_id: string }> => {
  try {
    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch(`${API_BASE}/upload/${type}`, {
      method: "POST",
      headers: headers,
      body: formData,
      signal: AbortSignal.timeout(30000000)
    });
    
    if (!response.ok) {
      throw new Error(createErrorMessage(response.status));
    }
    
    return response.json();
  } catch (error: unknown) {
    if (isNetworkError(error)) {
      throw new Error('Unable to connect to server. Please check your internet connection and try again.');
    }
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error('File upload timed out. Please try again.');
    }
    throw error;
  }
};

export const startAnalysisApi = async (sessionId: string, fileIds: string[]): Promise<{ job_id: string }> => {
  try {
    const response = await fetch(`${API_BASE}/sessions/${sessionId}/analyze`, {
      method: "POST",
      headers: { ...headers, "Content-Type": "application/json" },
      body: JSON.stringify({ file_ids: fileIds }),
    });
    
    if (!response.ok) {
      throw new Error(createErrorMessage(response.status));
    }
    
    return response.json();
  } catch (error: unknown) {
    if (isNetworkError(error)) {
      throw new Error('Unable to connect to server. Please check your internet connection and try again.');
    }
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error('Request timed out. Please try again.');
    }
    throw error;
  }
};

export const getAnalysisStatusApi = async (jobId: string): Promise<{ job_id: string; status: string }> => {
  try {
    const response = await fetch(`${API_BASE}/analysis/${jobId}/status`, { 
      headers,
    });
    
    if (!response.ok) {
      throw new Error(createErrorMessage(response.status));
    }
    
    return response.json();
  } catch (error: unknown) {
    if (isNetworkError(error)) {
      throw new Error('Unable to connect to server. Please check your internet connection and try again.');
    }
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error('Request timed out. Please try again.');
    }
    throw error;
  }
};

export const getAnalysisResultsApi = async (jobId: string): Promise<AnalysisResult> => {
  try {
    const response = await fetch(`${API_BASE}/analysis/${jobId}/results`, { 
      headers,
    });
    
    if (!response.ok) {
      throw new Error(createErrorMessage(response.status));
    }
    
    return response.json();
  } catch (error: unknown) {
    if (isNetworkError(error)) {
      throw new Error('Unable to connect to server. Please check your internet connection and try again.');
    }
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error('Request timed out. Please try again.');
    }
    throw error;
  }
};


