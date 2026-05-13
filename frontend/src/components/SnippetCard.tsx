import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FiCalendar, FiTag, FiExternalLink } from 'react-icons/fi';
import { CodeSnippet } from '../types';
import './SnippetCard.css';

interface SnippetCardProps {
  snippet: CodeSnippet;
}

const SnippetCard: React.FC<SnippetCardProps> = ({ snippet }) => {
  const navigate = useNavigate();

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getSimilarityColor = (similarity: number) => {
    if (similarity >= 0.8) return 'high';
    if (similarity >= 0.5) return 'medium';
    return 'low';
  };

  return (
    <div 
      className="snippet-card"
      onClick={() => navigate(`/snippet/${snippet.id}`)}
    >
      <div className="snippet-card-header">
        <h3 className="snippet-title">{snippet.title}</h3>
        {snippet.similarity !== undefined && (
          <span className={`similarity-badge ${getSimilarityColor(snippet.similarity)}`}>
            {(snippet.similarity * 100).toFixed(1)}%
          </span>
        )}
      </div>

      <p className="snippet-description">
        {snippet.description || '暂无描述'}
      </p>

      <div className="snippet-meta">
        <span className="language-tag">
          {snippet.language}
        </span>
        
        {snippet.tags.length > 0 && (
          <div className="snippet-tags">
            <FiTag size={14} />
            {snippet.tags.slice(0, 3).map((tag, index) => (
              <span key={index} className="tag-item">{tag}</span>
            ))}
            {snippet.tags.length > 3 && (
              <span className="tag-more">+{snippet.tags.length - 3}</span>
            )}
          </div>
        )}
      </div>

      <div className="snippet-footer">
        <span className="snippet-date">
          <FiCalendar size={14} />
          {formatDate(snippet.created_at)}
        </span>
        <FiExternalLink size={16} className="view-icon" />
      </div>
    </div>
  );
};

export default SnippetCard;
