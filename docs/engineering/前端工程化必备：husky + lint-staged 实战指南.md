# 前端工程化必备：husky + lint-staged 实战指南

> 让 Git 钩子成为代码质量的第一道防线

## 引言

在团队协作的前端项目中，代码规范与质量控制常常面临一个尴尬的局面：虽然配置了 ESLint、Prettier 等工具，但总有个别开发者会忘记运行检查，或者“一不小心”把未格式化的代码推送到仓库，导致代码审查时充斥大量格式差异，甚至隐藏的语法错误被合入主分支。

**如何确保每一次提交的代码都自动经过质量检查？** 答案就是 Git 钩子结合自动化工具。**husky** 让我们能够轻松管理 Git 钩子，**lint-staged** 则专门针对暂存区文件运行指定任务，二者搭配，可以完美实现在 `git commit` 前自动运行 ESLint 修复、Prettier 格式化、单元测试等检查，只有通过所有检查的代码才能进入仓库。

本文将从前端工程化视角，详细讲解如何在项目中配置 husky + lint-staged，并分享一些进阶用法与常见问题解决方案。

---

## 一、Git Hooks 简介

Git 钩子（Git Hooks）是 Git 提供的一种在特定事件（如 `commit`、`push`、`merge`）发生时自动触发脚本的机制。这些脚本存放在项目的 `.git/hooks/` 目录下，默认以 `.sample` 结尾，重命名后即可生效。

但手动管理这些钩子文件存在以下问题：

- 无法将钩子脚本纳入版本控制（`.git/hooks` 不参与仓库同步）。
- 团队成员需要各自手动配置，难以统一。
- 钩子脚本的编写较为繁琐。

**husky** 的出现完美解决了这些问题，它允许我们将 Git 钩子配置在 `package.json` 或单独的文件中，并确保所有成员通过 `npm install` 即可自动启用相同的钩子。

---

## 二、husky：让 Git 钩子变得简单

### 2.1 安装 husky

```bash
npm install husky --save-dev
# 或使用 pnpm
pnpm add husky -D
```

### 2.2 初始化 husky

在 `package.json` 中添加 `prepare` 脚本，该脚本会在 `npm install` 后自动执行：

```json
{
  "scripts": {
    "prepare": "husky install"
  }
}
```

然后运行一次 `npm run prepare`（或直接运行 `npx husky install`），husky 会在项目根目录创建 `.husky/` 文件夹，用于存放钩子脚本。

> 注意：`.husky/` 目录应提交到版本仓库中，以确保团队成员同步钩子配置。

### 2.3 添加 Git 钩子

使用 husky 的 `add` 命令可以快速创建钩子：

```bash
npx husky add .husky/pre-commit "npm test"
```

上述命令会在 `.husky/pre-commit` 文件中写入以下内容：

```bash
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

npm test
```

此时，每次执行 `git commit` 时，Git 都会触发 `pre-commit` 钩子，运行 `npm test`。如果测试失败，提交会被阻止。

### 2.4 常用钩子类型

- **pre-commit**：提交前运行，适用于代码检查、格式化、单元测试。
- **commit-msg**：校验提交信息格式（如是否符合 Conventional Commits 规范）。
- **pre-push**：推送前运行，可用于更重的集成测试或构建检查。

---

## 三、lint-staged：只检查暂存区的文件

如果直接使用 `eslint . --fix` 或 `prettier --write .` 对整个项目进行格式化，不仅耗时，还可能引入无关文件的变更。**lint-staged** 的精髓在于：**只对 Git 暂存区（staged）中的文件执行任务**，从而极大提升效率。

### 3.1 安装 lint-staged

```bash
npm install lint-staged --save-dev
# 或
pnpm add lint-staged -D
```

### 3.2 配置 lint-staged

在 `package.json` 中添加 `lint-staged` 字段，或创建单独的 `.lintstagedrc` 文件。以下是一个典型配置：

```json
{
  "lint-staged": {
    "*.{js,jsx,ts,tsx}": ["eslint --fix", "prettier --write"],
    "*.{json,css,scss,md}": ["prettier --write"],
    "*.vue": ["eslint --fix", "prettier --write"]
  }
}
```

- `"*.{js,jsx,ts,tsx}"`：匹配暂存区中所有 JavaScript/TypeScript 文件，依次运行 `eslint --fix` 和 `prettier --write`。
- 支持 glob 模式，可以针对不同文件类型配置不同命令。
- 命令按顺序执行，如果其中任意一个命令失败（退出码非零），整个 lint-staged 任务将失败，从而阻止提交。

### 3.3 在 husky 钩子中调用 lint-staged

修改之前创建的 `.husky/pre-commit` 文件，将任务替换为 `npx lint-staged`：

```bash
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

npx lint-staged
```

现在，每次 `git commit` 时，只有本次提交所涉及的文件会被自动格式化和检查，极大缩短了等待时间。

---

## 四、完整工作流示例

假设项目已配置 ESLint 和 Prettier，并且我们希望：

- 提交前对暂存区 JS/TS/Vue 文件运行 ESLint 修复和 Prettier 格式化。
- 检查提交信息是否符合规范（如使用 `@commitlint/config-conventional`）。

