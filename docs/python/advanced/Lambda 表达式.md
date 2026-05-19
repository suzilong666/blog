# Lambda 表达式

[官方文档](https://docs.python.org/zh-cn/3/tutorial/controlflow.html#lambda-expressions)

Lambda 表达式是创建小型匿名函数的简洁方式。虽然功能有限，但在需要简单函数的场景中非常有用。本文将介绍 Lambda 的语法、适用场景和最佳实践。

## Lambda 语法

### 基本形式

```python
# 普通函数
def add(a, b):
    return a + b

# Lambda 表达式
add = lambda a, b: a + b

print(add(3, 5))  # 8
```

### 语法结构

```python
lambda 参数1, 参数2, ...: 表达式
```

**特点**：
- 只能包含一个表达式
- 自动返回表达式的结果
- 不能有语句（如 `print`、`return`）

## 常见用法

### 单参数

```python
square = lambda x: x ** 2
print(square(5))  # 25

is_even = lambda x: x % 2 == 0
print(is_even(4))  # True
```

### 多参数

```python
multiply = lambda x, y: x * y
print(multiply(3, 4))  # 12

full_name = lambda first, last: f"{first} {last}"
print(full_name("张", "三"))  # 张三
```

### 无参数

```python
greet = lambda: "Hello, World!"
print(greet())  # Hello, World!
```

### 默认参数

```python
power = lambda x, n=2: x ** n
print(power(5))     # 25
print(power(5, 3))  # 125
```

## 配合内置函数使用

### map()

对每个元素应用函数。

```python
numbers = [1, 2, 3, 4, 5]

# 使用 Lambda
squares = list(map(lambda x: x ** 2, numbers))
print(squares)  # [1, 4, 9, 16, 25]

# 等价于列表推导式
squares = [x ** 2 for x in numbers]
```

### filter()

过滤符合条件的元素。

```python
numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]

# 筛选偶数
evens = list(filter(lambda x: x % 2 == 0, numbers))
print(evens)  # [2, 4, 6, 8, 10]

# 等价于列表推导式
evens = [x for x in numbers if x % 2 == 0]
```

### sorted()

自定义排序规则。

```python
students = [
    {"name": "张三", "score": 85},
    {"name": "李四", "score": 92},
    {"name": "王五", "score": 78}
]

# 按分数排序
sorted_students = sorted(students, key=lambda s: s["score"])
for s in sorted_students:
    print(f"{s['name']}: {s['score']}")
# 王五: 78
# 张三: 85
# 李四: 92

# 降序
sorted_desc = sorted(students, key=lambda s: s["score"], reverse=True)
```

### min()/max()

```python
numbers = [3, 1, 4, 1, 5, 9, 2, 6]

# 绝对值最小
min_abs = min(numbers, key=lambda x: abs(x))
print(min_abs)  # 1

# 字符串最长
words = ["apple", "banana", "cherry"]
longest = max(words, key=lambda w: len(w))
print(longest)  # banana
```

## 实际应用示例

### 1. 字典排序

```python
prices = {"apple": 3.5, "banana": 1.2, "orange": 2.8}

# 按价格排序
sorted_prices = dict(sorted(prices.items(), key=lambda x: x[1]))
print(sorted_prices)
# {'banana': 1.2, 'orange': 2.8, 'apple': 3.5}
```

### 2. 数据转换

```python
data = [("张三", 25), ("李四", 30), ("王五", 28)]

# 转换为字典
data_dict = {name: age for name, age in data}
print(data_dict)  # {'张三': 25, '李四': 30, '王五': 28}

# 提取姓名
names = list(map(lambda x: x[0], data))
print(names)  # ['张三', '李四', '王五']
```

### 3. 条件选择

```python
# 三元表达式的 Lambda
get_status = lambda score: "及格" if score >= 60 else "不及格"

print(get_status(75))  # 及格
print(get_status(45))  # 不及格
```

## Lambda vs 普通函数

| 特性 | Lambda | def |
| :--- | :--- | :--- |
| 名称 | 匿名 | 有名称 |
| 复杂度 | 单一表达式 | 任意复杂 |
| 可读性 | 简洁 | 清晰 |
| 调试 | 困难 | 容易 |
| 文档 | 不支持 | 支持 docstring |

### 何时使用 Lambda

```python
# ✅ 适合：简单的单次使用
sorted(data, key=lambda x: x["score"])

# ❌ 不适合：复杂逻辑
# lambda x: (
#     process_a(x) if condition_a(x)
#     else process_b(x) if condition_b(x)
#     else default_process(x)
# )

# ✅ 更好：使用普通函数
def get_sort_key(x):
    if condition_a(x):
        return process_a(x)
    elif condition_b(x):
        return process_b(x)
    else:
        return default_process(x)
```

## 常见错误

### 1. 尝试使用语句

```python
# lambda x: print(x)  # 可以，但不推荐
# lambda x: return x  # SyntaxError!
```

### 2. 过度嵌套

```python
# 不好
complex_lambda = lambda x: (
    lambda y: x + y
)(10)

# 好：使用普通函数
def add_ten(x):
    return x + 10
```

### 3. 忽略可读性

```python
# 难以阅读
result = sorted(data, key=lambda x: (-x["score"], x["name"]))

# 更清晰
def sort_key(item):
    return (-item["score"], item["name"])

result = sorted(data, key=sort_key)
```

## 最佳实践

1. **保持简单**：Lambda 只用于简单表达式
2. **命名函数优先**：复杂逻辑用 `def`
3. **避免嵌套 Lambda**：降低可读性
4. **配合内置函数**：map、filter、sorted 等
5. **考虑列表推导式**：通常更 Pythonic

```python
# 好的实践
squares = [x ** 2 for x in range(10)]  # 比 map + lambda 更好

# Lambda 适用的场景
pairs = sorted(pairs, key=lambda p: p[1])
```

## 总结

本文介绍了 Python Lambda 表达式：

- ✅ Lambda 语法和基本用法
- ✅ 配合 map、filter、sorted 使用
- ✅ Lambda vs 普通函数的比较
- ✅ 实际应用示例
- ✅ 最佳实践

掌握 Lambda 后，你可以继续学习 [推导式](/python/advanced/推导式)，了解更 Pythonic 的数据处理方式。
