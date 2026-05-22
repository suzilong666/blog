# 智能 Agent 开发

## 什么是 Agent？

Agent（智能体）是一种能够自主感知环境、做出决策并执行行动的智能系统。与大语言模型不同，Agent 不仅仅是回答问题，而是能够主动完成任务。

### Agent vs LLM

| 特性 | LLM | Agent |
|------|-----|-------|
| 能力 | 文本生成 | 任务执行 |
| 交互 | 被动响应 | 主动规划 |
| 工具 | 无 | 可使用外部工具 |
| 记忆 | 有限上下文 | 长期记忆 |
| 目标 | 完成对话 | 达成目标 |

### Agent 的核心能力

1. **规划（Planning）**：分解复杂任务
2. **记忆（Memory）**：存储和检索信息
3. **工具使用（Tool Use）**：调用外部 API
4. **反思（Reflection）**：评估和改进

## ReAct 框架

ReAct（Reasoning + Acting）是最经典的 Agent 架构，结合了推理和行动。

### 工作流程

```
用户输入
    ↓
┌─────────────┐
│   Thought    │  ← 思考下一步做什么
└─────────────┘
    ↓
┌─────────────┐
│   Action     │  ← 选择工具并执行
└─────────────┘
    ↓
┌─────────────┐
│ Observation  │  ← 观察工具返回结果
└─────────────┘
    ↓
循环直到完成任务
    ↓
┌─────────────┐
│ Final Answer │  ← 输出最终答案
└─────────────┘
```

### 示例对话

```
Question: 北京今天的气温是多少？比上海高还是低？

Thought: 我需要查询北京和上海的天气信息。首先查询北京的天气。
Action: get_weather
Action Input: {"location": "北京"}
Observation: 北京今天气温 25°C

Thought: 现在我需要查询上海的天气来进行比较。
Action: get_weather
Action Input: {"location": "上海"}
Observation: 上海今天气温 28°C

Thought: 北京 25°C，上海 28°C，北京比上海低 3°C。
Final Answer: 北京今天气温 25°C，比上海（28°C）低 3°C。
```

## LangChain Agent 实现

### 基础 Agent

```python
from langchain.agents import initialize_agent, AgentType, Tool
from langchain.chat_models import ChatOpenAI

# 定义工具
def search_wikipedia(query):
    """搜索维基百科"""
    from wikipedia import summary
    try:
        return summary(query, sentences=2)
    except:
        return "未找到相关信息"

def calculate(expression):
    """数学计算"""
    try:
        return str(eval(expression))
    except:
        return "计算错误"

tools = [
    Tool(
        name="Wikipedia",
        func=search_wikipedia,
        description="用于查找事实信息，如人物、地点、事件等"
    ),
    Tool(
        name="Calculator",
        func=calculate,
        description="用于数学计算，接受数学表达式"
    )
]

# 初始化 Agent
llm = ChatOpenAI(model="gpt-3.5-turbo", temperature=0)

agent = initialize_agent(
    tools=tools,
    llm=llm,
    agent=AgentType.ZERO_SHOT_REACT_DESCRIPTION,
    verbose=True  # 显示思考过程
)

# 使用
result = agent.run("爱因斯坦是哪一年出生的？到2024年多少年了？")
print(result)
```

**输出：**
```
> Entering new AgentExecutor chain...
I need to find Einstein's birth year and calculate the difference.
Action: Wikipedia
Action Input: "Albert Einstein birth"
Observation: Albert Einstein was born on March 14, 1879.
Thought: Now I need to calculate how many years from 1879 to 2024.
Action: Calculator
Action Input: 2024 - 1879
Observation: 145
Thought: I now know the final answer.
Final Answer: 爱因斯坦出生于1879年，到2024年已经145年了。
> Finished chain.
```

### 使用内置工具

