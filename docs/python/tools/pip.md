# pip

`pip` 是 Python 的包管理工具，掌握以下常用命令能高效管理第三方库。

## 1. 安装与卸载

| 命令 | 说明 | 示例 |
| :--- | :--- | :--- |
| `pip install <包名>` | 安装最新版本 | `pip install requests` |
| `pip install <包名>==版本号` | 安装指定版本 | `pip install numpy==1.21.0` |
| `pip install <包名> >= 版本号` | 安装满足条件的版本 | `pip install "django>=3.2,<4.0"` |
| `pip install -r requirements.txt` | 批量安装依赖文件中的包 | `pip install -r requirements.txt` |
| `pip install --upgrade <包名>` | 升级包 | `pip install --upgrade pip` |
| `pip uninstall <包名>` | 卸载包 | `pip uninstall requests` |

**常用选项：**
- `-i`：指定镜像源（临时）  
  `pip install pandas -i https://pypi.tuna.tsinghua.edu.cn/simple`
- `--user`：安装到用户目录（避免权限问题）
- `--no-deps`：不安装依赖
- `-U`：等价于 `--upgrade`

## 2. 查看与搜索

| 命令 | 说明 | 示例 |
| :--- | :--- | :--- |
| `pip list` | 列出当前环境所有已安装包 | `pip list` |
| `pip list --outdated` | 列出有可用更新的包 | `pip list --outdated` |
| `pip freeze` | 以 `包名==版本` 格式输出（常用于生成依赖文件） | `pip freeze > requirements.txt` |
| `pip show <包名>` | 显示包的详细信息（版本、依赖、位置等） | `pip show numpy` |
| `pip search <关键词>` | 搜索 PyPI 上的包（**注意：官方已限制该功能**，多数镜像也禁用） | 不推荐使用，建议去 [pypi.org](https://pypi.org) 网页搜索 |

## 3. 依赖管理

| 命令 | 说明 | 示例 |
| :--- | :--- | :--- |
| `pip freeze > requirements.txt` | 导出当前环境所有包到文件 | 常用但会导出间接依赖 |
| `pip install -r requirements.txt` | 从文件安装依赖 | 项目部署标准操作 |
| `pip check` | 检查已安装包的依赖是否完整 | `pip check` |

**更精细的工具：**
- `pipreqs .`：仅导出项目实际 import 的包
- `pip-tools`：通过 `requirements.in` 生成锁定文件

## 4. 配置与镜像

| 命令 | 说明 | 示例 |
| :--- | :--- | :--- |
| `pip config list` | 查看当前 pip 配置 | `pip config list` |
| `pip config set global.index-url <url>` | 设置全局镜像源 | `pip config set global.index-url https://pypi.tuna.tsinghua.edu.cn/simple` |
| `pip config set global.trusted-host <host>` | 添加信任主机（配合镜像源） | `pip config set global.trusted-host pypi.tuna.tsinghua.edu.cn` |
| `pip config unset <key>` | 删除某配置 | `pip config unset global.index-url` |

## 5. 缓存与清理

| 命令 | 说明 | 示例 |
| :--- | :--- | :--- |
| `pip cache info` | 查看缓存占用信息 | `pip cache info` |
| `pip cache list` | 列出缓存的包 | `pip cache list` |
| `pip cache purge` | 清理所有缓存 | `pip cache purge` |
| `pip cache remove <包名>` | 清除特定包的缓存 | `pip cache remove numpy` |

## 6. 升级 pip 自身

```bash
pip install --upgrade pip
# 或对于某些 Linux 发行版
python -m pip install --upgrade pip
```

## 7. 其他实用命令

| 命令 | 说明 |
| :--- | :--- |
| `pip --version` | 显示 pip 版本及所在路径 |
| `pip help` | 查看帮助 |
| `pip download <包名>` | 下载包但不安装（可指定 `-d` 目录） |
| `pip wheel <包名>` | 构建 wheel 文件 |

## 8. 常见使用场景速查

- **新项目环境准备**  
  ```bash
  python -m venv venv
  source venv/bin/activate      # Linux/macOS
  venv\Scripts\activate         # Windows
  pip install -r requirements.txt
  ```

- **快速安装单个包并指定镜像**  
  ```bash
  pip install jieba -i https://mirrors.aliyun.com/pypi/simple
  ```

- **升级所有可更新的包（需借助脚本）**  
  ```bash
  pip list --outdated --format=freeze | grep -v '^\-e' | cut -d = -f 1 | xargs -n1 pip install -U
  ```

> 💡 **最佳实践**：始终为每个项目创建独立的虚拟环境，然后在环境中使用 `pip freeze > requirements.txt` 导出纯净依赖。配合 `pip config set` 配置国内镜像源，可大幅提升安装速度。