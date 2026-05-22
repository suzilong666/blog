# RAG 检索增强生成实战

## 什么是 RAG？

RAG（Retrieval-Augmented Generation，检索增强生成）是一种结合信息检索和文本生成的技术架构。它通过从知识库中检索相关文档，为语言模型提供上下文，从而生成更准确、更有依据的回答。

### 为什么需要 RAG？

**传统 LLM 的局限性：**
- 知识截止：训练数据有时间限制
- 幻觉问题：可能编造不存在的信息
- 无法访问私有数据：企业内部文档不可用
- 缺乏可追溯性：无法提供信息来源

**RAG 的优势：**
- ✅ 实时知识：可以访问最新数据
- ✅ 减少幻觉：基于真实文档回答
- ✅ 私有数据：支持企业知识库
- ✅ 可追溯：提供引用来源
- ✅ 成本更低：无需微调模型

## RAG 架构原理

```
用户提问
    ↓
┌──────────────┐
│  Query Embedding  │  ← 将问题转换为向量
└──────────────┘
    ↓
┌──────────────┐
│ Vector Database  │  ← 检索相似文档
│   (Chroma/Pinecone)│
└──────────────┘
    ↓
┌──────────────┐
│  Relevant Documents │  ← 返回 Top-K 相关文档
└──────────────┘
    ↓
┌──────────────┐
│  Prompt + Context   │  ← 构建增强提示词
└──────────────┘
    ↓
┌──────────────┐
│     LLM         │  ← 生成回答
└──────────────┘
    ↓
带引用的回答
```

## 核心组件

### 1. 文档加载（Document Loading）

从各种来源加载文档。

```python
from langchain.document_loaders import (
    TextLoader,
    PyPDFLoader,
    WebBaseLoader,
    DirectoryLoader,
    CSVLoader,
    UnstructuredWordDocumentLoader
)

# 加载 TXT 文件
loader = TextLoader("document.txt")
docs = loader.load()

# 加载 PDF
loader = PyPDFLoader("report.pdf")
docs = loader.load()

# 加载网页
loader = WebBaseLoader("https://example.com/article")
docs = loader.load()

# 批量加载目录
loader = DirectoryLoader(
    "./docs/",
    glob="**/*.pdf",
    show_progress=True
)
docs = loader.load()
```

### 2. 文本分割（Text Splitting）

将长文档分割成适合处理的片段。

```python
from langchain.text_splitter import (
    CharacterTextSplitter,
    RecursiveCharacterTextSplitter,
    MarkdownTextSplitter,
    TokenTextSplitter
)

# 递归字符分割器（推荐）
text_splitter = RecursiveCharacterTextSplitter(
    chunk_size=1000,      # 每个片段的大小
    chunk_overlap=200,    # 片段间的重叠（保持上下文连贯）
    length_function=len,
    separators=["\n\n", "\n", " ", ""]  # 分割优先级
)

chunks = text_splitter.split_documents(docs)

print(f"原始文档数: {len(docs)}")
print(f"分割后片段数: {len(chunks)}")
print(f"第一个片段长度: {len(chunks[0].page_content)}")
```

**分割策略选择：**

| 分割器 | 适用场景 |
|--------|---------|
| CharacterTextSplitter | 简单文本 |
| RecursiveCharacterTextSplitter | 通用场景（推荐） |
| MarkdownTextSplitter | Markdown 文档 |
| TokenTextSplitter | 精确控制 token 数 |
| CodeTextSplitter | 代码文件 |

### 3. 向量化（Embedding）

将文本转换为向量表示。

```python
from langchain.embeddings import OpenAIEmbeddings, HuggingFaceEmbeddings

# OpenAI Embeddings（推荐）
embeddings = OpenAIEmbeddings(
    model="text-embedding-3-small",  # 性价比高
    # model="text-embedding-3-large"  # 效果更好
)

# 本地 Embeddings（免费）
embeddings = HuggingFaceEmbeddings(
    model_name="sentence-transformers/all-MiniLM-L6-v2"
)

# 生成向量
text = "机器学习是人工智能的一个分支"
vector = embeddings.embed_query(text)
print(f"向量维度: {len(vector)}")  # 1536 (OpenAI) 或 384 (MiniLM)
```

