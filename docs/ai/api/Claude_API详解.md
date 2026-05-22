# Claude API 详解

## 概述

Claude 是 Anthropic 公司开发的大语言模型系列，以安全性、长上下文处理和高质量的文本生成为特色。本章将详细介绍 Claude API 的使用方法。

## Messages API

### 基础用法

```python
from anthropic import Anthropic

client = Anthropic()

message = client.messages.create(
    model="claude-3-sonnet-20240229",
    max_tokens=1000,
    messages=[
        {"role": "user", "content": "你好，请介绍一下自己"}
    ]
)

print(message.content[0].text)
```

### 与 OpenAI API 的对比

| 特性 | OpenAI | Anthropic |
|------|--------|-----------|
| SDK | `openai` | `anthropic` |
| 端点 | `/chat/completions` | `/messages` |
| System Prompt | messages 中的 system 角色 | 独立的 system 参数 |
| 响应结构 | `choices[0].message.content` | `content[0].text` |
| 默认模型 | gpt-3.5-turbo | claude-3-sonnet |

## 核心参数

### model（模型选择）

```python
models = {
    "claude-3-opus-20240229": "最强能力，适合复杂任务",
    "claude-3-sonnet-20240229": "平衡速度与能力（推荐）",
    "claude-3-haiku-20240307": "最快最便宜，适合简单任务"
}
```

### max_tokens

```python
message = client.messages.create(
    model="claude-3-sonnet-20240229",
    max_tokens=4096,  # 最大输出长度
    messages=[...]
)
```

**注意：** Claude 的最大上下文为 200K tokens。

### system（系统提示）

```python
message = client.messages.create(
    model="claude-3-sonnet-20240229",
    max_tokens=1000,
    system="你是一个专业的Python程序员，擅长代码审查和优化。",
    messages=[
        {"role": "user", "content": "请 review 这段代码"}
    ]
)
```

### temperature

```python
message = client.messages.create(
    model="claude-3-sonnet-20240229",
    max_tokens=1000,
    temperature=0.7,  # 0-1，默认 1
    messages=[...]
)
```

## 多轮对话

```python
messages = [
    {"role": "user", "content": "什么是闭包？"},
    {"role": "assistant", "content": "闭包是一个函数..."},
    {"role": "user", "content": "能举个例子吗？"}
]

message = client.messages.create(
    model="claude-3-sonnet-20240229",
    max_tokens=1000,
    messages=messages
)
```

## 长上下文处理

Claude 支持高达 200K 的上下文窗口，可以处理：
- 整本书籍
- 大型代码库
- 长篇报告

### 处理长文档

```python
def analyze_document(document_text):
    """分析长文档"""
    message = client.messages.create(
        model="claude-3-sonnet-20240229",
        max_tokens=2000,
        system="你是一个专业的文档分析师。",
        messages=[
            {"role": "user", "content": f"""
            请分析以下文档，提取关键信息：
            
            {document_text[:150000]}  # 控制在限制内
            
            请提供：
            1. 主要内容摘要
            2. 关键观点
            3. 结论
            """}
        ]
    )
    
    return message.content[0].text
```

## 流式响应

```python
message_stream = client.messages.create(
    model="claude-3-sonnet-20240229",
    max_tokens=1000,
    messages=[
        {"role": "user", "content": "写一首诗"}
    ],
    stream=True
)

for chunk in message_stream:
    if chunk.type == "content_block_delta":
        print(chunk.delta.text, end="", flush=True)
```

## Tool Use（工具使用）

Claude 也支持函数调用功能。

### 定义工具

```python
tools = [
    {
        "name": "get_weather",
        "description": "获取天气信息",
        "input_schema": {
            "type": "object",
            "properties": {
                "location": {
                    "type": "string",
                    "description": "城市名称"
                }
            },
            "required": ["location"]
        }
    }
]
```

### 使用工具

```python
message = client.messages.create(
    model="claude-3-sonnet-20240229",
    max_tokens=1000,
    tools=tools,
    messages=[
        {"role": "user", "content": "北京的天气怎么样？"}
    ]
)

# 检查是否有工具调用
if message.stop_reason == "tool_use":
    tool_use = next(block for block in message.content if block.type == "tool_use")
    print(f"工具: {tool_use.name}")
    print(f"参数: {tool_use.input}")
```

