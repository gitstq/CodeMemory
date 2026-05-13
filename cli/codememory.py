#!/usr/bin/env python3
"""
CodeMemory CLI - 智能代码片段记忆库命令行工具
"""

import click
import requests
import json
import os
from rich.console import Console
from rich.table import Table
from rich.panel import Panel
from rich.syntax import Syntax
from rich import box
import pyperclip
from typing import Optional

console = Console()

# 配置文件路径
CONFIG_DIR = os.path.expanduser("~/.codememory")
CONFIG_FILE = os.path.join(CONFIG_DIR, "config.json")

# 默认API地址
DEFAULT_API_URL = "http://localhost:8000"


def get_config() -> dict:
    """获取配置"""
    if os.path.exists(CONFIG_FILE):
        with open(CONFIG_FILE, 'r') as f:
            return json.load(f)
    return {"api_url": DEFAULT_API_URL}


def save_config(config: dict):
    """保存配置"""
    os.makedirs(CONFIG_DIR, exist_ok=True)
    with open(CONFIG_FILE, 'w') as f:
        json.dump(config, f, indent=2)


def get_api_url() -> str:
    """获取API地址"""
    config = get_config()
    return config.get("api_url", DEFAULT_API_URL)


def check_server() -> bool:
    """检查服务器是否运行"""
    try:
        response = requests.get(f"{get_api_url()}/health", timeout=5)
        return response.status_code == 200
    except requests.RequestException:
        return False


@click.group()
@click.version_option(version="1.0.0")
def cli():
    """
    🧠 CodeMemory - 智能代码片段记忆库
    
    一个支持语义搜索的代码片段管理工具
    """
    pass


@cli.command()
@click.option('--api-url', '-u', help='API服务器地址')
def config(api_url: Optional[str]):
    """配置CodeMemory"""
    cfg = get_config()
    
    if api_url:
        cfg['api_url'] = api_url
        save_config(cfg)
        console.print(f"✅ API地址已设置为: {api_url}")
    else:
        console.print(Panel(
            f"[bold]当前配置:[/bold]\n"
            f"API地址: {cfg.get('api_url', DEFAULT_API_URL)}",
            title="CodeMemory 配置",
            border_style="blue"
        ))


@cli.command()
@click.option('--title', '-t', required=True, help='代码片段标题')
@click.option('--code', '-c', required=True, help='代码内容')
@click.option('--language', '-l', default='python', help='编程语言')
@click.option('--description', '-d', default='', help='代码描述')
@click.option('--tags', '-g', help='标签 (逗号分隔)')
@click.option('--source', '-s', default='', help='来源')
@click.option('--file', '-f', type=click.File('r'), help='从文件读取代码')
def add(title: str, code: str, language: str, description: str, 
        tags: Optional[str], source: str, file):
    """添加新的代码片段"""
    if not check_server():
        console.print("❌ [red]错误: 无法连接到CodeMemory服务器[/red]")
        console.print(f"请确保服务器运行在 {get_api_url()}")
        return
    
    # 如果从文件读取
    if file:
        code = file.read()
    
    # 解析标签
    tag_list = [t.strip() for t in tags.split(',')] if tags else []
    
    snippet = {
        "title": title,
        "code": code,
        "language": language,
        "description": description,
        "tags": tag_list,
        "source": source
    }
    
    try:
        response = requests.post(
            f"{get_api_url()}/snippets",
            json=snippet
        )
        response.raise_for_status()
        data = response.json()
        
        console.print(Panel(
            f"[green]✅ 代码片段已添加![/green]\n\n"
            f"ID: [cyan]{data['id']}[/cyan]\n"
            f"标题: {data['title']}\n"
            f"语言: {data['language']}",
            title="成功",
            border_style="green"
        ))
    except requests.RequestException as e:
        console.print(f"❌ [red]添加失败: {e}[/red]")