**常用 Embedding 模型对比：**

| 模型 | 维度 | 速度 | 效果 | 成本 |
|------|------|------|------|------|
| text-embedding-3-large | 3072 | 快 | 最好 | $0.13/1M |
| text-embedding-3-small | 1536 | 最快 | 好 | $0.02/1M |
| text-embedding-ada-002 | 1536 | 快 | 好 | $0.10/1M |
| all-MiniLM-L6-v2 | 384 | 最快 | 中等 | 免费 |

### 4. 向量数据库（Vector Store）

存储和检索向量。

#### Chroma（推荐入门）

```python
from langchain.vectorstores import Chroma

# 创建向量存储
vectorstore = Chroma.from_documents(
    documents=chunks,
    embedding=embeddings,
    persist_directory="./chroma_db"  # 持久化存储
)

# 保存
vectorstore.persist()

# 加载已存在的数据库
vectorstore = Chroma(
    persist_directory="./chroma_db",
    embedding_function=embeddings
)
```

#### FAISS（高性能）

```python
from langchain.vectorstores import FAISS

# 创建
vectorstore = FAISS.from_documents(chunks, embeddings)

# 保存
vectorstore.save_local("faiss_index")

# 加载
vectorstore = FAISS.load_local(
    "faiss_index",
    embeddings,
    allow_dangerous_deserialization=True
)
```

#### Pinecone（云端服务）

```python
from langchain.vectorstores import Pinecone
import pinecone

# 初始化
pinecone.init(
    api_key="your-api-key",
    environment="us-west1-gcp"
)

index_name = "my-rag-index"

# 创建索引
if index_name not in pinecone.list_indexes():
    pinecone.create_index(
        name=index_name,
        dimension=1536,
        metric="cosine"
    )

# 连接
vectorstore = Pinecone.from_documents(
    chunks,
    embeddings,
    index_name=index_name
)
```

### 5. 检索（Retrieval）

从向量数据库中查找相关文档。

```python
# 基本检索
query = "公司的休假政策是什么？"
results = vectorstore.similarity_search(query, k=3)

for i, doc in enumerate(results):
    print(f"\n--- 文档 {i+1} ---")
    print(doc.page_content[:200])
    print(f"来源: {doc.metadata}")

# 相似度 + 分数
results_with_scores = vectorstore.similarity_search_with_score(query, k=3)
for doc, score in results_with_scores:
    print(f"相似度分数: {score}")  # 越小越相似

# MMR 检索（最大化多样性）
results = vectorstore.max_marginal_relevance_search(
    query,
    k=3,
    fetch_k=10  # 先取10个，再选出最多样的3个
)
```

## 完整 RAG 实现

### 基础版本

```python
from langchain.chains import RetrievalQA
from langchain.chat_models import ChatOpenAI
from langchain.embeddings import OpenAIEmbeddings
from langchain.vectorstores import Chroma
from langchain.document_loaders import PyPDFLoader
from langchain.text_splitter import RecursiveCharacterTextSplitter

class BasicRAG:
    """基础 RAG 系统"""
    
    def __init__(self, pdf_path):
        # 1. 加载文档
        loader = PyPDFLoader(pdf_path)
        documents = loader.load()
        
        # 2. 分割文本
        text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=1000,
            chunk_overlap=200
        )
        self.chunks = text_splitter.split_documents(documents)
        
        # 3. 创建向量存储
        embeddings = OpenAIEmbeddings()
        self.vectorstore = Chroma.from_documents(
            self.chunks,
            embeddings
        )
        
        # 4. 初始化 LLM
        self.llm = ChatOpenAI(
            model="gpt-3.5-turbo",
            temperature=0
        )
        
        # 5. 创建 QA 链
        self.qa_chain = RetrievalQA.from_chain_type(
            llm=self.llm,
            chain_type="stuff",
            retriever=self.vectorstore.as_retriever(
                search_kwargs={"k": 3}
            ),
            return_source_documents=True
        )
    
    def query(self, question):
        """查询并获取答案"""
        result = self.qa_chain.invoke({"query": question})
        
        return {
            "answer": result["result"],
            "sources": [
                {
                    "content": doc.page_content[:200],
                    "metadata": doc.metadata
                }
                for doc in result["source_documents"]
            ]
        }

# 使用
rag = BasicRAG("company_handbook.pdf")
result = rag.query("年假有多少天？")
print(result["answer"])
print("\n参考来源:")
for source in result["sources"]:
    print(f"- {source['metadata'].get('source', 'Unknown')}")
```

