#!/bin/bash

# CodeMemory 启动脚本

echo "🧠 CodeMemory - 智能代码片段记忆库"
echo "=================================="

# 检查Python
if ! command -v python3 &> /dev/null; then
    echo "❌ 错误: 未找到 Python3"
    exit 1
fi

# 启动后端
echo ""
echo "📦 启动后端服务..."
cd backend

# 创建虚拟环境（如果不存在）
if [ ! -d "venv" ]; then
    echo "创建虚拟环境..."
    python3 -m venv venv
fi

# 激活虚拟环境
source venv/bin/activate

# 安装依赖
echo "安装后端依赖..."
pip install -q -r requirements.txt

# 启动后端（后台运行）
echo "启动后端服务 (http://localhost:8000)..."
python main.py &
BACKEND_PID=$!

cd ..

# 等待后端启动
sleep 3

# 检查后端是否启动成功
if ! curl -s http://localhost:8000/health > /dev/null; then
    echo "⚠️  后端服务启动可能需要更长时间，请稍后再试"
fi

echo ""
echo "✅ 后端服务已启动!"
echo ""
echo "🌐 API文档: http://localhost:8000/docs"
echo ""
echo "要启动前端，请运行:"
echo "  cd frontend && npm install && npm start"
echo ""
echo "按 Ctrl+C 停止服务"

# 等待用户中断
trap "kill $BACKEND_PID 2>/dev/null; exit" INT
wait $BACKEND_PID
