# LangChain 框架入门

## 什么是 LangChain？

LangChain 是一个用于开发大语言模型应用的开源框架，提供了标准化的接口和组件，让开发者能够快速构建复杂的 AI 应用。

### 核心价值

- **组件化**：将 AI 应用拆分为可复用的组件
- **链式调用**：通过链条组合多个组件
- **Agent 系统**：实现自主决策和执行
- **记忆管理**：维护对话历史和上下文

## 安装

```bash
pip install langchain langchain-openai langchain-community
```

## 核心概念

### 1. Models（模型）

LangChain 支持多种模型提供商的统一接口。

```python
from langchain_openai import ChatOpenAI

# 初始化模型
llm = ChatOpenAI(
    model="gpt-3.5-turbo",
    temperature=0.7
)

# 调用模型
response = llm.invoke("你好！")
print(response.content)
```

### 2. Prompts（提示模板）

```python
from langchain_core.prompts import ChatPromptTemplate

# 创建提示模板
prompt = ChatPromptTemplate.from_messages([
    ("system", "你是一个{role}，擅长{skill}。"),
    ("user", "{question}")
])

# 格式化提示
formatted = prompt.format_messages(
    role="Python程序员",
    skill="代码优化",
    question="如何优化这段代码？"
)

# 使用
response = llm.invoke(formatted)
```

### 3. Chains（链）

链是 LangChain 的核心概念，用于组合多个组件。

#### 简单链

```python
from langchain_core.output_parsers import StrOutputParser

# 构建链
chain = prompt | llm | StrOutputParser()

# 执行
result = chain.invoke({
    "role": "技术作家",
    "skill": "解释复杂概念",
    "question": "什么是区块链？"
})

print(result)
```

#### 顺序链

```python
from langchain.chains import SequentialChain
from langchain_core.prompts import PromptTemplate

# 第一个链：生成大纲
outline_prompt = PromptTemplate.from_template(
    "为以下主题生成一个详细大纲：{topic}"
)
outline_chain = outline_prompt | llm | StrOutputParser()

# 第二个链：根据大纲写内容
content_prompt = PromptTemplate.from_template(
    "根据以下大纲编写详细内容：\n{outline}"
)
content_chain = content_prompt | llm | StrOutputParser()

# 组合链
from langchain_core.runnables import RunnablePassthrough

full_chain = (
    {"outline": outline_chain} 
    | RunnablePassthrough.assign(content=content_chain)
)

result = full_chain.invoke({"topic": "人工智能"})
```

### 4. Memory（记忆）

记忆组件让应用能够记住历史对话。

#### 对话缓冲记忆

```python
from langchain.memory import ConversationBufferMemory
from langchain.chains import ConversationChain

# 创建记忆
memory = ConversationBufferMemory()

# 创建对话链
conversation = ConversationChain(
    llm=llm,
    memory=memory,
    verbose=True
)

# 多轮对话
print(conversation.predict(input="你好，我叫小明"))
print(conversation.predict(input="我今年25岁"))
print(conversation.predict(input="我叫什么名字？"))  # AI 会记得
```

#### 对话摘要记忆

```python
from langchain.memory import ConversationSummaryMemory

# 对长对话进行摘要，节省 token
memory = ConversationSummaryMemory(llm=llm)

conversation = ConversationChain(
    llm=llm,
    memory=memory
)
```

#### 向量存储记忆

```python
from langchain.memory import VectorStoreRetrieverMemory
from langchain.vectorstores import Chroma
from langchain.embeddings import OpenAIEmbeddings

# 使用向量数据库存储历史
embeddings = OpenAIEmbeddings()
vectorstore = Chroma(embedding_function=embeddings)
retriever = vectorstore.as_retriever()

memory = VectorStoreRetrieverMemory(retriever=retriever)
```

### 5. Agents（智能体）

Agent 能够自主决定使用哪些工具来完成任务。

#### 基础 Agent