### 4.1 安装所需依赖

```bash
pnpm add -D husky lint-staged @commitlint/cli @commitlint/config-conventional
```

### 4.2 配置 commitlint

在项目根目录创建 `commitlint.config.js`：

```js
module.exports = {
  extends: ["@commitlint/config-conventional"],
};
```

### 4.3 配置 lint-staged

在 `package.json` 中添加：

```json
{
  "lint-staged": {
    "*.{js,ts,vue}": ["eslint --fix", "prettier --write"],
    "*.{json,md}": ["prettier --write"]
  }
}
```

### 4.4 添加 husky 钩子

```bash
# 初始化 husky（若未执行）
npx husky install

# 添加 pre-commit 钩子
npx husky add .husky/pre-commit "npx lint-staged"

# 添加 commit-msg 钩子
npx husky add .husky/commit-msg "npx --no -- commitlint --edit $1"
```

### 4.5 测试

现在尝试提交代码：

```bash
git add .
git commit -m "fix: correct typo in header"
```

如果代码有 ESLint 错误，提交会被阻止，并提示具体问题；如果提交信息不符合规范，`commit-msg` 钩子也会拦截。

---

## 五、进阶技巧与最佳实践

### 5.1 使用 TypeScript 项目

如果项目使用 TypeScript，建议在 lint-staged 中增加类型检查。但要注意，全量类型检查耗时较长，可以结合 `tsc --noEmit` 配合使用，但只对暂存区文件运行并不现实（因为 TypeScript 需要整体项目上下文）。一个常见的折中方案是：

- 在 `pre-commit` 中只运行 ESLint 和 Prettier。
- 在 `pre-push` 钩子中运行完整的类型检查与单元测试。

```bash
npx husky add .husky/pre-push "pnpm type-check && pnpm test"
```

### 5.2 处理大文件或大量文件

如果一次提交涉及大量文件，`lint-staged` 可能会因为并发或命令执行过慢而影响体验。可以通过配置 `concurrent` 选项来限制并发数，或使用 `--max-warnings` 等参数避免过多警告阻塞提交。

### 5.3 跳过钩子（临时）

有时需要紧急修复，希望跳过钩子检查，可以在 `git commit` 时添加 `--no-verify` 或 `-n` 选项：

```bash
git commit -m "hotfix" --no-verify
```

但应仅在紧急情况下使用，并提醒自己后续补上检查。

### 5.4 结合 IDE 集成

除了 Git 钩子，建议配置编辑器的“保存时自动格式化”功能，这样开发者在编码过程中就能实时看到格式效果，减少提交时大量格式修正。

### 5.5 在 CI 中复用

lint-staged 和 husky 只作用于本地提交，但为了安全起见，CI 流水线中也应运行完整的代码检查（如 `eslint .` 和 `prettier --check .`），防止因跳过钩子或配置不一致导致的代码质量问题。

---

## 六、常见问题与解决

### 6.1 husky 钩子不执行

- 检查 `.husky/` 目录下的钩子文件是否具有可执行权限（`chmod +x .husky/pre-commit`）。
- 确保 `husky install` 已在项目安装后执行（通过 `prepare` 脚本自动执行）。
- 检查 Git 版本，旧版本可能存在兼容性问题。

### 6.2 lint-staged 无法找到文件

如果命令中使用了相对路径，lint-staged 的工作目录是项目根目录，因此命令应能全局执行。例如 `eslint` 需要安装在项目 `node_modules` 中，或者使用 `npx eslint`。

### 6.3 格式化后文件未被加入暂存区

`lint-staged` 默认会重新将格式化后的文件加入暂存区，无需手动操作。如果某些工具生成新文件，可能需要配置 `git add` 或使用 `--diff` 选项。

### 6.4 Windows 兼容性问题

husky 使用 shell 脚本，在 Windows 上可通过 Git Bash 运行。建议团队统一使用 Git Bash 作为命令行环境，或在 `package.json` 中配置跨平台脚本。

---

## 七、总结

在工程化日益成熟的前端领域，代码质量保障不再仅仅是工具的堆砌，而是流程的自动化与强制执行。**husky + lint-staged** 正是将规范落地到 Git 工作流中的最佳实践：

- **husky** 简化了 Git 钩子的管理和同步，让团队拥有统一的提交前检查。
- **lint-staged** 确保只有即将提交的代码被处理，兼顾效率与质量。
- 结合 ESLint、Prettier、commitlint 等工具，可构建从代码风格到提交信息的全流程规范防线。

通过这套组合，我们可以自信地保证：任何合入仓库的代码，都经过了自动格式化和基本的质量检查，从而减少代码审查中的无谓争吵，提升团队协作的流畅度。对于追求卓越的前端团队，husky + lint-staged 是不可或缺的工程化基石。

---

**延伸阅读**

- [husky 官方文档](https://typicode.github.io/husky/)
- [lint-staged GitHub 仓库](https://github.com/okonet/lint-staged)
- [commitlint 官方文档](https://commitlint.js.org/)
