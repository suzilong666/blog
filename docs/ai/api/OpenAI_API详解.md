# OpenAI API 详解

## 概述

OpenAI API 提供了访问 GPT 系列模型的接口，是目前最流行的大语言模型 API。本章将详细介绍 Chat Completions API 的核心功能和使用技巧。

## Chat Completions API

### 基础用法

```python
from openai import OpenAI

client = OpenAI()

response = client.chat.completions.create(
    model="gpt-3.5-turbo",
    messages=[
        {"role": "system", "content": "你是一个有用的助手。"},
        {"role": "user", "content": "你好！"}
    ]
)

print(response.choices[0].message.content)
```

### 消息角色说明

| 角色 | 说明 | 用途 |
|------|------|------|
| `system` | 系统消息 | 设定 AI 的行为和角色 |
| `user` | 用户消息 | 用户的提问或指令 |
| `assistant` | 助手消息 | AI 的历史回复（用于多轮对话） |
| `tool` | 工具消息 | 函数调用的返回结果 |

### 多轮对话示例

```python
messages = [
    {"role": "system", "content": "你是一个专业的Python程序员。"},
    {"role": "user", "content": "如何创建一个列表？"},
    {"role": "assistant", "content": "在Python中，你可以使用方括号创建列表：my_list = [1, 2, 3]"},
    {"role": "user", "content": "那如何添加元素呢？"}
]

response = client.chat.completions.create(
    model="gpt-3.5-turbo",
    messages=messages
)
```

## 核心参数详解

### model（模型选择）

```python
# 常用模型对比
models = {
    "gpt-4o": "最新旗舰模型，速度快，性价比高",
    "gpt-4-turbo": "GPT-4 优化版，支持128K上下文",
    "gpt-4": "最强综合能力",
    "gpt-3.5-turbo": "快速且经济，适合大多数场景"
}
```

### temperature（温度）

控制输出的随机性和创造性。

```python
# 低温度 - 确定性高，适合事实性问题
response = client.chat.completions.create(
    model="gpt-3.5-turbo",
    messages=messages,
    temperature=0.2  # 范围: 0-2
)

# 高温度 - 创造性高，适合创意写作
response = client.chat.completions.create(
    model="gpt-3.5-turbo",
    messages=messages,
    temperature=0.9
)
```

**建议值：**
- 代码生成：0.1-0.3
- 数据分析：0.2-0.4
- 一般问答：0.5-0.7
- 创意写作：0.7-1.0

### max_tokens（最大令牌数）

限制输出长度。

```python
response = client.chat.completions.create(
    model="gpt-3.5-turbo",
    messages=messages,
    max_tokens=500  # 最多生成500个token
)
```

**注意：**
- 包括输入和输出的总 token 数不能超过模型上限
- GPT-3.5-turbo: 16,385 tokens
- GPT-4-turbo: 128,000 tokens

### top_p（核采样）

另一种控制多样性的方法，与 temperature 二选一使用。

```python
response = client.chat.completions.create(
    model="gpt-3.5-turbo",
    messages=messages,
    top_p=0.9  # 范围: 0-1
)
```

### presence_penalty & frequency_penalty

控制重复内容。

```python
response = client.chat.completions.create(
    model="gpt-3.5-turbo",
    messages=messages,
    presence_penalty=0.5,      # -2 到 2，鼓励谈论新话题
    frequency_penalty=0.5      # -2 到 2，减少重复用词
)
```

## 流式响应（Streaming）

实时获取生成的文本，提升用户体验。

### Python 实现

```python
from openai import OpenAI

client = OpenAI()

stream = client.chat.completions.create(
    model="gpt-3.5-turbo",
    messages=[
        {"role": "user", "content": "写一首关于春天的诗"}
    ],
    stream=True  # 启用流式响应
)

for chunk in stream:
    if chunk.choices[0].delta.content is not None:
        print(chunk.choices[0].delta.content, end="", flush=True)
```

### Node.js 实现

```javascript
import OpenAI from 'openai';

const openai = new OpenAI();

async function streamResponse() {
  const stream = await openai.chat.completions.create({
    model: 'gpt-3.5-turbo',
    messages: [{ role: 'user', content: '写一首关于春天的诗' }],
    stream: true
  });

  for await (const chunk of stream) {
    process.stdout.write(chunk.choices[0].delta.content || '');
  }
}

streamResponse();
```

### Web 前端展示

```javascript
async function chatWithStreaming(userMessage) {
  const response = await fetch('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message: userMessage })
  });

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  
  let aiResponse = '';
  
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    
    const chunk = decoder.decode(value);
    aiResponse += chunk;
    
    // 实时更新UI
    updateChatUI(aiResponse);
  }
}
```

## 函数调用（Function Calling）

让模型能够调用预定义的函数，实现与外部系统的交互。

### 定义函数