```python
from langchain.agents import load_tools, initialize_agent

# 加载内置工具
tools = load_tools(
    ["serpapi", "llm-math"],
    llm=llm
)

# SerpAPI 需要设置环境变量
# export SERPAPI_API_KEY=your-key

agent = initialize_agent(
    tools,
    llm,
    agent=AgentType.ZERO_SHOT_REACT_DESCRIPTION,
    verbose=True
)

# 可以搜索实时信息
result = agent.run("今天的美元兑人民币汇率是多少？")
```

## 自定义工具开发

### 装饰器方式

```python
from langchain.tools import tool

@tool
def get_stock_price(symbol: str) -> str:
    """获取股票价格
    
    Args:
        symbol: 股票代码，如 AAPL、GOOGL
        
    Returns:
        当前股票价格
    """
    import yfinance as yf
    stock = yf.Ticker(symbol)
    price = stock.history(period="1d")['Close'].iloc[-1]
    return f"{symbol} 当前价格: ${price:.2f}"

@tool
def send_email(to: str, subject: str, body: str) -> str:
    """发送邮件
    
    Args:
        to: 收件人邮箱
        subject: 邮件主题
        body: 邮件内容
        
    Returns:
        发送状态
    """
    import smtplib
    from email.mime.text import MIMEText
    
    # 实际项目中配置 SMTP
    msg = MIMEText(body)
    msg['Subject'] = subject
    msg['From'] = 'sender@example.com'
    msg['To'] = to
    
    # 发送邮件逻辑...
    return f"邮件已发送至 {to}"

# 使用
agent = initialize_agent(
    [get_stock_price, send_email],
    llm,
    agent=AgentType.ZERO_SHOT_REACT_DESCRIPTION
)
```

### 类方式

```python
from langchain.tools import BaseTool

class WeatherTool(BaseTool):
    name = "weather"
    description = "获取指定城市的天气信息"
    
    def _run(self, city: str) -> str:
        """同步执行"""
        import requests
        
        api_key = "your-api-key"
        url = f"http://api.openweathermap.org/data/2.5/weather"
        params = {
            "q": city,
            "appid": api_key,
            "units": "metric",
            "lang": "zh_cn"
        }
        
        response = requests.get(url, params=params)
        data = response.json()
        
        if response.status_code == 200:
            temp = data['main']['temp']
            desc = data['weather'][0]['description']
            return f"{city} 今天{desc}，气温 {temp}°C"
        else:
            return f"无法获取 {city} 的天气信息"
    
    async def _arun(self, city: str) -> str:
        """异步执行（可选）"""
        return self._run(city)

# 使用
weather_tool = WeatherTool()
agent = initialize_agent([weather_tool], llm)
```

## 多步任务规划

### Task Decomposition

```python
from langchain.chains import LLMMathChain
from langchain.agents import Tool

# 创建复杂的分析任务
def analyze_sales_data(query):
    """分析销售数据"""
    # 模拟数据分析
    return "2024年Q1销售额增长15%"

tools = [
    Tool(
        name="SalesAnalyzer",
        func=analyze_sales_data,
        description="分析销售数据，接受自然语言查询"
    ),
    Tool(
        name="EmailSender",
        func=send_email,
        description="发送邮件报告"
    )
]

# Agent 会自动分解任务
agent = initialize_agent(tools, llm, verbose=True)

result = agent.run("""
分析2024年Q1的销售数据，
如果增长率超过10%，就发送邮件给 manager@company.com，
主题是"Q1业绩优秀"，内容包含增长率。
""")
```

**Agent 执行流程：**
```
Thought: 我需要先分析销售数据
Action: SalesAnalyzer
Action Input: "2024年Q1销售数据"
Observation: 2024年Q1销售额增长15%
Thought: 增长率15%超过10%，需要发送邮件
Action: EmailSender
Action Input: {"to": "manager@company.com", "subject": "Q1业绩优秀", "body": "2024年Q1销售额增长15%"}
Observation: 邮件已发送至 manager@company.com
Thought: 任务完成
Final Answer: 已完成分析和邮件发送。Q1增长率15%，邮件已发送给经理。
```

## Memory 增强

### 带记忆的 Agent

