# 代码规范：ESLint + Prettier 在前端工程化中的最佳实践

> 统一代码风格，提升协作效率，让代码质量成为团队的共同语言。

## 引言

在前端工程化的浪潮中，代码规范早已不是可有可无的“锦上添花”，而是保障项目可维护性、提升团队协作效率的基石。一个缺乏规范的项目，往往伴随着混乱的缩进、不一致的命名、隐藏的语法错误，最终导致代码审查困难、Bug 频发、新人上手成本陡增。

ESLint 与 Prettier 是目前前端生态中解决代码规范问题的最强组合。**ESLint** 负责代码质量检查（语法错误、潜在问题、风格一致性），**Prettier** 则专注代码格式化（缩进、换行、分号等）。两者相辅相成，从“质量”与“风格”两个维度共同构建起项目的规范防线。

本文将从工程化视角，深入讲解如何从零到一配置 ESLint + Prettier，并集成到开发流程中，确保团队协作时代码始终保持统一、干净、可读。

---

## 一、ESLint：代码质量的守门员

### 1.1 什么是 ESLint？

ESLint 是一个可插拔的 JavaScript 代码检查工具，能够识别并报告代码中的模式问题，包括：

- 语法错误（如未定义的变量）
- 潜在逻辑错误（如 `==` 代替 `===`）
- 代码风格问题（如缩进、引号、分号）
- 最佳实践建议（如禁止 `eval`）

ESLint 的核心能力来自于**规则**（rules），每条规则都可以配置为 `off`、`warn`、`error`，并支持自定义规则和插件扩展。

### 1.2 安装与初始化

在项目根目录下执行：

```bash
npm install eslint --save-dev
# 或使用 pnpm/yarn
pnpm add eslint -D
```

初始化 ESLint 配置：

```bash
npx eslint --init
```

初始化向导会询问：

- 如何使用 ESLint？（检查语法、发现问题、强制代码风格）
- 项目使用哪种模块系统？（ES modules / CommonJS）
- 使用什么框架？（React / Vue / None）
- 是否使用 TypeScript？
- 代码运行环境？（浏览器 / Node）
- 希望生成什么格式的配置文件？（JavaScript / YAML / JSON）

选择完成后，ESLint 会自动安装必要的依赖，并在根目录生成 `.eslintrc.js` 配置文件。

### 1.3 核心配置文件解析

一个典型的 `.eslintrc.js` 示例如下（以 React + TypeScript 为例）：

```js
module.exports = {
  env: {
    browser: true,
    es2021: true,
    node: true,
  },
  extends: [
    "eslint:recommended",
    "plugin:react/recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:react-hooks/recommended",
  ],
  parser: "@typescript-eslint/parser",
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
    ecmaVersion: "latest",
    sourceType: "module",
  },
  plugins: ["react", "@typescript-eslint"],
  rules: {
    // 自定义规则
    "no-console": process.env.NODE_ENV === "production" ? "warn" : "off",
    "react/react-in-jsx-scope": "off", // React 17+ 无需引入
    "@typescript-eslint/no-unused-vars": ["error", { argsIgnorePattern: "^_" }],
  },
  settings: {
    react: {
      version: "detect",
    },
  },
};
```

- **env**：指定运行环境，预置全局变量。
- **extends**：继承已有的规则集，避免重复配置。
- **parser**：指定解析器，TypeScript 项目需使用 `@typescript-eslint/parser`。
- **plugins**：加载第三方插件，提供额外规则。
- **rules**：覆盖继承的规则或新增自定义规则。

### 1.4 常用规则推荐

- `no-console`：生产环境禁止 `console.log`，避免日志泄露。
- `eqeqeq`：强制使用 `===` 和 `!==`，减少类型转换导致的意外。
- `no-unused-vars`：禁止未使用的变量，保持代码整洁。
- `curly`：要求 `if`、`else` 等语句必须使用花括号，避免歧义。

---

## 二、Prettier：代码格式化的神器

### 2.1 为什么需要 Prettier？

ESLint 虽然可以处理部分格式问题，但其主要定位是**逻辑质量**。如果完全依赖 ESLint 进行格式化，配置会异常繁琐，且不同开发者可能因个人习惯而产生无意义的争议。Prettier 则专注于**格式化**，以一种“固执己见”的方式自动统一代码风格，将开发者从格式争论中解放出来。

### 2.2 安装与配置

```bash
pnpm add prettier -D
```

在项目根目录创建 `.prettierrc`（或 `.prettierrc.js`），定义格式化规则：

```json
{
  "semi": false, // 不使用分号
  "singleQuote": true, // 使用单引号
  "tabWidth": 2, // 缩进2个空格
  "trailingComma": "es5", // 多行时添加尾随逗号（ES5兼容）
  "printWidth": 100, // 单行最大字符数
  "bracketSpacing": true, // 对象花括号内侧加空格 { foo: bar }
  "arrowParens": "avoid" // 箭头函数参数只有一个时省略括号
}
```

Prettier 的配置项非常精简，旨在保持“少就是多”的理念。也可以使用 `.prettierignore` 文件排除不需要格式化的目录（如 `node_modules`、`dist`）。

### 2.3 运行 Prettier

```bash
# 检查格式差异
npx prettier --check src/

# 自动格式化所有文件
npx prettier --write src/
```

---

## 三、ESLint 与 Prettier 的“和平共处”

### 3.1 冲突的产生

由于 ESLint 也包含部分风格规则（如 `max-len`、`quotes`、`comma-dangle`），这些规则可能与 Prettier 的配置产生冲突，导致保存时反复报错。解决方案是：**关闭 ESLint 中所有与格式相关的规则，将格式化全权交给 Prettier**。

