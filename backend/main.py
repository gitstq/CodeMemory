"""
CodeMemory - 智能代码片段记忆库后端服务
"""

from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
import uvicorn
from datetime import datetime
import hashlib

from memory_store import MemoryStore

app = FastAPI(
    title="CodeMemory API",
    description="智能代码片段记忆库 - 语义搜索与智能检索",
    version="1.0.0"
)

# CORS配置
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 初始化记忆存储
memory_store = MemoryStore()


class CodeSnippet(BaseModel):
    """代码片段模型"""
    title: str = Field(..., min_length=1, max_length=200, description="代码片段标题")
    code: str = Field(..., min_length=1, description="代码内容")
    language: str = Field(default="python", description="编程语言")
    description: Optional[str] = Field(default="", description="代码描述")
    tags: List[str] = Field(default=[], description="标签列表")
    source: Optional[str] = Field(default="", description="来源")
    dependencies: List[str] = Field(default=[], description="依赖项")


class CodeSnippetResponse(CodeSnippet):
    """代码片段响应模型"""
    id: str
    created_at: str
    updated_at: str
    similarity: Optional[float] = None


class SearchQuery(BaseModel):
    """搜索查询模型"""
    query: str = Field(..., min_length=1, description="搜索查询")
    language: Optional[str] = Field(default=None, description="语言过滤")
    tags: List[str] = Field(default=[], description="标签过滤")
    limit: int = Field(default=10, ge=1, le=50, description="返回数量限制")


class UpdateSnippet(BaseModel):
    """更新代码片段模型"""
    title: Optional[str] = None
    code: Optional[str] = None
    description: Optional[str] = None
    tags: Optional[List[str]] = None
    source: Optional[str] = None
    dependencies: Optional[List[str]] = None


@app.get("/")
async def root():
    """根路径 - 服务状态检查"""
    return {
        "service": "CodeMemory",
        "version": "1.0.0",
        "status": "running",
        "timestamp": datetime.now().isoformat()
    }


@app.get("/health")
async def health_check():
    """健康检查端点"""
    return {
        "status": "healthy",
        "memory_store": memory_store.is_ready(),
        "timestamp": datetime.now().isoformat()
    }


@app.post("/snippets", response_model=CodeSnippetResponse)
async def create_snippet(snippet: CodeSnippet):
    """
    创建新的代码片段
    
    - **title**: 代码片段标题
    - **code**: 代码内容
    - **language**: 编程语言 (默认: python)
    - **description**: 代码描述
    - **tags**: 标签列表
    - **source**: 来源
    - **dependencies**: 依赖项列表
    """
    try:
        result = memory_store.add_snippet(snippet.model_dump())
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"创建代码片段失败: {str(e)}")


@app.get("/snippets", response_model=List[CodeSnippetResponse])
async def list_snippets(
    language: Optional[str] = Query(None, description="按语言过滤"),
    tags: Optional[str] = Query(None, description="按标签过滤 (逗号分隔)"),
    limit: int = Query(50, ge=1, le=100, description="返回数量限制"),
    offset: int = Query(0, ge=0, description="偏移量")
):
    """获取代码片段列表"""
    try:
        tag_list = tags.split(",") if tags else []
        results = memory_store.list_snippets(
            language=language,
            tags=tag_list,
            limit=limit,
            offset=offset
        )
        return results
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"获取列表失败: {str(e)}")


@app.get("/snippets/{snippet_id}", response_model=CodeSnippetResponse)
async def get_snippet(snippet_id: str):
    """获取单个代码片段详情"""
    try:
        result = memory_store.get_snippet(snippet_id)
        if not result:
            raise HTTPException(status_code=404, detail="代码片段不存在")
        return result
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"获取代码片段失败: {str(e)}")


@app.put("/snippets/{snippet_id}", response_model=CodeSnippetResponse)
async def update_snippet(snippet_id: str, update_data: UpdateSnippet):
    """更新代码片段"""
    try:
        # 过滤掉None值
        update_dict = {k: v for k, v in update_data.model_dump().items() if v is not None}
        result = memory_store.update_snippet(snippet_id, update_dict)
        if not result:
            raise HTTPException(status_code=404, detail="代码片段不存在")
        return result
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"更新代码片段失败: {str(e)}")


@app.delete("/snippets/{snippet_id}")
async def delete_snippet(snippet_id: str):
    """删除代码片段"""
    try:
        success = memory_store.delete_snippet(snippet_id)
        if not success:
            raise HTTPException(status_code=404, detail="代码片段不存在")
        return {"message": "代码片段已删除", "id": snippet_id}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"删除代码片段失败: {str(e)}")


@app.post("/search", response_model=List[CodeSnippetResponse])
async def search_snippets(search_query: SearchQuery):
    """
    语义搜索代码片段
    
    - **query**: 搜索查询 (支持自然语言描述)
    - **language**: 语言过滤
    - **tags**: 标签过滤
    - **limit**: 返回数量限制
    """
    try:
        results = memory_store.search(
            query=search_query.query,
            language=search_query.language,
            tags=search_query.tags,
            limit=search_query.limit
        )
        return results
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"搜索失败: {str(e)}")


@app.get("/languages")
async def get_languages():
    """获取所有支持的编程语言列表"""
    try:
        languages = memory_store.get_languages()
        return {"languages": languages}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"获取语言列表失败: {str(e)}")


@app.get("/tags")
async def get_tags():
    """获取所有标签列表"""
    try:
        tags = memory_store.get_tags()
        return {"tags": tags}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"获取标签列表失败: {str(e)}")


@app.post("/import")
async def import_snippets(snippets: List[CodeSnippet]):
    """批量导入代码片段"""
    try:
        results = []
        for snippet in snippets:
            result = memory_store.add_snippet(snippet.model_dump())
            results.append(result)
        return {
            "message": f"成功导入 {len(results)} 个代码片段",
            "imported": len(results)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"导入失败: {str(e)}")


@app.post("/export")
async def export_snippets(
    language: Optional[str] = Query(None),
    tags: Optional[str] = Query(None)
):
    """导出代码片段"""
    try:
        tag_list = tags.split(",") if tags else []
        snippets = memory_store.list_snippets(language=language, tags=tag_list, limit=10000)
        return {
            "exported_at": datetime.now().isoformat(),
            "count": len(snippets),
            "snippets": snippets
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"导出失败: {str(e)}")


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