## 定价对比

| 模型 | 输入价格 | 输出价格 | 上下文 |
|------|---------|---------|--------|
| Claude 3 Opus | $15/1M tokens | $75/1M tokens | 200K |
| Claude 3 Sonnet | $3/1M tokens | $15/1M tokens | 200K |
| Claude 3 Haiku | $0.25/1M tokens | $1.25/1M tokens | 200K |

**与 GPT 对比：**
- Claude 3 Sonnet ≈ GPT-3.5-turbo 价格，能力接近 GPT-4
- 长上下文处理更有优势

## 实战示例

### 1. 代码审查

```python
def review_code(code, language="python"):
    """代码审查"""
    message = client.messages.create(
        model="claude-3-sonnet-20240229",
        max_tokens=2000,
        system=f"""你是一位资深的{language}代码审查专家。
        请从以下角度审查代码：
        1. 代码质量和可读性
        2. 潜在bug
        3. 性能优化建议
        4. 安全性问题""",
        messages=[
            {"role": "user", "content": f"""
            请审查以下代码：
            
            ```{language}
            {code}
            ```
            """}
        ]
    )
    
    return message.content[0].text
```

### 2. 文档总结

```python
def summarize_long_text(text, max_length=500):
    """总结长文本"""
    message = client.messages.create(
        model="claude-3-haiku-20240307",  # 使用便宜的模型
        max_tokens=max_length,
        messages=[
            {"role": "user", "content": f"""
            请用{max_length}字以内总结以下内容：
            
            {text[:180000]}
            """}
        ]
    )
    
    return message.content[0].text
```

### 3. 数据提取

```python
import json

def extract_entities(text):
    """从文本中提取实体信息"""
    message = client.messages.create(
        model="claude-3-sonnet-20240229",
        max_tokens=1000,
        system="请以JSON格式输出提取的信息。",
        messages=[
            {"role": "user", "content": f"""
            从以下文本中提取人名、地点和组织：
            
            {text}
            
            输出格式：
            {{
                "people": [],
                "locations": [],
                "organizations": []
            }}
            """}
        ]
    )
    
    try:
        return json.loads(message.content[0].text)
    except:
        return None
```

## 最佳实践

### 1. 利用长上下文优势

```python
# ✅ 可以一次性处理大量信息
message = client.messages.create(
    model="claude-3-sonnet-20240229",
    max_tokens=2000,
    messages=[
        {"role": "user", "content": very_long_document}  # 可达 200K tokens
    ]
)

# ❌ OpenAI 可能需要分段处理
```

### 2. System Prompt 优化

```python
# ✅ 详细的系统提示
system_prompt = """你是一位经验丰富的技术作家。
你的写作风格：
- 清晰简洁
- 使用主动语态
- 避免行话，必要时解释术语
- 使用例子说明复杂概念"""

# ❌ 过于简单
system_prompt = "你是个作家"
```

### 3. 成本控制

```python
# 简单任务使用 Haiku
simple_task = client.messages.create(
    model="claude-3-haiku-20240307",
    max_tokens=500,
    messages=[...]
)

# 复杂任务使用 Sonnet/Opus
complex_task = client.messages.create(
    model="claude-3-sonnet-20240229",
    max_tokens=2000,
    messages=[...]
)
```

## 与 OpenAI 的选择建议

**选择 Claude 的场景：**
- 需要处理超长文档（>32K tokens）
- 重视安全性和内容过滤
- 需要高质量的文本生成
- 性价比考虑（Sonnet vs GPT-4）

**选择 OpenAI 的场景：**
- 需要最强的综合能力
- 依赖完善的生态系统
- 需要多模态能力
- 已有 OpenAI 基础设施

## 小结

本章我们学习了：
- ✅ Claude Messages API 基础用法
- ✅ 与 OpenAI API 的差异
- ✅ 长上下文处理技巧
- ✅ 工具使用方法
- ✅ 成本优化策略

下一章我们将学习 **LangChain 框架**，它将帮助我们更高效地构建 AI 应用。

## 延伸阅读

- [Anthropic API 文档](https://docs.anthropic.com/claude/reference)
- [Claude Prompt Engineering](https://docs.anthropic.com/claude/docs/intro-to-prompting)