```python
from langchain.agents import initialize_agent, AgentType
from langchain.tools import Tool

# 定义工具
def search_internet(query):
    """模拟网络搜索"""
    return f"关于'{query}'的搜索结果..."

def calculate(expression):
    """计算器"""
    try:
        return str(eval(expression))
    except:
        return "计算错误"

tools = [
    Tool(
        name="Search",
        func=search_internet,
        description="用于搜索网络信息"
    ),
    Tool(
        name="Calculator",
        func=calculate,
        description="用于数学计算"
    )
]

# 初始化 Agent
agent = initialize_agent(
    tools,
    llm,
    agent=AgentType.ZERO_SHOT_REACT_DESCRIPTION,
    verbose=True
)

# 使用 Agent
result = agent.run("北京的人口是多少？然后计算这个数字除以100的结果")
```

#### ReAct Agent

ReAct（Reasoning + Acting）是最常用的 Agent 类型。

```python
from langchain.agents import create_react_agent
from langchain import hub

# 获取 ReAct prompt
prompt = hub.pull("hwchase17/react")

# 创建 Agent
agent = create_react_agent(llm, tools, prompt)

# 运行
from langchain.agents import AgentExecutor

agent_executor = AgentExecutor(agent=agent, tools=tools, verbose=True)
result = agent_executor.invoke({"input": "今天的日期是什么？"})
```

### 6. Tools（工具）

工具让 Agent 能够与外部系统交互。

#### 内置工具

```python
from langchain_community.tools import WikipediaQueryRun
from langchain_community.utilities import WikipediaAPIWrapper

# Wikipedia 工具
wikipedia = WikipediaQueryRun(api_wrapper=WikipediaAPIWrapper())

# DuckDuckGo 搜索
from langchain_community.tools import DuckDuckGoSearchRun
search = DuckDuckGoSearchRun()

# Python REPL
from langchain_experimental.tools import PythonREPLTool
python_repl = PythonREPLTool()
```

#### 自定义工具

```python
from langchain.tools import tool

@tool
def get_weather(city: str) -> str:
    """获取指定城市的天气信息"""
    # 实际项目中调用天气 API
    return f"{city}今天晴朗，气温25°C"

@tool
def send_email(to: str, subject: str, body: str) -> str:
    """发送邮件"""
    # 实际项目中集成邮件服务
    return f"邮件已发送至 {to}"

# 使用自定义工具
custom_tools = [get_weather, send_email]
```

## 实战项目

### 1. 问答机器人

```python
from langchain.chains import RetrievalQA
from langchain.document_loaders import TextLoader
from langchain.text_splitter import CharacterTextSplitter
from langchain.vectorstores import Chroma

# 加载文档
loader = TextLoader("knowledge_base.txt")
documents = loader.load()

# 分割文本
text_splitter = CharacterTextSplitter(chunk_size=1000, chunk_overlap=200)
texts = text_splitter.split_documents(documents)

# 创建向量存储
embeddings = OpenAIEmbeddings()
vectorstore = Chroma.from_documents(texts, embeddings)

# 创建 QA 链
qa_chain = RetrievalQA.from_chain_type(
    llm=llm,
    chain_type="stuff",
    retriever=vectorstore.as_retriever()
)

# 提问
result = qa_chain.invoke("公司产品有哪些特点？")
print(result["result"])
```

### 2. 文档总结器

```python
from langchain.chains.summarize import load_summarize_chain
from langchain.document_loaders import WebBaseLoader

# 加载网页内容
loader = WebBaseLoader("https://example.com/article")
docs = loader.load()

# 创建总结链
chain = load_summarize_chain(llm, chain_type="map_reduce")

# 生成总结
summary = chain.invoke(docs)
print(summary["output_text"])
```

### 3. SQL 查询助手

```python
from langchain_community.utilities import SQLDatabase
from langchain_experimental.sql import SQLDatabaseChain

# 连接数据库
db = SQLDatabase.from_uri("sqlite:///example.db")

# 创建 SQL 链
sql_chain = SQLDatabaseChain.from_llm(llm, db, verbose=True)

# 自然语言查询
result = sql_chain.invoke("查询最近一个月的订单数量")
print(result["result"])
```

