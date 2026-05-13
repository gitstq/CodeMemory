import React, { useState, useEffect } from 'react';
import { FiCode, FiSearch, FiPlus, FiDatabase } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import { getSnippets, getLanguages, getTags } from '../utils/api';
import { CodeSnippet } from '../types';
import SnippetCard from '../components/SnippetCard';
import './Home.css';

const Home: React.FC = () => {
  const navigate = useNavigate();
  const [snippets, setSnippets] = useState<CodeSnippet[]>([]);
  const [languages, setLanguages] = useState<string[]>([]);
  const [allTags, setAllTags] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ total: 0, languages: 0, tags: 0 });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [snippetsData, languagesData, tagsData] = await Promise.all([
        getSnippets(undefined, undefined, 6),
        getLanguages(),
        getTags()
      ]);
      
      setSnippets(snippetsData);
      setLanguages(languagesData);
      setAllTags(tagsData);
      setStats({
        total: snippetsData.length,
        languages: languagesData.length,
        tags: tagsData.length
      });
    } catch (error) {
      console.error('获取数据失败:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="home-page">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <div className="hero-icon">
            <FiCode size={48} />
          </div>
          <h1 className="hero-title">CodeMemory</h1>
          <p className="hero-subtitle">
            智能代码片段记忆库 - 支持语义搜索的智能代码管理工具
          </p>
          <div className="hero-actions">
            <button 
              className="btn btn-primary"
              onClick={() => navigate('/search')}
            >
              <FiSearch />
              搜索代码
            </button>
            <button 
              className="btn btn-secondary"
              onClick={() => navigate('/add')}
            >
              <FiPlus />
              添加片段
            </button>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="stats-section">
        <div className="stats-grid">
          <div className="stat-card">
            <FiDatabase className="stat-icon" />
            <div className="stat-content">
              <span className="stat-value">{stats.total}</span>
              <span className="stat-label">代码片段</span>
            </div>
          </div>
          <div className="stat-card">
            <FiCode className="stat-icon" />
            <div className="stat-content">
              <span className="stat-value">{stats.languages}</span>
              <span className="stat-label">编程语言</span>
            </div>
          </div>
          <div className="stat-card">
            <FiSearch className="stat-icon" />
            <div className="stat-content">
              <span className="stat-value">{stats.tags}</span>
              <span className="stat-label">标签</span>
            </div>
          </div>
        </div>
      </section>

      {/* Recent Snippets */}
      <section className="recent-section">
        <div className="section-header">
          <h2 className="section-title">最近添加</h2>
          <button 
            className="view-all-btn"
            onClick={() => navigate('/search')}
          >
            查看全部
          </button>
        </div>

        {loading ? (
          <div className="loading-container">
            <div className="spinner"></div>
          </div>
        ) : snippets.length > 0 ? (
          <div className="snippets-grid">
            {snippets.map((snippet) => (
              <SnippetCard key={snippet.id} snippet={snippet} />
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <FiCode className="empty-icon" />
            <h3>暂无代码片段</h3>
            <p>开始添加您的第一个代码片段吧</p>
            <button 
              className="btn btn-primary"
              onClick={() => navigate('/add')}
            >
              <FiPlus />
              添加代码片段
            </button>
          </div>
        )}
      </section>

      {/* Languages & Tags */}
      {(languages.length > 0 || allTags.length > 0) && (
        <section className="tags-section">
          {languages.length > 0 && (
            <div className="tags-group">
              <h3 className="tags-title">编程语言</h3>
              <div className="tags-list">
                {languages.slice(0, 10).map((lang) => (
                  <span key={lang} className="language-tag">
                    {lang}
                  </span>
                ))}
              </div>
            </div>
          )}
          
          {allTags.length > 0 && (
            <div className="tags-group">
              <h3 className="tags-title">热门标签</h3>
              <div className="tags-list">
                {allTags.slice(0, 15).map((tag) => (
                  <span key={tag} className="tag-item">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </section>
      )}
    </div>
  );
};

export default Home;