### 进阶版本（自定义 Prompt）

```python
from langchain.prompts import PromptTemplate
from langchain.chains import RetrievalQA

# 自定义 Prompt
prompt_template = """你是一个专业的问答助手。请根据以下上下文回答问题。

指导原则：
1. 只基于提供的上下文回答，不要使用外部知识
2. 如果上下文中没有相关信息，明确说"我无法从文档中找到相关信息"
3. 回答要简洁、准确
4. 引用具体段落时注明来源

上下文：
{context}

问题：{question}

回答："""

PROMPT = PromptTemplate(
    template=prompt_template,
    input_variables=["context", "question"]
)

# 创建带自定义 Prompt 的 QA 链
qa_chain = RetrievalQA.from_chain_type(
    llm=llm,
    chain_type="stuff",
    retriever=vectorstore.as_retriever(search_kwargs={"k": 5}),
    chain_type_kwargs={"prompt": PROMPT},
    return_source_documents=True
)
```

### 高级版本（带对话历史）

```python
from langchain.chains import ConversationalRetrievalChain
from langchain.memory import ConversationBufferMemory

class ConversationalRAG:
    """支持多轮对话的 RAG 系统"""
    
    def __init__(self, vectorstore):
        self.llm = ChatOpenAI(
            model="gpt-3.5-turbo",
            temperature=0
        )
        
        # 对话记忆
        self.memory = ConversationBufferMemory(
            memory_key="chat_history",
            return_messages=True
        )
        
        # 创建对话检索链
        self.conversation_chain = ConversationalRetrievalChain.from_llm(
            llm=self.llm,
            retriever=vectorstore.as_retriever(
                search_kwargs={"k": 3}
            ),
            memory=self.memory,
            return_source_documents=True
        )
    
    def chat(self, question):
        """多轮对话"""
        result = self.conversation_chain.invoke({
            "question": question
        })
        
        return {
            "answer": result["answer"],
            "sources": result["source_documents"]
        }

# 使用
conv_rag = ConversationalRAG(vectorstore)

# 第一轮
result1 = conv_rag.chat("公司产品有哪些？")
print(result1["answer"])

# 第二轮（AI 能理解上下文）
result2 = conv_rag.chat("第二个产品的价格是多少？")
print(result2["answer"])
```

## 优化技巧

### 1. 混合检索

结合关键词搜索和向量搜索。

```python
from langchain.retrievers import EnsembleRetriever
from langchain.vectorstores import Chroma
from langchain.retrievers import BM25Retriever

# 向量检索
vector_retriever = vectorstore.as_retriever(
    search_kwargs={"k": 3}
)

# 关键词检索（BM25）
bm25_retriever = BM25Retriever.from_documents(chunks)
bm25_retriever.k = 3

# 组合
ensemble_retriever = EnsembleRetriever(
    retrievers=[vector_retriever, bm25_retriever],
    weights=[0.7, 0.3]  # 权重
)

# 使用
qa_chain = RetrievalQA.from_chain_type(
    llm=llm,
    retriever=ensemble_retriever
)
```

### 2. 重排序（Re-ranking）

对检索结果进行二次排序。