```python
from langchain.memory import ConversationBufferMemory
from langchain.agents import initialize_agent, AgentType

memory = ConversationBufferMemory(
    memory_key="chat_history",
    return_messages=True
)

agent = initialize_agent(
    tools=tools,
    llm=llm,
    agent=AgentType.CONVERSATIONAL_REACT_DESCRIPTION,
    memory=memory,
    verbose=True
)

# 多轮对话
agent.run("帮我查一下苹果公司的股价")
# ... 获取股价 ...

agent.run("把这个信息发给 john@example.com")
# Agent 能理解"这个信息"指的是之前的股价
```

## React Agent（新版）

LangChain 推荐使用新的 create_react_agent API：

```python
from langchain import hub
from langchain.agents import create_react_agent, AgentExecutor
from langchain.tools import tool

# 获取 ReAct prompt
prompt = hub.pull("hwchase17/react")

# 定义工具
@tool
def search(query: str) -> str:
    """Search for information online."""
    # 实现搜索逻辑
    return "搜索结果..."

tools = [search]

# 创建 Agent
agent = create_react_agent(llm, tools, prompt)

# 创建执行器
agent_executor = AgentExecutor(
    agent=agent,
    tools=tools,
    verbose=True,
    handle_parsing_errors=True
)

# 执行
result = agent_executor.invoke({
    "input": "查找最新的AI新闻"
})

print(result["output"])
```

## 高级 Agent 模式

### 1. Plan-and-Execute

先制定计划，再逐步执行。

```python
from langchain_experimental.plan_and_execute import (
    PlanAndExecute,
    load_chat_planner,
    load_agent_executor
)

planner = load_chat_planner(llm)
executor = load_agent_executor(llm, tools, verbose=True)

agent = PlanAndExecute(
    planner=planner,
    executor=executor,
    verbose=True
)

result = agent.run("研究人工智能在医疗领域的应用，写一份报告")
```

### 2. Self-Ask with Search

```python
from langchain.agents import SelfAskWithSearchChain
from langchain.utilities import SerpAPIWrapper

search = SerpAPIWrapper()

chain = SelfAskWithSearchChain.from_llm(
    llm=llm,
    search_chain=search,
    verbose=True
)

result = chain.run("谁是现任联合国秘书长？他来自哪个国家？")
```

### 3. Multi-Agent 系统

```python
from langgraph.prebuilt import create_react_agent
from langgraph.graph import StateGraph, END

# 定义多个专业 Agent
researcher = create_react_agent(llm, research_tools)
writer = create_react_agent(llm, writing_tools)
reviewer = create_react_agent(llm, review_tools)

# 构建工作流
workflow = StateGraph()

workflow.add_node("research", researcher)
workflow.add_node("write", writer)
workflow.add_node("review", reviewer)

workflow.set_entry_point("research")
workflow.add_edge("research", "write")
workflow.add_edge("write", "review")
workflow.add_edge("review", END)

app = workflow.compile()

# 执行
result = app.invoke({"messages": ["写一篇关于量子计算的科普文章"]})
```

## 实战案例：研究助手 Agent

