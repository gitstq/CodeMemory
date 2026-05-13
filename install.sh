#!/bin/bash

# CodeMemory 安装脚本

echo "🧠 CodeMemory - 安装脚本"
echo "========================"

# 检查Python
if ! command -v python3 &> /dev/null; then
    echo "❌ 错误: 需要 Python 3.8+"
    exit 1
fi

PYTHON_VERSION=$(python3 --version 2>&1 | awk '{print $2}')
echo "✓ Python版本: $PYTHON_VERSION"

# 安装后端
echo ""
echo "📦 安装后端依赖..."
cd backend

# 创建虚拟环境
if [ ! -d "venv" ]; then
    python3 -m venv venv
fi

source venv/bin/activate
pip install --upgrade pip
pip install -r requirements.txt

cd ..

# 检查Node.js
if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version)
    echo ""
    echo "✓ Node.js版本: $NODE_VERSION"
    
    # 安装前端依赖
    echo ""
    echo "📦 安装前端依赖..."
    cd frontend
    npm install
    cd ..
else
    echo ""
    echo "⚠️  未找到 Node.js，跳过前端安装"
    echo "   如需使用前端界面，请安装 Node.js 18+"
fi

echo ""
echo "✅ 安装完成!"
echo ""
echo "启动服务:"
echo "  ./start.sh"
echo ""
echo "或使用 CLI:"
echo "  cd cli && pip install -e ."
echo "  codememory --help"
