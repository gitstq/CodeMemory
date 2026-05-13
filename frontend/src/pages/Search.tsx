import React, { useState, useEffect } from 'react';
import { FiSearch, FiFilter, FiX } from 'react-icons/fi';
import { searchSnippets, getLanguages, getTags } from '../utils/api';
import { CodeSnippet } from '../types';
import SnippetCard from '../components/SnippetCard';
import toast from 'react-hot-toast';
import './Search.css';

const Search: React.FC = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<CodeSnippet[]>([]);
  const [languages, setLanguages] = useState<string[]>([]);
  const [allTags, setAllTags] = useState<string[]>([]);
  const [selectedLanguage, setSelectedLanguage] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  useEffect(() => {
    fetchFilters();
  }, []);

  const fetchFilters = async () => {
    try {
      const [langs, tags] = await Promise.all([
        getLanguages(),
        getTags()
      ]);
      setLanguages(langs);
      setAllTags(tags);
    } catch (error) {
      console.error('获取过滤器失败:', error);
    }
  };

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    
    if (!query.trim()) {
      toast.error('请输入搜索关键词');
      return;
    }

    try {
      setLoading(true);
      setHasSearched(true);
      
      const searchResults = await searchSnippets({
        query: query.trim(),
        language: selectedLanguage || undefined,
        tags: selectedTags,
        limit: 20
      });
      
      setResults(searchResults);
      
      if (searchResults.length === 0) {
        toast('未找到匹配的代码片段', { icon: '🔍' });
      }
    } catch (error) {
      toast.error('搜索失败，请重试');
      console.error('搜索失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleTag = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  const clearFilters = () => {
    setSelectedLanguage('');
    setSelectedTags([]);
  };

  return (
    <div className="search-page">
      <div className="search-header">
        <h1 className="page-title">搜索代码片段</h1>
        <p className="page-subtitle">
          使用自然语言描述您需要的代码，我们支持语义搜索
        </p>
      </div>

      <form className="search-form" onSubmit={handleSearch}>
        <div className="search-input-wrapper">
          <FiSearch className="search-icon" />
          <input
            type="text"
            className="search-input"
            placeholder="例如：Python 快速排序算法、React useEffect 示例..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          {query && (
            <button 
              type="button" 
              className="clear-btn"
              onClick={() => setQuery('')}
            >
              <FiX />
            </button>
          )}
        </div>
        <button 
          type="submit" 
          className="btn btn-primary search-btn"
          disabled={loading}
        >
          {loading ? '搜索中...' : '搜索'}
        </button>
      </form>

      {/* Filters */}
      <div className="filters-section">
        <div className="filters-header">
          <FiFilter className="filter-icon" />
          <span>筛选器</span>
          {(selectedLanguage || selectedTags.length > 0) && (
            <button className="clear-filters-btn" onClick={clearFilters}>
              清除筛选
            </button>
          )}
        </div>

        <div className="filters-content">
          {/* Language Filter */}
          {languages.length > 0 && (
            <div className="filter-group">
              <label className="filter-label">编程语言</label>
              <select
                className="filter-select"
                value={selectedLanguage}
                onChange={(e) => setSelectedLanguage(e.target.value)}
              >
                <option value="">全部语言</option>
                {languages.map((lang) => (
                  <option key={lang} value={lang}>
                    {lang}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Tags Filter */}
          {allTags.length > 0 && (
            <div className="filter-group">
              <label className="filter-label">标签</label>
              <div className="tags-filter">
                {allTags.slice(0, 20).map((tag) => (
                  <button
                    key={tag}
                    className={`tag-btn ${selectedTags.includes(tag) ? 'active' : ''}`}
                    onClick={() => toggleTag(tag)}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Results */}
      <div className="results-section">
        {hasSearched && (
          <div className="results-header">
            <h2 className="results-title">
              {loading ? '搜索中...' : `找到 ${results.length} 个结果`}
            </h2>
          </div>
        )}

        {loading ? (
          <div className="loading-container">
            <div className="spinner"></div>
            <p>正在搜索...</p>
          </div>
        ) : hasSearched ? (
          results.length > 0 ? (
            <div className="results-grid">
              {results.map((snippet) => (
                <SnippetCard key={snippet.id} snippet={snippet} />
              ))}
            </div>
          ) : (
            <div className="no-results">
              <FiSearch size={48} className="no-results-icon" />
              <h3>未找到结果</h3>
              <p>尝试使用不同的关键词或调整筛选条件</p>
            </div>
          )
        ) : (
          <div className="search-placeholder">
            <FiSearch size={64} className="placeholder-icon" />
            <h3>开始搜索</h3>
            <p>输入关键词查找您需要的代码片段</p>
            <div className="search-examples">
              <p>搜索示例：</p>
              <ul>
                <li>"Python 读取 CSV 文件"</li>
                <li>"React 自定义 Hook"</li>
                <li>"JavaScript 防抖函数"</li>
                <li>"SQL 连接查询"</li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Search;
