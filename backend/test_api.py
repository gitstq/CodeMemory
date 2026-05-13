"""
CodeMemory API 测试
"""

import pytest
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)


def test_root():
    """测试根路径"""
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert data["service"] == "CodeMemory"
    assert "status" in data


def test_health_check():
    """测试健康检查"""
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"


def test_create_snippet():
    """测试创建代码片段"""
    snippet = {
        "title": "Hello World in Python",
        "code": "print('Hello, World!')",
        "language": "python",
        "description": "A simple hello world program",
        "tags": ["beginner", "hello-world"],
        "source": "tutorial"
    }
    response = client.post("/snippets", json=snippet)
    assert response.status_code == 200
    data = response.json()
    assert data["title"] == snippet["title"]
    assert data["language"] == snippet["language"]
    assert "id" in data
    return data["id"]


def test_get_snippet():
    """测试获取代码片段"""
    # 先创建一个
    snippet_id = test_create_snippet()
    
    response = client.get(f"/snippets/{snippet_id}")
    assert response.status_code == 200
    data = response.json()
    assert data["id"] == snippet_id


def test_list_snippets():
    """测试列出代码片段"""
    response = client.get("/snippets")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)


def test_search_snippets():
    """测试搜索代码片段"""
    # 先创建一个
    test_create_snippet()
    
    search_query = {
        "query": "hello world python",
        "limit": 5
    }
    response = client.post("/search", json=search_query)
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)


def test_update_snippet():
    """测试更新代码片段"""
    snippet_id = test_create_snippet()
    
    update_data = {
        "title": "Updated Title",
        "description": "Updated description"
    }
    response = client.put(f"/snippets/{snippet_id}", json=update_data)
    assert response.status_code == 200
    data = response.json()
    assert data["title"] == "Updated Title"


def test_delete_snippet():
    """测试删除代码片段"""
    snippet_id = test_create_snippet()
    
    response = client.delete(f"/snippets/{snippet_id}")
    assert response.status_code == 200
    
    # 确认已删除
    response = client.get(f"/snippets/{snippet_id}")
    assert response.status_code == 404


def test_get_languages():
    """测试获取语言列表"""
    response = client.get("/languages")
    assert response.status_code == 200
    data = response.json()
    assert "languages" in data


def test_get_tags():
    """测试获取标签列表"""
    response = client.get("/tags")
    assert response.status_code == 200
    data = response.json()
    assert "tags" in data


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
