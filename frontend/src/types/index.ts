export interface CodeSnippet {
  id: string;
  title: string;
  code: string;
  language: string;
  description?: string;
  tags: string[];
  source?: string;
  dependencies: string[];
  created_at: string;
  updated_at: string;
  similarity?: number;
}

export interface SearchQuery {
  query: string;
  language?: string;
  tags: string[];
  limit: number;
}

export interface CreateSnippetRequest {
  title: string;
  code: string;
  language: string;
  description?: string;
  tags: string[];
  source?: string;
  dependencies: string[];
}

export interface ApiResponse<T> {
  data?: T;
  error?: string;
}
