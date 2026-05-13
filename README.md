# 🧠 CodeMemory

<div align="center">

[![Python](https://img.shields.io/badge/Python-3.8+-blue.svg)](https://python.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.109+-green.svg)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/React-18+-61DAFB.svg)](https://reactjs.org)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

**智能代码片段记忆库 - 支持语义搜索的代码管理工具**

[简体中文](#简体中文) | [繁體中文](#繁體中文) | [English](#english)

</div>

---

## 简体中文

### 🎉 项目介绍

CodeMemory 是一个面向开发者的**智能代码片段管理与记忆工具**，灵感来源于 AI Agent 的持久化内存概念。它能够理解代码的语义含义，让您可以用自然语言描述来搜索代码片段，而不仅仅依赖关键词匹配。

**核心痛点解决**：
- ❌ 传统代码片段工具只能通过关键词搜索
- ❌ 忘记代码片段的具体命名或标签
- ❌ 代码分散在各个项目和文件中难以统一管理
- ✅ CodeMemory 支持**语义搜索**，用自然语言描述即可找到相关代码

**自研差异化亮点**：
- 🧠 基于 sentence-transformers 的代码语义理解
- 🔍 支持自然语言描述的语义搜索
- 🏷️ 智能标签推荐与依赖关系追踪
- 🎨 现代化的 React 前端界面
- 💻 便捷的 CLI 命令行工具
- 🔒 本地优先，数据隐私保护

### ✨ 核心特性

| 特性 | 描述 |
|------|------|
| 🧠 **语义搜索** | 使用自然语言描述搜索代码，如"Python 快速排序算法" |
| 🏷️ **智能标签** | 自动推荐标签，支持多维度过滤 |
| 🔗 **依赖追踪** | 记录代码片段的依赖关系 |
| 🎨 **现代界面** | 基于 React 的响应式 Web 界面 |
| 💻 **CLI 工具** | 命令行快速操作，支持代码复制 |
| 🗄️ **本地存储** | 使用 ChromaDB 本地向量数据库 |
| 📱 **跨平台** | 支持 Windows、macOS、Linux |

### 🚀 快速开始

#### 环境要求

- Python 3.8+
- Node.js 18+ (可选，用于前端)
- 4GB+ RAM (用于运行嵌入模型)

#### 安装步骤

```bash
# 克隆仓库
git clone https://github.com/gitstq/CodeMemory.git
cd CodeMemory

# 运行安装脚本
chmod +x install.sh
./install.sh
```

#### 启动服务

```bash
# 一键启动后端服务
chmod +x start.sh
./start.sh
```

服务启动后：
- API 服务: http://localhost:8000
- API 文档: http://localhost:8000/docs

#### 启动前端（可选）

```bash
cd frontend
npm install
npm start
```

前端将运行在 http://localhost:3000

### 📖 详细使用指南

#### CLI 命令行工具

```bash
cd cli
pip install -r requirements.txt

# 查看帮助
python codememory.py --help

# 添加代码片段
python codememory.py add \
  --title "Python 快速排序" \
  --code "def quicksort(arr):..." \
  --language python \
  --tags "algorithm,sorting"

# 语义搜索
python codememory.py search "排序算法"

# 列出所有片段
python codememory.py list

# 查看详情
python codememory.py show <snippet_id>
```

#### API 使用示例

```python
import requests

# 添加代码片段
response = requests.post("http://localhost:8000/snippets", json={
    "title": "Hello World",
    "code": "print('Hello, World!')",
    "language": "python",
    "tags": ["beginner"]
})

# 语义搜索
response = requests.post("http://localhost:8000/search", json={
    "query": "输出问候语的代码",
    "limit": 5
})
```

### 💡 设计思路与迭代规划

**技术选型原因**：
- **FastAPI**: 高性能异步框架，自动生成 API 文档
- **ChromaDB**: 轻量级本地向量数据库，无需外部依赖
- **sentence-transformers**: 开源嵌入模型，支持离线使用
- **React**: 组件化开发，丰富的生态系统

**后续功能迭代计划**：
- [ ] VS Code 插件
- [ ] Vim/Neovim 插件
- [ ] 代码片段导入导出 (JSON/Markdown)
- [ ] 团队协作功能
- [ ] 云端同步选项
- [ ] AI 代码解释生成

### 📦 打包与部署

#### Docker 部署（计划中）

```bash
docker build -t codememory .
docker run -p 8000:8000 codememory
```

#### 手动部署

```bash
# 后端
cd backend
pip install -r requirements.txt
python main.py

# 前端
cd frontend
npm install
npm run build
# 部署 build 目录到静态服务器
```

### 🤝 贡献指南

欢迎提交 Issue 和 PR！

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 创建 Pull Request

### 📄 开源协议

本项目采用 [MIT](LICENSE) 协议开源。

---

## 繁體中文

### 🎉 專案介紹

CodeMemory 是一個面向開發者的**智慧程式碼片段管理與記憶工具**，靈感來源於 AI Agent 的持久化記憶概念。它能夠理解程式碼的語義含義，讓您可以用自然語言描述來搜尋程式碼片段。

**核心痛點解決**：
- ❌ 傳統程式碼片段工具只能通過關鍵詞搜尋
- ❌ 忘記程式碼片段的具體命名或標籤
- ✅ CodeMemory 支援**語義搜尋**，用自然語言描述即可找到相關程式碼

**自研差異化亮點**：
- 🧠 基於 sentence-transformers 的程式碼語義理解
- 🔍 支援自然語言描述的語義搜尋
- 🏷️ 智慧標籤推薦與依賴關係追蹤
- 🎨 現代化的 React 前端介面
- 💻 便捷的 CLI 命令列工具

### ✨ 核心特性

| 特性 | 描述 |
|------|------|
| 🧠 **語義搜尋** | 使用自然語言描述搜尋程式碼 |
| 🏷️ **智慧標籤** | 自動推薦標籤，支援多維度過濾 |
| 🔗 **依賴追蹤** | 記錄程式碼片段的依賴關係 |
| 🎨 **現代介面** | 基於 React 的響應式 Web 介面 |
| 💻 **CLI 工具** | 命令列快速操作 |
| 🗄️ **本地儲存** | 使用 ChromaDB 本地向量資料庫 |

### 🚀 快速開始

```bash
# 克隆倉庫
git clone https://github.com/gitstq/CodeMemory.git
cd CodeMemory

# 安裝
chmod +x install.sh
./install.sh

# 啟動
chmod +x start.sh
./start.sh
```

### 📖 使用指南

#### CLI 工具

```bash
cd cli

# 添加程式碼片段
python codememory.py add \
  --title "Python 快速排序" \
  --code "def quicksort(arr):..." \
  --language python

# 語義搜尋
python codememory.py search "排序算法"
```

### 📄 開源協議

[MIT](LICENSE)

---

## English

### 🎉 Introduction

CodeMemory is an **intelligent code snippet management and memory tool** for developers, inspired by AI Agent persistent memory concepts. It understands the semantic meaning of code, allowing you to search code snippets using natural language descriptions rather than just keywords.

**Problem Solved**:
- ❌ Traditional tools only support keyword search
- ❌ Forget the exact name or tags of code snippets
- ✅ CodeMemory supports **semantic search** using natural language

**Key Differentiators**:
- 🧠 Code semantic understanding via sentence-transformers
- 🔍 Natural language semantic search
- 🏷️ Smart tag recommendations and dependency tracking
- 🎨 Modern React frontend interface
- 💻 Convenient CLI tool
- 🔒 Local-first, privacy-focused

### ✨ Features

| Feature | Description |
|---------|-------------|
| 🧠 **Semantic Search** | Search code using natural language descriptions |
| 🏷️ **Smart Tags** | Auto-recommend tags with multi-dimensional filtering |
| 🔗 **Dependency Tracking** | Track dependencies between code snippets |
| 🎨 **Modern UI** | Responsive React-based web interface |
| 💻 **CLI Tool** | Command-line interface for quick operations |
| 🗄️ **Local Storage** | Uses ChromaDB local vector database |
| 📱 **Cross-Platform** | Supports Windows, macOS, Linux |

### 🚀 Quick Start

#### Requirements

- Python 3.8+
- Node.js 18+ (optional, for frontend)
- 4GB+ RAM (for embedding model)

#### Installation

```bash
# Clone repository
git clone https://github.com/gitstq/CodeMemory.git
cd CodeMemory

# Run install script
chmod +x install.sh
./install.sh
```

#### Start Services

```bash
# Start backend
chmod +x start.sh
./start.sh
```

Services:
- API: http://localhost:8000
- Docs: http://localhost:8000/docs

#### Start Frontend (Optional)

```bash
cd frontend
npm install
npm start
```

Frontend runs at http://localhost:3000

### 📖 Usage Guide

#### CLI Tool

```bash
cd cli
pip install -r requirements.txt

# Add snippet
python codememory.py add \
  --title "Python Quicksort" \
  --code "def quicksort(arr):..." \
  --language python \
  --tags "algorithm,sorting"

# Semantic search
python codememory.py search "sorting algorithm"

# List all snippets
python codememory.py list

# Show details
python codememory.py show <snippet_id>
```

#### API Examples

```python
import requests

# Add snippet
response = requests.post("http://localhost:8000/snippets", json={
    "title": "Hello World",
    "code": "print('Hello, World!')",
    "language": "python",
    "tags": ["beginner"]
})

# Semantic search
response = requests.post("http://localhost:8000/search", json={
    "query": "code that prints greeting",
    "limit": 5
})
```

### 💡 Design & Roadmap

**Tech Stack**:
- **FastAPI**: High-performance async framework
- **ChromaDB**: Lightweight local vector database
- **sentence-transformers**: Open-source embedding model
- **React**: Component-based development

**Roadmap**:
- [ ] VS Code extension
- [ ] Vim/Neovim plugin
- [ ] Import/Export (JSON/Markdown)
- [ ] Team collaboration
- [ ] Cloud sync option
- [ ] AI code explanation

### 🤝 Contributing

Contributions are welcome!

1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

### 📄 License

This project is licensed under the [MIT](LICENSE) License.

---

<div align="center">

**Made with ❤️ by developers, for developers**

[GitHub](https://github.com/gitstq/CodeMemory) · [Issues](https://github.com/gitstq/CodeMemory/issues) · [Discussions](https://github.com/gitstq/CodeMemory/discussions)

</div>