@cli.command()
@click.argument('query')
@click.option('--language', '-l', help='按语言过滤')
@click.option('--tags', '-g', help='按标签过滤 (逗号分隔)')
@click.option('--limit', '-n', default=10, help='返回数量限制')
def search(query: str, language: Optional[str], tags: Optional[str], limit: int):
    """语义搜索代码片段"""
    if not check_server():
        console.print("❌ [red]错误: 无法连接到CodeMemory服务器[/red]")
        return
    
    tag_list = [t.strip() for t in tags.split(',')] if tags else []
    
    search_data = {
        "query": query,
        "language": language,
        "tags": tag_list,
        "limit": limit
    }
    
    try:
        response = requests.post(
            f"{get_api_url()}/search",
            json=search_data
        )
        response.raise_for_status()
        results = response.json()
        
        if not results:
            console.print("[yellow]未找到匹配的代码片段[/yellow]")
            return
        
        console.print(f"\n[bold]找到 {len(results)} 个结果:[/bold]\n")
        
        for i, snippet in enumerate(results, 1):
            similarity = snippet.get('similarity', 0)
            similarity_color = "green" if similarity > 0.8 else "yellow" if similarity > 0.5 else "red"
            
            # 代码语法高亮
            syntax = Syntax(
                snippet['code'],
                snippet['language'],
                theme="monokai",
                line_numbers=True
            )
            
            panel_content = (
                f"[bold]{snippet['title']}[/bold]\n"
                f"语言: {snippet['language']} | "
                f"相似度: [{similarity_color}]{similarity:.2%}[/{similarity_color}]\n"
            )
            if snippet.get('tags'):
                panel_content += f"标签: {', '.join(snippet['tags'])}\n"
            if snippet.get('description'):
                panel_content += f"描述: {snippet['description']}\n"
            
            panel_content += f"\nID: [cyan]{snippet['id']}[/cyan]"
            
            console.print(Panel(
                panel_content,
                box=box.ROUNDED,
                border_style="blue"
            ))
            console.print(syntax)
            console.print()
    
    except requests.RequestException as e:
        console.print(f"❌ [red]搜索失败: {e}[/red]")


@cli.command()
@click.option('--language', '-l', help='按语言过滤')
@click.option('--tags', '-g', help='按标签过滤 (逗号分隔)')
@click.option('--limit', '-n', default=20, help='返回数量限制')
def list(language: Optional[str], tags: Optional[str], limit: int):
    """列出所有代码片段"""
    if not check_server():
        console.print("❌ [red]错误: 无法连接到CodeMemory服务器[/red]")
        return
    
    tag_list = [t.strip() for t in tags.split(',')] if tags else []
    
    params = {"limit": limit}
    if language:
        params["language"] = language
    if tag_list:
        params["tags"] = ','.join(tag_list)
    
    try:
        response = requests.get(
            f"{get_api_url()}/snippets",
            params=params
        )
        response.raise_for_status()
        snippets = response.json()
        
        if not snippets:
            console.print("[yellow]暂无代码片段[/yellow]")
            return
        
        table = Table(
            title="代码片段列表",
            box=box.ROUNDED,
            show_header=True,
            header_style="bold magenta"
        )
        table.add_column("ID", style="cyan", width=18)
        table.add_column("标题", style="green")
        table.add_column("语言", style="yellow")
        table.add_column("标签", style="blue")
        table.add_column("创建时间", style="dim")
        
        for snippet in snippets:
            tags_str = ', '.join(snippet.get('tags', []))[:30]
            created = snippet.get('created_at', '')[:10]
            table.add_row(
                snippet['id'][:16],
                snippet['title'][:40],
                snippet['language'],
                tags_str,
                created
            )
        
        console.print(table)
        console.print(f"\n共 {len(snippets)} 个代码片段")
    
    except requests.RequestException as e:
        console.print(f"❌ [red]获取列表失败: {e}[/red]")


