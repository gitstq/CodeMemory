import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  FiArrowLeft, 
  FiEdit2, 
  FiTrash2, 
  FiCalendar,
  FiTag,
  FiLink,
  FiPackage,
  FiCopy,
  FiCheck
} from 'react-icons/fi';
import { getSnippet, deleteSnippet } from '../utils/api';
import { CodeSnippet } from '../types';
import CodeBlock from '../components/CodeBlock';
import toast from 'react-hot-toast';
import './SnippetDetail.css';

const SnippetDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [snippet, setSnippet] = useState<CodeSnippet | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (id) {
      fetchSnippet(id);
    }
  }, [id]);

  const fetchSnippet = async (snippetId: string) => {
    try {
      setLoading(true);
      const data = await getSnippet(snippetId);
      setSnippet(data);
    } catch (error) {
      toast.error('获取代码片段失败');
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!snippet) return;
    
    if (!window.confirm('确定要删除这个代码片段吗？此操作不可撤销。')) {
      return;
    }

    try {
      await deleteSnippet(snippet.id);
      toast.success('代码片段已删除');
      navigate('/');
    } catch (error) {
      toast.error('删除失败');
    }
  };

  const handleCopyCode = async () => {
    if (!snippet) return;
    
    try {
      await navigator.clipboard.writeText(snippet.code);
      setCopied(true);
      toast.success('代码已复制到剪贴板');
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast.error('复制失败');
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="snippet-detail-page">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>加载中...</p>
        </div>
      </div>
    );
  }

  if (!snippet) {
    return (
      <div className="snippet-detail-page">
        <div className="error-container">
          <h2>代码片段不存在</h2>
          <button className="btn btn-primary" onClick={() => navigate('/')}>
            返回首页
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="snippet-detail-page">
      {/* Header */}
      <div className="detail-header">
        <button 
          className="back-btn"
          onClick={() => navigate(-1)}
        >
          <FiArrowLeft />
          返回
        </button>
        
        <div className="header-actions">
          <button 
            className="action-btn copy-btn"
            onClick={handleCopyCode}
            title="复制代码"
          >
            {copied ? <FiCheck /> : <FiCopy />}
            {copied ? '已复制' : '复制'}
          </button>
          <button 
            className="action-btn edit-btn"
            onClick={() => toast('编辑功能开发中...')}
            title="编辑"
          >
            <FiEdit2 />
            编辑
          </button>
          <button 
            className="action-btn delete-btn"
            onClick={handleDelete}
            title="删除"
          >
            <FiTrash2 />
            删除
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="detail-content">
        {/* Info Card */}
        <div className="info-card">
          <h1 className="snippet-title">{snippet.title}</h1>
          
          {snippet.description && (
            <p className="snippet-description">{snippet.description}</p>
          )}

          <div className="info-grid">
            <div className="info-item">
              <span className="info-label">
                <FiPackage size={16} />
                语言
              </span>
              <span className="info-value language-badge">
                {snippet.language}
              </span>
            </div>

            {snippet.source && (
              <div className="info-item">
                <span className="info-label">
                  <FiLink size={16} />
                  来源
                </span>
                <span className="info-value">{snippet.source}</span>
              </div>
            )}

            <div className="info-item">
              <span className="info-label">
                <FiCalendar size={16} />
                创建时间
              </span>
              <span className="info-value">{formatDate(snippet.created_at)}</span>
            </div>

            <div className="info-item">
              <span className="info-label">
                <FiCalendar size={16} />
                更新时间
              </span>
              <span className="info-value">{formatDate(snippet.updated_at)}</span>
            </div>
          </div>

          {snippet.tags.length > 0 && (
            <div className="tags-section">
              <h3 className="section-title">
                <FiTag size={18} />
                标签
              </h3>
              <div className="tags-list">
                {snippet.tags.map((tag, index) => (
                  <span key={index} className="detail-tag">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {snippet.dependencies.length > 0 && (
            <div className="dependencies-section">
              <h3 className="section-title">
                <FiPackage size={18} />
                依赖项
              </h3>
              <div className="dependencies-list">
                {snippet.dependencies.map((dep, index) => (
                  <span key={index} className="dependency-item">
                    {dep}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Code Section */}
        <div className="code-section">
          <h3 className="section-title">代码</h3>
          <CodeBlock 
            code={snippet.code} 
            language={snippet.language}
            showLineNumbers={true}
          />
        </div>
      </div>
    </div>
  );
};

export default SnippetDetail;