```python
functions = [
    {
        "name": "get_current_weather",
        "description": "获取指定城市的当前天气",
        "parameters": {
            "type": "object",
            "properties": {
                "location": {
                    "type": "string",
                    "description": "城市名称，如：北京、上海"
                },
                "unit": {
                    "type": "string",
                    "enum": ["celsius", "fahrenheit"],
                    "description": "温度单位"
                }
            },
            "required": ["location"]
        }
    }
]
```

### 完整流程

```python
import json

def get_current_weather(location, unit="celsius"):
    """模拟获取天气数据"""
    # 实际项目中调用天气API
    weather_data = {
        "location": location,
        "temperature": "22",
        "unit": unit,
        "forecast": ["晴朗", "微风"]
    }
    return json.dumps(weather_data)

# 第一步：让模型决定调用哪个函数
messages = [
    {"role": "user", "content": "北京今天的天气怎么样？"}
]

response = client.chat.completions.create(
    model="gpt-3.5-turbo",
    messages=messages,
    functions=functions,
    function_call="auto"  # 自动决定是否调用函数
)

message = response.choices[0].message

# 第二步：检查是否需要调用函数
if message.function_call:
    function_name = message.function_call.name
    function_args = json.loads(message.function_call.arguments)
    
    # 第三步：执行函数
    if function_name == "get_current_weather":
        function_response = get_current_weather(
            location=function_args.get("location"),
            unit=function_args.get("unit")
        )
    
    # 第四步：将函数结果返回给模型
    messages.append(message)
    messages.append({
        "role": "function",
        "name": function_name,
        "content": function_response
    })
    
    # 第五步：获取最终回答
    second_response = client.chat.completions.create(
        model="gpt-3.5-turbo",
        messages=messages
    )
    
    print(second_response.choices[0].message.content)
    # 输出：北京今天天气晴朗，气温22摄氏度，微风。
```

### 新版 Tools API（推荐）

OpenAI 推荐使用更新的 tools API：

```python
tools = [
    {
        "type": "function",
        "function": {
            "name": "get_current_weather",
            "description": "获取指定城市的当前天气",
            "parameters": {
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
    }
]

response = client.chat.completions.create(
    model="gpt-3.5-turbo",
    messages=messages,
    tools=tools,
    tool_choice="auto"
)

# 处理工具调用
tool_calls = response.choices[0].message.tool_calls
if tool_calls:
    for tool_call in tool_calls:
        function_name = tool_call.function.name
        function_args = json.loads(tool_call.function.arguments)
        # 执行函数...
```

## 实用示例

### 1. 文本分类

```python
def classify_sentiment(text):
    """情感分类"""
    response = client.chat.completions.create(
        model="gpt-3.5-turbo",
        messages=[
            {"role": "system", "content": "请将以下文本分类为正面、负面或中性。只输出类别。"},
            {"role": "user", "content": text}
        ],
        temperature=0
    )
    return response.choices[0].message.content.strip()

# 使用
print(classify_sentiment("这个产品太棒了！"))  # 输出：正面
```

### 2. 代码生成

```python
def generate_code(description, language="python"):
    """根据描述生成代码"""
    response = client.chat.completions.create(
        model="gpt-3.5-turbo",
        messages=[
            {"role": "system", "content": f"你是一个专业的{language}程序员。只输出代码，不要解释。"},
            {"role": "user", "content": description}
        ],
        temperature=0.2
    )
    return response.choices[0].message.content

# 使用
code = generate_code("创建一个函数，计算列表中所有偶数的和")
print(code)
```

### 3. 内容摘要

```python
def summarize_text(text, max_length=100):
    """生成文本摘要"""
    response = client.chat.completions.create(
        model="gpt-3.5-turbo",
        messages=[
            {"role": "system", "content": f"请用{max_length}字以内总结以下内容。"},
            {"role": "user", "content": text}
        ]
    )
    return response.choices[0].message.content
```

### 4. 翻译服务

```python
def translate_text(text, target_language="中文"):
    """翻译文本"""
    response = client.chat.completions.create(
        model="gpt-3.5-turbo",
        messages=[
            {"role": "system", "content": f"你是一个专业翻译。将以下内容翻译成{target_language}。"},
            {"role": "user", "content": text}
        ],
        temperature=0.3
    )
    return response.choices[0].message.content
```

## 错误处理

### 常见错误类型

```python
from openai import (
    OpenAIError,
    AuthenticationError,
    RateLimitError,
    APITimeoutError,
    BadRequestError
)

def safe_api_call(messages, max_retries=3):
    """安全的 API 调用"""
    for attempt in range(max_retries):
        try:
            response = client.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=messages,
                timeout=30  # 超时设置（秒）
            )
            return response
        
        except AuthenticationError:
            print("❌ API Key 无效")
            raise
        
        except RateLimitError:
            wait_time = 2 ** attempt
            print(f"⚠️  速率限制，等待 {wait_time} 秒...")
            time.sleep(wait_time)
        
        except APITimeoutError:
            print(f"⚠️  请求超时，重试 {attempt + 1}/{max_retries}")
            continue
        
        except BadRequestError as e:
            print(f"❌ 请求错误: {e}")
            raise
        
        except OpenAIError as e:
            print(f"❌ OpenAI 错误: {e}")
            if attempt == max_retries - 1:
                raise
            time.sleep(2 ** attempt)
```

