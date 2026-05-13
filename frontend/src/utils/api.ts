import axios, { AxiosError } from 'axios';
import { CodeSnippet, SearchQuery, CreateSnippetRequest } from '../types';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 错误处理拦截器
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    const message = error.response?.data?.detail || error.message || '未知错误';
    return Promise.reject(new Error(message));
  }
);

export const healthCheck = async (): Promise<boolean> => {
  try {
    const response = await api.get('/health');
    return response.data.status === 'healthy';
  } catch {
    return false;
  }
};

export const getSnippets = async (
  language?: string,
  tags?: string[],
  limit: number = 50
): Promise<CodeSnippet[]> => {
  const params: Record<string, string | number> = { limit };
  if (language) params.language = language;
  if (tags?.length) params.tags = tags.join(',');
  
  const response = await api.get('/snippets', { params });
  return response.data;
};

export const getSnippet = async (id: string): Promise<CodeSnippet> => {
  const response = await api.get(`/snippets/${id}`);
  return response.data;
};

export const createSnippet = async (snippet: CreateSnippetRequest): Promise<CodeSnippet> => {
  const response = await api.post('/snippets', snippet);
  return response.data;
};

export const updateSnippet = async (
  id: string,
  snippet: Partial<CreateSnippetRequest>
): Promise<CodeSnippet> => {
  const response = await api.put(`/snippets/${id}`, snippet);
  return response.data;
};

export const deleteSnippet = async (id: string): Promise<void> => {
  await api.delete(`/snippets/${id}`);
};

export const searchSnippets = async (query: SearchQuery): Promise<CodeSnippet[]> => {
  const response = await api.post('/search', query);
  return response.data;
};

export const getLanguages = async (): Promise<string[]> => {
  const response = await api.get('/languages');
  return response.data.languages;
};

export const getTags = async (): Promise<string[]> => {
  const response = await api.get('/tags');
  return response.data.tags;
};

export default api;