## RAG（检索增强生成）

RAG 是 LangChain 最重要的应用场景之一。

### 完整 RAG 流程

```python
from langchain.chains import RetrievalQA
from langchain.document_loaders import DirectoryLoader
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain.vectorstores import Chroma
from langchain.embeddings import OpenAIEmbeddings
from langchain.prompts import PromptTemplate

# 1. 加载文档
loader = DirectoryLoader("./docs/", glob="**/*.pdf")
documents = loader.load()

# 2. 分割文本
text_splitter = RecursiveCharacterTextSplitter(
    chunk_size=1000,
    chunk_overlap=200,
    length_function=len
)
texts = text_splitter.split_documents(documents)

# 3. 创建向量存储
embeddings = OpenAIEmbeddings()
vectorstore = Chroma.from_documents(texts, embeddings)

# 4. 自定义 Prompt
prompt_template = """使用以下上下文片段回答问题。
如果上下文中没有相关信息，就说"我不知道"。

上下文：
{context}

问题：{question}

回答："""

PROMPT = PromptTemplate(
    template=prompt_template,
    input_variables=["context", "question"]
)

# 5. 创建 QA 链
qa_chain = RetrievalQA.from_chain_type(
    llm=llm,
    chain_type="stuff",
    retriever=vectorstore.as_retriever(search_kwargs={"k": 3}),
    chain_type_kwargs={"prompt": PROMPT},
    return_source_documents=True
)

# 6. 提问
result = qa_chain.invoke("公司的休假政策是什么？")
print(f"回答：{result['result']}")
print(f"\n参考文档：")
for doc in result['source_documents']:
    print(f"- {doc.metadata['source']}")
```

## 最佳实践

### 1. 错误处理

```python
from tenacity import retry, stop_after_attempt, wait_exponential

@retry(stop=stop_after_attempt(3), wait=wait_exponential(multiplier=1, min=4, max=10))
def safe_invoke(chain, inputs):
    """带重试的安全调用"""
    try:
        return chain.invoke(inputs)
    except Exception as e:
        print(f"Error: {e}")
        raise
```

### 2. 流式输出

```python
from langchain.callbacks.streaming_stdout import StreamingStdOutCallbackHandler

llm_streaming = ChatOpenAI(
    model="gpt-3.5-turbo",
    streaming=True,
    callbacks=[StreamingStdOutCallbackHandler()]
)

# 流式输出
for chunk in llm_streaming.stream("写一首诗"):
    pass  # 内容会自动打印
```

### 3. 缓存

```python
from langchain.cache import InMemoryCache
import langchain

# 启用缓存
langchain.llm_cache = InMemoryCache()

# 第一次调用 - 实际请求
result1 = llm.invoke("你好")

# 第二次调用 - 从缓存返回
result2 = llm.invoke("你好")  # 更快，不消耗 API
```

### 4. 成本跟踪

```python
from langchain.callbacks import get_openai_callback

with get_openai_callback() as cb:
    result = chain.invoke({"question": "什么是AI？"})
    print(f"Total Tokens: {cb.total_tokens}")
    print(f"Prompt Tokens: {cb.prompt_tokens}")
    print(f"Completion Tokens: {cb.completion_tokens}")
    print(f"Total Cost: ${cb.total_cost}")
```

## 小结

本章我们学习了：
- ✅ LangChain 核心组件（Models, Prompts, Chains, Memory, Agents, Tools）
- ✅ 如何构建对话应用
- ✅ RAG 系统的完整实现
- ✅ Agent 和工具的使用
- ✅ 最佳实践和性能优化

下一章我们将学习如何**本地部署模型**，实现数据隐私保护和离线使用。

## 延伸阅读

- [LangChain 官方文档](https://python.langchain.com/docs/)
- [LangChain Cookbook](https://github.com/gkamradt/langchain-tutorials)
- [LangSmith - 调试和监控](https://docs.smith.langchain.com/)
