import React, { useState } from 'react';
import { FiCopy, FiCheck } from 'react-icons/fi';
import { highlightCode, normalizeLanguage } from '../utils/prism';
import './CodeBlock.css';

interface CodeBlockProps {
  code: string;
  language: string;
  showLineNumbers?: boolean;
}

const CodeBlock: React.FC<CodeBlockProps> = ({ 
  code, 
  language, 
  showLineNumbers = true 
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('复制失败:', err);
    }
  };

  const normalizedLang = normalizeLanguage(language);
  const highlightedCode = highlightCode(code, language);
  const lines = code.split('\n');

  return (
    <div className="code-block-wrapper">
      <div className="code-header">
        <span className="code-language">{normalizedLang}</span>
        <button 
          className="copy-button"
          onClick={handleCopy}
          title={copied ? '已复制!' : '复制代码'}
        >
          {copied ? <FiCheck /> : <FiCopy />}
          <span>{copied ? '已复制' : '复制'}</span>
        </button>
      </div>
      <div className="code-content">
        {showLineNumbers && (
          <div className="line-numbers">
            {lines.map((_, index) => (
              <span key={index} className="line-number">
                {index + 1}
              </span>
            ))}
          </div>
        )}
        <pre className={`language-${normalizedLang}`}>
          <code 
            dangerouslySetInnerHTML={{ __html: highlightedCode }}
          />
        </pre>
      </div>
    </div>
  );
};

export default CodeBlock;