```python
from langchain.retrievers import ContextualCompressionRetriever
from langchain.retrievers.document_compressors import CohereRerank

# 使用 Cohere Rerank
compressor = CohereRerank(
    cohere_api_key="your-key",
    top_n=3
)

compression_retriever = ContextualCompressionRetriever(
    base_compressor=compressor,
    base_retriever=vectorstore.as_retriever(search_kwargs={"k": 10})
)

# 先检索10个，再重排序选出最好的3个
qa_chain = RetrievalQA.from_chain_type(
    llm=llm,
    retriever=compression_retriever
)
```

### 3. 元数据过滤

```python
# 添加元数据
for chunk in chunks:
    chunk.metadata.update({
        "source": "handbook",
        "year": 2024,
        "department": "HR"
    })

# 检索时过滤
retriever = vectorstore.as_retriever(
    search_kwargs={
        "k": 3,
        "filter": {"department": "HR"}
    }
)
```

### 4. 父文档检索

检索小片段，但返回更大的上下文。

```python
from langchain.retrievers import ParentDocumentRetriever

parent_splitter = RecursiveCharacterTextSplitter(chunk_size=2000)
child_splitter = RecursiveCharacterTextSplitter(chunk_size=500)

parent_retriever = ParentDocumentRetriever(
    vectorstore=vectorstore,
    document_splitter=child_splitter,
    parent_splitter=parent_splitter
)

# 添加文档
parent_retriever.add_documents(docs)

# 检索时会返回完整的父文档
results = parent_retriever.get_relevant_documents(query)
```

## 评估 RAG 系统

### 关键指标

1. **检索质量**
   - Recall@K：相关文档是否在 Top-K 中
   - MRR（Mean Reciprocal Rank）：相关文档的排名

2. **生成质量**
   - 答案相关性
   - 事实准确性
   - 引用正确性

### 使用 Ragas 评估

```bash
pip install ragas
```

```python
from ragas import evaluate
from ragas.metrics import (
    faithfulness,
    answer_relevancy,
    context_precision,
    context_recall
)

# 测试数据集
test_data = [
    {
        "question": "年假有多少天？",
        "answer": "员工每年有15天带薪年假。",
        "contexts": ["公司员工享有15天年假..."],
        "ground_truths": ["15天"]
    }
]

# 评估
results = evaluate(
    test_data,
    metrics=[faithfulness, answer_relevancy, context_precision]
)

print(results)
```

## 常见陷阱与解决方案

### 问题1：检索不到相关内容

**原因：**
- 文本分割不合理
- Embedding 质量差
- 查询表述不匹配

**解决：**
```python
# 1. 调整分割参数
text_splitter = RecursiveCharacterTextSplitter(
    chunk_size=500,    # 减小片段大小
    chunk_overlap=100
)

# 2. 使用更好的 Embedding
embeddings = OpenAIEmbeddings(model="text-embedding-3-large")

# 3. 查询改写
from langchain.chains import QueryTransformationChain

def rewrite_query(original_query):
    """改写查询以提高检索效果"""
    prompt = f"""将以下查询改写为更适合检索的形式：
    原查询：{original_query}
    改写后："""
    
    response = llm.invoke(prompt)
    return response.content.strip()
```

### 问题2：答案不准确

**原因：**
- 检索到的文档不够相关
- Prompt 设计不佳
- 模型幻觉

**解决：**
```python
# 1. 增加检索数量
retriever = vectorstore.as_retriever(search_kwargs={"k": 5})

# 2. 改进 Prompt
prompt = """基于以下上下文回答问题。如果上下文中没有答案，请说"我不知道"。

上下文：{context}

问题：{question}

答案："""

# 3. 要求引用来源
prompt = """回答问题并引用具体的原文作为依据。"""
```

### 问题3：响应速度慢

**优化：**
```python
# 1. 缓存嵌入向量
# 2. 使用更快的向量数据库（FAISS）
# 3. 减少检索数量
search_kwargs={"k": 2}

# 4. 异步处理
import asyncio

async def async_query(question):
    result = await qa_chain.ainvoke({"query": question})
    return result
```

## 实战案例：企业知识库问答

