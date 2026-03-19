# Husky

## Husky是什么？

它是一个 Git Hook（Git 钩子）工具，用来在提交或推送时自动检查你的提交消息、代码并运行测试。

> [Husky官网](https://husky.nodejs.cn/)

## 如何使用Husky

### 安装

```
npm install --save-dev husky
```

### husky init

init 命令简化了在项目中设置 husky 的过程。它在 .husky/ 中创建一个 pre-commit 脚本，并在 package.json 中更新 prepare 脚本。可以稍后进行修改以适合你的工作流程。

```
npx husky init
```