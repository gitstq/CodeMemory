import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiSave, FiPlus, FiX, FiCode } from 'react-icons/fi';
import { createSnippet, getLanguages, getTags } from '../utils/api';
import toast from 'react-hot-toast';
import './AddSnippet.css';

const COMMON_LANGUAGES = [
  'python', 'javascript', 'typescript', 'java', 'go', 'rust',
  'c', 'cpp', 'csharp', 'php', 'ruby', 'swift', 'kotlin',
  'sql', 'html', 'css', 'scss', 'bash', 'json', 'yaml',
  'markdown', 'dockerfile', 'graphql', 'regex'
];

const AddSnippet: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [existingLanguages, setExistingLanguages] = useState<string[]>([]);
  const [existingTags, setExistingTags] = useState<string[]>([]);
  
  const [formData, setFormData] = useState({
    title: '',
    code: '',
    language: 'python',
    description: '',
    source: '',
    tags: [] as string[],
    dependencies: [] as string[]
  });
  
  const [newTag, setNewTag] = useState('');
  const [newDependency, setNewDependency] = useState('');

  useEffect(() => {
    fetchExistingData();
  }, []);

  const fetchExistingData = async () => {
    try {
      const [langs, tags] = await Promise.all([
        getLanguages(),
        getTags()
      ]);
      setExistingLanguages(langs);
      setExistingTags(tags);
    } catch (error) {
      console.error('获取数据失败:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      toast.error('请输入标题');
      return;
    }
    
    if (!formData.code.trim()) {
      toast.error('请输入代码');
      return;
    }

    try {
      setLoading(true);
      await createSnippet(formData);
      toast.success('代码片段已添加！');
      navigate('/');
    } catch (error) {
      toast.error('添加失败，请重试');
      console.error('添加失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }));
      setNewTag('');
    }
  };

  const removeTag = (tag: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(t => t !== tag)
    }));
  };

  const addDependency = () => {
    if (newDependency.trim() && !formData.dependencies.includes(newDependency.trim())) {
      setFormData(prev => ({
        ...prev,
        dependencies: [...prev.dependencies, newDependency.trim()]
      }));
      setNewDependency('');
    }
  };

  const removeDependency = (dep: string) => {
    setFormData(prev => ({
      ...prev,
      dependencies: prev.dependencies.filter(d => d !== dep)
    }));
  };

  const handleKeyDown = (e: React.KeyboardEvent, type: 'tag' | 'dependency') => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (type === 'tag') {
        addTag();
      } else {
        addDependency();
      }
    }
  };

  // 合并常用语言和已有语言
  const allLanguages = Array.from(new Set([...COMMON_LANGUAGES, ...existingLanguages])).sort();

  return (
    <div className="add-snippet-page">
      <div className="page-header">
        <h1 className="page-title">
          <FiCode />
          添加代码片段
        </h1>
        <p className="page-subtitle">将您的代码保存到记忆库，支持语义搜索</p>
      </div>

      <form className="snippet-form" onSubmit={handleSubmit}>
        <div className="form-grid">
          {/* Left Column */}
          <div className="form-column">
            {/* Title */}
            <div className="form-group">
              <label className="form-label">
                标题 <span className="required">*</span>
              </label>
              <input
                type="text"
                name="title"
                className="form-input"
                placeholder="例如：Python 快速排序实现"
                value={formData.title}
                onChange={handleChange}
                required
              />
            </div>

            {/* Language */}
            <div className="form-group">
              <label className="form-label">编程语言</label>
              <select
                name="language"
                className="form-select"
                value={formData.language}
                onChange={handleChange}
              >
                {allLanguages.map((lang) => (
                  <option key={lang} value={lang}>
                    {lang}
                  </option>
                ))}
              </select>
            </div>

            {/* Description */}
            <div className="form-group">
              <label className="form-label">描述</label>
              <textarea
                name="description"
                className="form-textarea"
                placeholder="简要描述这段代码的功能..."
                value={formData.description}
                onChange={handleChange}
                rows={4}
              />
            </div>

            {/* Source */}
            <div className="form-group">
              <label className="form-label">来源</label>
              <input
                type="text"
                name="source"
                className="form-input"
                placeholder="例如：Stack Overflow、GitHub..."
                value={formData.source}
                onChange={handleChange}
              />
            </div>

            {/* Tags */}
            <div className="form-group">
              <label className="form-label">标签</label>
              <div className="tag-input-wrapper">
                <input
                  type="text"
                  className="form-input"
                  placeholder="添加标签后按回车"
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onKeyDown={(e) => handleKeyDown(e, 'tag')}
                />
                <button
                  type="button"
                  className="add-tag-btn"
                  onClick={addTag}
                >
                  <FiPlus />
                </button>
              </div>
              
              {/* Existing Tags Suggestions */}
              {existingTags.length > 0 && (
                <div className="suggested-tags">
                  <span className="suggested-label">推荐标签：</span>
                  <div className="suggested-list">
                    {existingTags.slice(0, 10).map((tag) => (
                      <button
                        key={tag}
                        type="button"
                        className="suggested-tag"
                        onClick={() => {
                          if (!formData.tags.includes(tag)) {
                            setFormData(prev => ({
                              ...prev,
                              tags: [...prev.tags, tag]
                            }));
                          }
                        }}
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Selected Tags */}
              {formData.tags.length > 0 && (
                <div className="selected-tags">
                  {formData.tags.map((tag) => (
                    <span key={tag} className="selected-tag">
                      {tag}
                      <button
                        type="button"
                        className="remove-tag-btn"
                        onClick={() => removeTag(tag)}
                      >
                        <FiX />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Dependencies */}
            <div className="form-group">
              <label className="form-label">依赖项</label>
              <div className="tag-input-wrapper">
                <input
                  type="text"
                  className="form-input"
                  placeholder="例如：numpy, pandas..."
                  value={newDependency}
                  onChange={(e) => setNewDependency(e.target.value)}
                  onKeyDown={(e) => handleKeyDown(e, 'dependency')}
                />
                <button
                  type="button"
                  className="add-tag-btn"
                  onClick={addDependency}
                >
                  <FiPlus />
                </button>
              </div>
              
              {formData.dependencies.length > 0 && (
                <div className="selected-tags">
                  {formData.dependencies.map((dep) => (
                    <span key={dep} className="selected-tag dependency">
                      {dep}
                      <button
                        type="button"
                        className="remove-tag-btn"
                        onClick={() => removeDependency(dep)}
                      >
                        <FiX />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Code */}
          <div className="form-column">
            <div className="form-group code-group">
              <label className="form-label">
                代码 <span className="required">*</span>
              </label>
              <textarea
                name="code"
                className="code-textarea"
                placeholder="在此粘贴您的代码..."
                value={formData.code}
                onChange={handleChange}
                required
                spellCheck={false}
              />
            </div>
          </div>
        </div>

        {/* Form Actions */}
        <div className="form-actions">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => navigate('/')}
            disabled={loading}
          >
            取消
          </button>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
          >
            <FiSave />
            {loading ? '保存中...' : '保存代码片段'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddSnippet;