@cli.command()
@click.argument('snippet_id')
@click.option('--copy', '-c', is_flag=True, help='复制代码到剪贴板')
def show(snippet_id: str, copy: bool):
    """显示代码片段详情"""
    if not check_server():
        console.print("❌ [red]错误: 无法连接到CodeMemory服务器[/red]")
        return
    
    try:
        response = requests.get(f"{get_api_url()}/snippets/{snippet_id}")
        response.raise_for_status()
        snippet = response.json()
        
        # 代码语法高亮
        syntax = Syntax(
            snippet['code'],
            snippet['language'],
            theme="monokai",
            line_numbers=True
        )
        
        info = (
            f"[bold]标题:[/bold] {snippet['title']}\n"
            f"[bold]语言:[/bold] {snippet['language']}\n"
            f"[bold]ID:[/bold] {snippet['id']}\n"
        )
        if snippet.get('description'):
            info += f"[bold]描述:[/bold] {snippet['description']}\n"
        if snippet.get('tags'):
            info += f"[bold]标签:[/bold] {', '.join(snippet['tags'])}\n"
        if snippet.get('source'):
            info += f"[bold]来源:[/bold] {snippet['source']}\n"
        if snippet.get('dependencies'):
            info += f"[bold]依赖:[/bold] {', '.join(snippet['dependencies'])}\n"
        info += f"[bold]创建时间:[/bold] {snippet.get('created_at', 'N/A')}\n"
        info += f"[bold]更新时间:[/bold] {snippet.get('updated_at', 'N/A')}"
        
        console.print(Panel(info, title="代码片段信息", border_style="blue"))
        console.print(syntax)
        
        if copy:
            pyperclip.copy(snippet['code'])
            console.print("\n[green]✅ 代码已复制到剪贴板[/green]")
    
    except requests.RequestException as e:
        console.print(f"❌ [red]获取失败: {e}[/red]")


@cli.command()
@click.argument('snippet_id')
def delete(snippet_id: str):
    """删除代码片段"""
    if not check_server():
        console.print("❌ [red]错误: 无法连接到CodeMemory服务器[/red]")
        return
    
    if not click.confirm(f"确定要删除代码片段 {snippet_id} 吗?"):
        return
    
    try:
        response = requests.delete(f"{get_api_url()}/snippets/{snippet_id}")
        response.raise_for_status()
        console.print(f"[green]✅ 代码片段 {snippet_id} 已删除[/green]")
    except requests.RequestException as e:
        console.print(f"❌ [red]删除失败: {e}[/red]")


@cli.command()
def languages():
    """列出所有编程语言"""
    if not check_server():
        console.print("❌ [red]错误: 无法连接到CodeMemory服务器[/red]")
        return
    
    try:
        response = requests.get(f"{get_api_url()}/languages")
        response.raise_for_status()
        data = response.json()
        
        console.print("[bold]支持的编程语言:[/bold]\n")
        for lang in data.get('languages', []):
            console.print(f"  • {lang}")
    except requests.RequestException as e:
        console.print(f"❌ [red]获取失败: {e}[/red]")


@cli.command()
def tags():
    """列出所有标签"""
    if not check_server():
        console.print("❌ [red]错误: 无法连接到CodeMemory服务器[/red]")
        return
    
    try:
        response = requests.get(f"{get_api_url()}/tags")
        response.raise_for_status()
        data = response.json()
        
        console.print("[bold]所有标签:[/bold]\n")
        for tag in data.get('tags', []):
            console.print(f"  • {tag}")
    except requests.RequestException as e:
        console.print(f"❌ [red]获取失败: {e}[/red]")


@cli.command()
def status():
    """检查服务器状态"""
    api_url = get_api_url()
    
    console.print(f"[bold]API地址:[/bold] {api_url}")
    
    if check_server():
        try:
            response = requests.get(f"{api_url}/health")
            data = response.json()
            console.print("[green]✅ 服务器运行正常[/green]")
            console.print(f"内存存储: {'就绪' if data.get('memory_store') else '未就绪'}")
        except:
            console.print("[yellow]⚠️ 服务器响应异常[/yellow]")
    else:
        console.print("[red]❌ 服务器未运行[/red]")
        console.print(f"\n启动服务器:\n  cd backend && python main.py")


if __name__ == "__main__":
    cli()