```python
from langchain.agents import Tool, AgentExecutor, create_react_agent
from langchain import hub
from langchain.chat_models import ChatOpenAI
from langchain.memory import ConversationBufferMemory
import requests
import json

class ResearchAssistant:
    """研究助手 Agent"""
    
    def __init__(self):
        self.llm = ChatOpenAI(
            model="gpt-4",
            temperature=0.3
        )
        
        # 定义工具
        self.tools = self._create_tools()
        
        # 创建 Agent
        prompt = hub.pull("hwchase17/react")
        agent = create_react_agent(self.llm, self.tools, prompt)
        
        self.agent_executor = AgentExecutor(
            agent=agent,
            tools=self.tools,
            verbose=True,
            max_iterations=10,
            handle_parsing_errors=True
        )
    
    def _create_tools(self):
        """创建研究工具集"""
        
        def web_search(query):
            """网络搜索"""
            # 使用 SerpAPI 或其他搜索服务
            api_key = "your-serpapi-key"
            url = "https://serpapi.com/search"
            params = {"q": query, "api_key": api_key}
            
            response = requests.get(url, params=params)
            results = response.json()
            
            snippets = [r.get('snippet', '') for r in results.get('organic_results', [])[:5]]
            return "\n\n".join(snippets)
        
        def save_notes(content):
            """保存研究笔记"""
            with open("research_notes.md", "a", encoding="utf-8") as f:
                f.write(f"\n\n## {datetime.now()}\n\n{content}\n")
            return "笔记已保存"
        
        def summarize_text(text):
            """总结文本"""
            prompt = f"请总结以下内容，提取关键点：\n\n{text}\n\n总结："
            response = self.llm.invoke(prompt)
            return response.content
        
        return [
            Tool(
                name="WebSearch",
                func=web_search,
                description="搜索网络信息，获取最新资料"
            ),
            Tool(
                name="SaveNotes",
                func=save_notes,
                description="保存研究笔记和内容"
            ),
            Tool(
                name="Summarize",
                func=summarize_text,
                description="总结长文本，提取关键信息"
            )
        ]
    
    def research(self, topic):
        """执行研究任务"""
        prompt = f"""
        请深入研究以下主题：{topic}

        研究步骤：
        1. 搜索相关的最新信息
        2. 收集关键事实和观点
        3. 整理成结构化的报告
        4. 保存重要发现

        要求：
        - 提供具体的数据和引用
        - 标注信息来源
        - 给出结论和建议
        """
        
        result = self.agent_executor.invoke({"input": prompt})
        return result["output"]

# 使用
assistant = ResearchAssistant()
report = assistant.research("人工智能在教育领域的最新应用")
print(report)
```

## Agent 调试技巧

### 1. 启用详细日志

```python
import langchain
langchain.debug = True

# 或使用 verbose 参数
agent = initialize_agent(..., verbose=True)
```

### 2. 中间步骤检查

```python
for step in agent_executor.iterate({"input": "query"}):
    print(step)
```

### 3. 错误处理

```python
agent_executor = AgentExecutor(
    agent=agent,
    tools=tools,
    handle_parsing_errors=True,  # 自动处理解析错误
    max_iterations=5,  # 限制最大迭代次数
    early_stopping_method="generate"  # 超时后生成答案
)
```

## 最佳实践

### 1. 工具设计原则

```python
# ✅ 好的工具设计
@tool
def get_weather(city: str) -> str:
    """获取城市天气
    
    Args:
        city: 城市名称（中文或英文）
        
    Returns:
        天气描述和温度
    """
    # 清晰的文档字符串
    # 明确的输入输出
    # 错误处理
    pass

# ❌ 糟糕的工具设计
@tool
def weather(x):
    """天气"""
    pass
```

### 2. Prompt 优化

```python
# 为 Agent 提供清晰的指导
system_prompt = """你是一个专业的研究助手。

可用工具：
- WebSearch: 搜索最新信息
- Summarize: 总结长文本
- SaveNotes: 保存重要发现

工作流程：
1. 理解用户需求
2. 制定研究计划
3. 使用工具收集信息
4. 整合和分析
5. 给出结构化回答

注意事项：
- 始终标注信息来源
- 保持客观中立
- 不确定时明确说明"""
```

### 3. 成本控制

```python
# 限制 token 使用
agent_executor = AgentExecutor(
    agent=agent,
    tools=tools,
    max_iterations=5,  # 限制循环次数
    max_execution_time=60  # 限制执行时间（秒）
)
```

## 小结

本章我们学习了：
- ✅ Agent 的概念和核心能力
- ✅ ReAct 框架原理
- ✅ LangChain Agent 实现
- ✅ 自定义工具开发
- ✅ 多步任务规划
- ✅ 高级 Agent 模式

下一章我们将学习**多模态应用**开发。

## 延伸阅读

- [LangChain Agents 文档](https://python.langchain.com/docs/modules/agents/)
- [ReAct Paper](https://arxiv.org/abs/2210.03629)
- [LangGraph - 复杂 Agent 工作流](https://langchain-ai.github.io/langgraph/)