## 成本优化

### Token 计数

```python
import tiktoken

def count_tokens(text, model="gpt-3.5-turbo"):
    """计算文本的 token 数量"""
    encoding = tiktoken.encoding_for_model(model)
    return len(encoding.encode(text))

# 使用
prompt = "你好，请介绍一下自己"
tokens = count_tokens(prompt)
print(f"Token 数量: {tokens}")
```

### 成本估算

```python
def estimate_cost(input_tokens, output_tokens, model="gpt-3.5-turbo"):
    """估算 API 调用成本（美元）"""
    pricing = {
        "gpt-3.5-turbo": {"input": 0.0005, "output": 0.0015},
        "gpt-4": {"input": 0.03, "output": 0.06},
        "gpt-4-turbo": {"input": 0.01, "output": 0.03}
    }
    
    prices = pricing.get(model, pricing["gpt-3.5-turbo"])
    cost = (input_tokens / 1000 * prices["input"]) + \
           (output_tokens / 1000 * prices["output"])
    
    return round(cost, 6)

# 使用
cost = estimate_cost(100, 200)
print(f"预计成本: ${cost}")  # $0.00035
```

### 优化策略

1. **选择合适的模型**
   - 简单任务用 gpt-3.5-turbo
   - 复杂推理用 gpt-4

2. **优化 Prompt**
   - 删除冗余信息
   - 使用简洁的表达

3. **设置合理的 max_tokens**
   - 避免生成过长的回答

4. **缓存结果**
   ```python
   import hashlib
   import json
   
   cache = {}
   
   def cached_chat(messages):
       """带缓存的聊天"""
       # 生成缓存键
       cache_key = hashlib.md5(json.dumps(messages).encode()).hexdigest()
       
       if cache_key in cache:
           return cache[cache_key]
       
       response = client.chat.completions.create(
           model="gpt-3.5-turbo",
           messages=messages
       )
       
       result = response.choices[0].message.content
       cache[cache_key] = result
       return result
   ```

## 最佳实践

### 1. System Prompt 设计

```python
# ✅ 好的 System Prompt
system_prompt = """你是一位专业的Python编程教师。
- 用简洁清晰的语言解释概念
- 提供可运行的代码示例
- 指出常见的错误和陷阱
- 鼓励学生思考"""

# ❌ 模糊的 System Prompt
system_prompt = "你是个助手"
```

### 2. 消息历史管理

```python
class ChatSession:
    """管理对话会话"""
    
    def __init__(self, system_prompt, max_history=10):
        self.messages = [{"role": "system", "content": system_prompt}]
        self.max_history = max_history
    
    def add_message(self, role, content):
        """添加消息"""
        self.messages.append({"role": role, "content": content})
        
        # 保持历史记录在合理范围内
        if len(self.messages) > self.max_history + 1:
            # 保留 system 消息和最近的对话
            self.messages = [self.messages[0]] + self.messages[-self.max_history:]
    
    def chat(self, user_input):
        """发送消息并获取回复"""
        self.add_message("user", user_input)
        
        response = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=self.messages
        )
        
        assistant_reply = response.choices[0].message.content
        self.add_message("assistant", assistant_reply)
        
        return assistant_reply

# 使用
session = ChatSession("你是一个友好的AI助手。")
reply = session.chat("你好！")
```

### 3. 结构化输出

```python
import json

def get_structured_response(prompt, output_format):
    """获取结构化输出"""
    response = client.chat.completions.create(
        model="gpt-3.5-turbo",
        messages=[
            {"role": "system", "content": f"请以JSON格式输出，格式如下：\n{output_format}"},
            {"role": "user", "content": prompt}
        ],
        temperature=0
    )
    
    try:
        return json.loads(response.choices[0].message.content)
    except json.JSONDecodeError:
        return None

# 使用
format_spec = """
{
    "name": "string",
    "age": "number",
    "skills": ["string"]
}
"""

result = get_structured_response(
    "分析一个典型的Python开发者",
    format_spec
)
```

## 小结

本章我们学习了：
- ✅ Chat Completions API 基础用法
- ✅ 核心参数的作用和调优技巧
- ✅ 流式响应的实现
- ✅ 函数调用和工具集成
- ✅ 错误处理和成本优化
- ✅ 最佳实践和设计模式

下一章我们将学习 **Claude API** 的使用方法和特点。

## 延伸阅读

- [OpenAI API 官方文档](https://platform.openai.com/docs/api-reference)
- [OpenAI Cookbook](https://cookbook.openai.com/)
- [tiktoken - Token 计数库](https://github.com/openai/tiktoken)
