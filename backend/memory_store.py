"""
CodeMemory - 向量记忆存储模块
使用ChromaDB进行本地向量存储和语义搜索
"""

import chromadb
from chromadb.config import Settings
from sentence_transformers import SentenceTransformer
from datetime import datetime
import hashlib
import json
import os
from typing import List, Dict, Any, Optional


class MemoryStore:
    """代码片段记忆存储类"""
    
    def __init__(self, db_path: str = "./data/chroma_db"):
        """初始化记忆存储"""
        self.db_path = db_path
        
        # 确保数据目录存在
        os.makedirs(db_path, exist_ok=True)
        
        # 初始化ChromaDB客户端
        self.client = chromadb.Client(Settings(
            chroma_db_impl="duckdb+parquet",
            persist_directory=db_path
        ))
        
        # 获取或创建集合
        self.collection = self.client.get_or_create_collection(
            name="code_snippets",
            metadata={"hnsw:space": "cosine"}
        )
        
        # 初始化嵌入模型
        self.model = SentenceTransformer('all-MiniLM-L6-v2')
        
        self._ready = True
    
    def is_ready(self) -> bool:
        """检查存储是否就绪"""
        return self._ready
    
    def _generate_id(self, code: str) -> str:
        """基于代码内容生成唯一ID"""
        content = f"{code}_{datetime.now().isoformat()}"
        return hashlib.md5(content.encode()).hexdigest()[:16]
    
    def _get_embedding(self, text: str) -> List[float]:
        """获取文本的向量嵌入"""
        return self.model.encode(text).tolist()
    
    def add_snippet(self, snippet: Dict[str, Any]) -> Dict[str, Any]:
        """
        添加代码片段到记忆库
        
        Args:
            snippet: 代码片段字典
            
        Returns:
            包含ID和时间戳的完整代码片段
        """
        # 生成ID
        snippet_id = self._generate_id(snippet.get('code', ''))
        
        # 准备元数据
        timestamp = datetime.now().isoformat()
        metadata = {
            "title": snippet.get('title', ''),
            "language": snippet.get('language', 'python'),
            "description": snippet.get('description', ''),
            "tags": json.dumps(snippet.get('tags', [])),
            "source": snippet.get('source', ''),
            "dependencies": json.dumps(snippet.get('dependencies', [])),
            "created_at": timestamp,
            "updated_at": timestamp
        }
        
        # 准备文档内容 (用于语义搜索)
        document = f"""
        Title: {snippet.get('title', '')}
        Language: {snippet.get('language', '')}
        Description: {snippet.get('description', '')}
        Tags: {', '.join(snippet.get('tags', []))}
        Code:
        {snippet.get('code', '')}
        """
        
        # 获取嵌入向量
        embedding = self._get_embedding(document)
        
        # 添加到ChromaDB
        self.collection.add(
            ids=[snippet_id],
            embeddings=[embedding],
            documents=[document],
            metadatas=[metadata]
        )
        
        # 返回完整结果
        return {
            "id": snippet_id,
            "title": snippet.get('title', ''),
            "code": snippet.get('code', ''),
            "language": snippet.get('language', 'python'),
            "description": snippet.get('description', ''),
            "tags": snippet.get('tags', []),
            "source": snippet.get('source', ''),
            "dependencies": snippet.get('dependencies', []),
            "created_at": timestamp,
            "updated_at": timestamp
        }
    
    def get_snippet(self, snippet_id: str) -> Optional[Dict[str, Any]]:
        """获取单个代码片段"""
        try:
            result = self.collection.get(ids=[snippet_id])
            if not result['ids']:
                return None
            
            return self._format_snippet(
                result['ids'][0],
                result['metadatas'][0],
                result['documents'][0] if result['documents'] else None
            )
        except Exception:
            return None
    
    def list_snippets(
        self,
        language: Optional[str] = None,
        tags: List[str] = None,
        limit: int = 50,
        offset: int = 0
    ) -> List[Dict[str, Any]]:
        """列出代码片段"""
        # 构建过滤条件
        where_clause = {}
        if language:
            where_clause["language"] = language
        
        # 获取所有结果
        results = self.collection.get(
            where=where_clause if where_clause else None,
            limit=limit + offset
        )
        
        snippets = []
        for i, snippet_id in enumerate(results['ids']):
            # 标签过滤
            if tags:
                snippet_tags = json.loads(results['metadatas'][i].get('tags', '[]'))
                if not any(tag in snippet_tags for tag in tags):
                    continue
            
            snippet = self._format_snippet(
                snippet_id,
                results['metadatas'][i],
                results['documents'][i] if results['documents'] else None
            )
            snippets.append(snippet)
        
        # 应用偏移量
        return snippets[offset:offset + limit]
    
    def update_snippet(
        self,
        snippet_id: str,
        update_data: Dict[str, Any]
    ) -> Optional[Dict[str, Any]]:
        """更新代码片段"""
        # 获取现有数据
        existing = self.get_snippet(snippet_id)
        if not existing:
            return None
        
        # 更新字段
        for key, value in update_data.items():
            if key in existing:
                existing[key] = value
        
        # 更新时间戳
        existing['updated_at'] = datetime.now().isoformat()
        
        # 删除旧记录
        self.collection.delete(ids=[snippet_id])
        
        # 添加更新后的记录
        return self.add_snippet(existing)
    
    def delete_snippet(self, snippet_id: str) -> bool:
        """删除代码片段"""
        try:
            # 检查是否存在
            result = self.collection.get(ids=[snippet_id])
            if not result['ids']:
                return False
            
            self.collection.delete(ids=[snippet_id])
            return True
        except Exception:
            return False
    
    def search(
        self,
        query: str,
        language: Optional[str] = None,
        tags: List[str] = None,
        limit: int = 10
    ) -> List[Dict[str, Any]]:
        """
        语义搜索代码片段
        
        Args:
            query: 搜索查询
            language: 语言过滤
            tags: 标签过滤
            limit: 返回数量
            
        Returns:
            匹配的代码片段列表，包含相似度分数
        """
        # 获取查询的嵌入向量
        query_embedding = self._get_embedding(query)
        
        # 构建过滤条件
        where_clause = {}
        if language:
            where_clause["language"] = language
        
        # 执行向量搜索
        results = self.collection.query(
            query_embeddings=[query_embedding],
            n_results=limit * 2,  # 获取更多结果用于标签过滤
            where=where_clause if where_clause else None
        )
        
        snippets = []
        for i, snippet_id in enumerate(results['ids'][0]):
            # 标签过滤
            if tags and results['metadatas'][0]:
                snippet_tags = json.loads(results['metadatas'][0][i].get('tags', '[]'))
                if not any(tag in snippet_tags for tag in tags):
                    continue
            
            snippet = self._format_snippet(
                snippet_id,
                results['metadatas'][0][i],
                results['documents'][0][i] if results['documents'] else None
            )
            snippet['similarity'] = round(1 - results['distances'][0][i], 4)
            snippets.append(snippet)
            
            if len(snippets) >= limit:
                break
        
        return snippets
    
    def get_languages(self) -> List[str]:
        """获取所有编程语言列表"""
        results = self.collection.get()
        languages = set()
        for metadata in results['metadatas']:
            languages.add(metadata.get('language', 'unknown'))
        return sorted(list(languages))
    
    def get_tags(self) -> List[str]:
        """获取所有标签列表"""
        results = self.collection.get()
        all_tags = set()
        for metadata in results['metadatas']:
            tags = json.loads(metadata.get('tags', '[]'))
            all_tags.update(tags)
        return sorted(list(all_tags))
    
    def _format_snippet(
        self,
        snippet_id: str,
        metadata: Dict[str, Any],
        document: Optional[str] = None
    ) -> Dict[str, Any]:
        """格式化代码片段数据"""
        # 从文档中提取代码 (如果metadata中没有)
        code = metadata.get('code', '')
        if not code and document:
            # 尝试从文档中提取代码部分
            lines = document.split('\n')
            code_start = False
            code_lines = []
            for line in lines:
                if line.strip() == 'Code:':
                    code_start = True
                    continue
                if code_start:
                    code_lines.append(line)
            code = '\n'.join(code_lines).strip()
        
        return {
            "id": snippet_id,
            "title": metadata.get('title', ''),
            "code": code,
            "language": metadata.get('language', 'python'),
            "description": metadata.get('description', ''),
            "tags": json.loads(metadata.get('tags', '[]')),
            "source": metadata.get('source', ''),
            "dependencies": json.loads(metadata.get('dependencies', '[]')),
            "created_at": metadata.get('created_at', ''),
            "updated_at": metadata.get('updated_at', '')
        }