```python
import os
from pathlib import Path
from langchain.document_loaders import DirectoryLoader, PyPDFLoader, Docx2txtLoader
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain.embeddings import OpenAIEmbeddings
from langchain.vectorstores import Chroma
from langchain.chains import RetrievalQA
from langchain.chat_models import ChatOpenAI
from langchain.prompts import PromptTemplate

class EnterpriseKnowledgeBase:
    """企业知识库 RAG 系统"""
    
    def __init__(self, docs_dir="./enterprise_docs"):
        self.docs_dir = docs_dir
        self.vectorstore = None
        self.qa_chain = None
        self._build_knowledge_base()
    
    def _load_documents(self):
        """加载所有文档"""
        all_docs = []
        
        # 遍历文档目录
        for file_path in Path(self.docs_dir).rglob("*"):
            if file_path.is_file():
                try:
                    if file_path.suffix == '.pdf':
                        loader = PyPDFLoader(str(file_path))
                    elif file_path.suffix == '.docx':
                        loader = Docx2txtLoader(str(file_path))
                    elif file_path.suffix == '.txt':
                        loader = TextLoader(str(file_path))
                    else:
                        continue
                    
                    docs = loader.load()
                    # 添加元数据
                    for doc in docs:
                        doc.metadata['source_file'] = file_path.name
                    all_docs.extend(docs)
                    
                except Exception as e:
                    print(f"加载失败 {file_path}: {e}")
        
        print(f"成功加载 {len(all_docs)} 个文档")
        return all_docs
    
    def _build_knowledge_base(self):
        """构建知识库"""
        # 1. 加载文档
        documents = self._load_documents()
        
        # 2. 分割文本
        text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=1000,
            chunk_overlap=200,
            separators=["\n\n", "\n", "。", "！", "？", " ", ""]
        )
        chunks = text_splitter.split_documents(documents)
        print(f"分割为 {len(chunks)} 个片段")
        
        # 3. 创建向量存储
        embeddings = OpenAIEmbeddings()
        self.vectorstore = Chroma.from_documents(
            chunks,
            embeddings,
            persist_directory="./enterprise_chroma"
        )
        self.vectorstore.persist()
        
        # 4. 创建 QA 链
        prompt_template = """你是企业智能助手。基于以下上下文回答问题。

规则：
- 只基于提供的信息回答
- 如无相关信息，回复"暂未找到相关信息"
- 标注信息来源文件

上下文：
{context}

问题：{question}

回答："""

        PROMPT = PromptTemplate(
            template=prompt_template,
            input_variables=["context", "question"]
        )

        self.qa_chain = RetrievalQA.from_chain_type(
            llm=ChatOpenAI(model="gpt-3.5-turbo", temperature=0),
            chain_type="stuff",
            retriever=self.vectorstore.as_retriever(
                search_kwargs={"k": 4}
            ),
            chain_type_kwargs={"prompt": PROMPT},
            return_source_documents=True
        )
    
    def query(self, question):
        """查询知识库"""
        result = self.qa_chain.invoke({"query": question})
        
        sources = list(set([
            doc.metadata.get('source_file', 'Unknown')
            for doc in result['source_documents']
        ]))
        
        return {
            "answer": result["result"],
            "sources": sources
        }

# 使用
kb = EnterpriseKnowledgeBase("./enterprise_docs")
result = kb.query("出差报销标准是什么？")
print(result["answer"])
print(f"来源: {', '.join(result['sources'])}")
```

## 小结

本章我们学习了：
- ✅ RAG 的原理和架构
- ✅ 核心组件（加载、分割、嵌入、存储、检索）
- ✅ 完整 RAG 系统实现
- ✅ 优化技巧（混合检索、重排序、元数据过滤）
- ✅ 评估方法和常见问题处理

下一章我们将学习**智能 Agent 开发**。

## 延伸阅读

- [LangChain RAG 教程](https://python.langchain.com/docs/use_cases/question_answering/)
- [Chroma 官方文档](https://docs.trychroma.com/)
- [Ragas 评估框架](https://docs.ragas.io/)
