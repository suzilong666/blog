# GIL 全局解释器锁

[官方文档](https://docs.python.org/zh-cn/3/glossary.html#term-global-interpreter-lock)

GIL（Global Interpreter Lock）是 CPython 解释器中的一个互斥锁，确保同一时刻只有一个线程执行 Python 字节码。理解 GIL 对于编写高性能并发程序至关重要。

## GIL 概念

### 什么是 GIL？

GIL 是一个全局锁，防止多个原生线程同时执行 Python 字节码。

```python
import threading

counter = 0

def increment():
    global counter
    for _ in range(1000000):
        counter += 1

threads = [threading.Thread(target=increment) for _ in range(4)]
for t in threads:
    t.start()
for t in threads:
    t.join()

print(counter)  # 可能不是 4000000（因为 GIL 切换）
```

## 为什么需要 GIL？

### 原因

1. **简化内存管理**：引用计数不需要额外的锁
2. **C 扩展兼容**：许多 C 库不是线程安全的
3. **历史原因**：早期 Python 设计决策

### 影响

- **I/O 密集型**：影响较小（等待 I/O 时释放 GIL）
- **CPU 密集型**：影响较大（无法真正并行）

## GIL 的影响

### CPU 密集型任务

```python
import threading
import multiprocessing
import time

def cpu_bound_task(n):
    total = 0
    for i in range(n):
        total += i * i
    return total

n = 10000000

# 单线程
start = time.time()
cpu_bound_task(n)
print(f"单线程: {time.time() - start:.2f}s")

# 多线程（受 GIL 限制）
start = time.time()
threads = [threading.Thread(target=cpu_bound_task, args=(n//4,)) for _ in range(4)]
for t in threads:
    t.start()
for t in threads:
    t.join()
print(f"多线程: {time.time() - start:.2f}s")

# 多进程（绕过 GIL）
start = time.time()
processes = [multiprocessing.Process(target=cpu_bound_task, args=(n//4,)) for _ in range(4)]
for p in processes:
    p.start()
for p in processes:
    p.join()
print(f"多进程: {time.time() - start:.2f}s")
```

## 绕过 GIL 的方法

### 1. 使用多进程

```python
from multiprocessing import Pool

def square(x):
    return x ** 2

if __name__ == "__main__":
    with Pool(processes=4) as pool:
        results = pool.map(square, range(1000000))
```

### 2. 使用 C 扩展

```python
# 使用 numpy（底层是 C）
import numpy as np

arr = np.random.rand(1000000, 1000000)
result = arr @ arr.T  # 矩阵乘法，释放 GIL
```

### 3. 使用其他实现

- **Jython**：没有 GIL
- **IronPython**：没有 GIL
- **PyPy STM**：软件事务内存

### 4. 使用 concurrent.futures

```python
from concurrent.futures import ProcessPoolExecutor

def compute(n):
    return sum(i * i for i in range(n))

with ProcessPoolExecutor(max_workers=4) as executor:
    results = list(executor.map(compute, [1000000] * 4))
```

## Python 3.13+ 无 GIL

Python 3.13 引入了可选的无 GIL 模式（PEP 703）。

```bash
# 编译时启用
./configure --disable-gil
make
```

## 最佳实践

1. **I/O 密集用线程**：网络、文件操作
2. **CPU 密集用进程**：计算密集型任务
3. **使用异步 IO**：高并发场景
4. **利用 C 扩展**：numpy、scipy 等
5. **考虑无 GIL 实现**：未来趋势

## 总结

本文介绍了 Python GIL：

- ✅ GIL 概念和原因
- ✅ GIL 的影响
- ✅ 绕过 GIL 的方法
- ✅ Python 3.13+ 无 GIL
- ✅ 最佳实践

掌握 GIL 后，你可以继续学习 [性能优化](/python/expert/性能优化)。