### 3.2 使用 `eslint-config-prettier`

`eslint-config-prettier` 是一个 ESLint 配置，它会关闭所有可能与 Prettier 冲突的规则。

安装：

```bash
pnpm add -D eslint-config-prettier
```

在 `.eslintrc.js` 的 `extends` 数组中，将 `prettier` 放在**最后**，以确保它覆盖其他配置中的冲突规则：

```js
extends: [
  'eslint:recommended',
  'plugin:react/recommended',
  'plugin:@typescript-eslint/recommended',
  'prettier', // 必须放在最后
],
```

此时，ESLint 将不再报告任何格式问题，格式化完全由 Prettier 负责。

### 3.3 可选：使用 `eslint-plugin-prettier`

如果希望 ESLint 直接以 Prettier 的规则作为报错或警告，可以安装 `eslint-plugin-prettier`，并在 rules 中添加 `'prettier/prettier': 'error'`。但这种做法会让 ESLint 承担格式化的职责，不如直接用 Prettier 独立运行来得纯粹，一般推荐仅使用 `eslint-config-prettier` 关闭冲突，然后分别调用 ESLint 和 Prettier。

---

## 四、编辑器集成：让规范自动化

### 4.1 VS Code 配置

为了让开发者在编码时实时感知规范，并自动修复格式问题，需要在 VS Code 中安装插件：

- **ESLint** (Microsoft)
- **Prettier** (Prettier)

然后配置 `.vscode/settings.json`（项目级配置），实现保存时自动格式化：

```json
{
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "[javascript]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "[typescript]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "[javascriptreact]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "[typescriptreact]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "[vue]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  }
}
```

这样，每次保存文件时，Prettier 会先执行格式化，ESLint 再执行自动修复，保证最终代码既美观又无质量警告。

### 4.2 其他编辑器

WebStorm 等 IDE 也支持内置的 ESLint 和 Prettier 集成，只需在设置中开启“保存时自动运行”即可。

---

## 五、团队协作：Git Hooks 强制规范

仅靠个人自觉难以保证团队所有成员都遵守规范，因此需要在 Git 提交前进行强制检查。**husky + lint-staged** 是目前最成熟的方案。

### 5.1 安装 husky 与 lint-staged

```bash
pnpm add -D husky lint-staged
```

### 5.2 初始化 husky

```bash
npx husky install
```

在 `package.json` 中添加脚本，使其他成员安装依赖后自动启用 husky：

```json
"scripts": {
  "prepare": "husky install"
}
```

### 5.3 添加 pre-commit hook

```bash
npx husky add .husky/pre-commit "npx lint-staged"
```

### 5.4 配置 lint-staged

在 `package.json` 或单独的 `.lintstagedrc` 文件中，定义对暂存区文件的操作：

```json
{
  "*.{js,jsx,ts,tsx,vue}": ["eslint --fix", "prettier --write"],
  "*.{json,css,scss,md}": ["prettier --write"]
}
```

这样，当开发者执行 `git commit` 时，lint-staged 会自动对暂存的文件运行 ESLint 修复和 Prettier 格式化，确保提交的代码完全符合规范。如果 ESLint 检查出错误，提交将被阻止，从而避免不规范代码进入仓库。

---

## 六、进阶：TypeScript 与框架专用配置

### 6.1 TypeScript 支持

对于 TypeScript 项目，需要安装相关依赖：

```bash
pnpm add -D @typescript-eslint/parser @typescript-eslint/eslint-plugin
```

在 `.eslintrc` 中配置：

```js
parser: '@typescript-eslint/parser',
plugins: ['@typescript-eslint'],
extends: [
  'plugin:@typescript-eslint/recommended',
  // 其他...
],
```

同时确保 Prettier 也能正确处理 TypeScript 文件，无需额外配置。

### 6.2 Vue 项目

Vue 项目需安装 `eslint-plugin-vue`，并配置解析器为 `vue-eslint-parser`：

```bash
pnpm add -D eslint-plugin-vue vue-eslint-parser
```

`.eslintrc` 示例：

```js
parser: 'vue-eslint-parser',
parserOptions: {
  parser: '@typescript-eslint/parser',
  ecmaVersion: 'latest',
  sourceType: 'module',
},
extends: [
  'plugin:vue/vue3-recommended',
  '@vue/typescript/recommended',
  'prettier',
],
```

### 6.3 React 项目

React 17+ 不再需要显式引入 React，可关闭 `react/react-in-jsx-scope` 规则。同时开启 `react-hooks` 插件，确保 Hook 使用符合规范。

---

## 七、总结

从工程化角度来看，代码规范不是一纸空文，而是通过工具链落地到开发流程中的约束。ESLint 与 Prettier 的分工协作，让开发者在编码时获得即时反馈，在提交时强制统一，从而保证整个项目的代码质量和风格一致性。

通过本文介绍的配置方案，你可以快速为任何前端项目建立起一套完整的规范体系：

1. **ESLint**：负责代码质量检查，配置合理的规则集。
2. **Prettier**：负责代码格式化，统一视觉风格。
3. **集成编辑器**：实现保存时自动修复，提升开发体验。
4. **Git Hooks**：在提交前强制校验，杜绝不规范代码进入仓库。

当规范成为习惯，团队协作便能更加高效，代码维护成本大幅降低。在工程化的道路上，ESLint + Prettier 是每一位前端开发者都应掌握的必修课。

---

**参考文献**

- [ESLint 官方文档](https://eslint.org/)
- [Prettier 官方文档](https://prettier.io/)
- [husky](https://typicode.github.io/husky/)
- [lint-staged](https://github.com/okonet/lint-staged)
