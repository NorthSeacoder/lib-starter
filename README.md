# TypeScript Library Starter

> 🚀 现代化 TypeScript 库开发模板 | Modern TypeScript Library Development Template

[![CI](https://github.com/NorthSeacoder/lib-starter/workflows/CI/badge.svg)](https://github.com/NorthSeacoder/lib-starter/actions)
[![codecov](https://codecov.io/gh/NorthSeacoder/lib-starter/branch/main/graph/badge.svg)](https://codecov.io/gh/NorthSeacoder/lib-starter)
[![npm version](https://badge.fury.io/js/%40nsea%2Fstarter.svg)](https://badge.fury.io/js/%40nsea%2Fstarter)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

一个保持单包风格、同时采用当前主流工具链的 TypeScript 库开发模板。

A single-package TypeScript library starter that keeps a familiar template style while adopting current mainstream tooling.

## ✨ 核心特性 | Features

### 中文

- **🔧 当前主流工具链**：基于 Node.js 22+、TypeScript 6.0+、Vitest、tsdown
- **📦 双格式输出**：支持 ESM、CJS 双格式库产物
- **🧪 完整质量检查**：Vitest、类型检查、ESLint、Prettier、包导出校验
- **🚀 现代发布链路**：`bumpp + CI release + npm Trusted Publisher`
- **🎯 CLI 支持**：内置 CLI 入口，可同时作为库和命令行工具模板
- **📝 风格保留**：保留原有模板的单包结构与自定义配置风格

### English

- **🔧 Current Mainstream Tooling**: Built on Node.js 22+, TypeScript 6.0+, Vitest, and tsdown
- **📦 Dual Output Formats**: Supports both ESM and CJS library artifacts
- **🧪 Full Quality Checks**: Vitest, type checking, ESLint, Prettier, and package export validation
- **🚀 Modern Release Flow**: `bumpp + CI release + npm Trusted Publisher`
- **🎯 CLI Ready**: Includes a CLI entry so the starter works for both libraries and command-line tools
- **📝 Familiar Style**: Preserves the original single-package structure and custom configuration style

## 🚀 快速开始 | Quick Start

### 环境要求 | Requirements

- **Node.js**: `>= 22`
- **pnpm**: `>= 10`

### 使用模板 | Using Template

```bash
git clone https://github.com/NorthSeacoder/lib-starter.git my-lib
cd my-lib
pnpm install
pnpm dev
```

## 🧰 常用命令 | Common Commands

```bash
# 开发模式（CLI）
pnpm dev

# 构建项目
pnpm build

# 运行测试
pnpm test

# 类型检查
pnpm typecheck

# 代码检查
pnpm lint

# 检查包导出与包结构
pnpm check-exports

# 完整 CI 流程
pnpm ci
```

## 🔐 CI/CD 配置 | CI/CD Configuration

### 推荐发布方式 | Recommended Publishing

默认推荐使用 **npm Trusted Publisher + GitHub OIDC**，而不是长期保存 `NPM_TOKEN`。

This starter recommends **npm Trusted Publisher + GitHub OIDC** instead of a long-lived `NPM_TOKEN`.

### GitHub Secrets 配置 | GitHub Secrets Setup

#### 必需的 Secrets | Required Secrets

1. **`CODECOV_TOKEN`** - Codecov 上传令牌 | Codecov Upload Token

   ```bash
   # 1. 访问 https://codecov.io
   # 2. 使用 GitHub 账号登录
   # 3. 添加你的仓库
   # 4. 复制 Repository Upload Token
   ```

   - 用途：上传测试覆盖率报告到 Codecov
   - Purpose: Upload coverage reports to Codecov

#### npm Trusted Publisher 配置 | npm Trusted Publisher Setup

1. 首次手动发布一次包，创建 npm package
2. 打开 npm package 设置页
3. 将 GitHub 仓库连接为 Trusted Publisher
4. 后续通过 Git tag 触发 GitHub Actions 发布

5. Publish the package once manually to create it on npm
6. Open the package settings on npm
7. Connect the GitHub repository as a Trusted Publisher
8. Use Git tags to trigger future GitHub Actions releases

### CI/CD 流程说明 | CI/CD Pipeline Overview

#### CI 阶段 | CI Stage

- **触发条件**: `push` 到 `main` 或 `pull_request`
- **运行内容**: lint、format check、typecheck、test coverage、build、package checks
- **测试环境**: Node.js 22 × Ubuntu / Windows / macOS

#### Release 阶段 | Release Stage

- **触发条件**: 推送 `v*` tag
- **发布方式**: GitHub Actions + npm Trusted Publisher / OIDC
- **发布命令**: `pnpm release:publish`

## 📦 发布流程 | Release Workflow

### 本地版本提升 | Local Version Bump

```bash
pnpm release
```

`bumpp` 会更新版本号并引导你创建对应 tag。推送 tag 后会触发发布工作流。

`bumpp` updates the version and helps you create the matching tag. Pushing the tag triggers the publish workflow.

### 首次发布 | First Publish

如果包还没有在 npm 上存在，先手动运行一次：

If the package does not yet exist on npm, publish it manually once:

```bash
pnpm ci
npm publish --access public
```

然后到 npm 后台为该包启用 Trusted Publisher。

Then enable Trusted Publisher for the package in npm settings.

## 📋 项目结构 | Project Structure

```text
lib-starter/
├── src/                    # 源代码 | Source code
│   ├── cli/                # CLI 相关 | CLI related
│   ├── types/              # 类型定义 | Type definitions
│   ├── index.ts            # 库入口 | Library entry
│   └── starter.ts          # 核心功能 | Core functionality
├── bin/                    # CLI 可执行文件 | CLI executables
├── dist/                   # 构建输出 | Build output
├── package.json            # 项目配置 | Project config
├── tsconfig.json           # TS 配置 | TS config
├── tsdown.config.ts        # 构建配置 | Build config
└── vitest.config.ts        # 测试配置 | Test config
```

## 🛠️ 技术栈 | Tech Stack

### 核心工具 | Core Tools

- **TypeScript 6.0+** - 类型安全的 JavaScript | Type-safe JavaScript
- **tsdown** - 当前主流的库构建工具之一 | A current mainstream bundler for TypeScript libraries
- **Vitest** - 现代化测试框架 | Modern testing framework
- **Commander.js** - CLI 框架 | CLI framework

### 开发工具 | Development Tools

- **tsx** - TypeScript 运行时 | TypeScript runtime
- **@vitest/ui** - 测试 UI 界面 | Test UI interface
- **bumpp** - 版本管理 | Version management
- **rimraf** - 跨平台文件删除 | Cross-platform file cleanup

### 质量保证 | Quality Assurance

- **typescript-eslint** - 现代 TypeScript linting | Modern TypeScript linting
- **@arethetypeswrong/cli** - 类型导出检查 | Type export validation
- **publint** - 包结构与发布质量检查 | Package structure validation
- **Prettier** - 代码格式化 | Code formatting

## 📝 使用指南 | Usage Guide

### 作为库使用 | Using as Library

```typescript
import { starter, starterAsync } from '@nsea/starter'
import type { StarterOptions } from '@nsea/starter'
```

### 作为 CLI 使用 | Using as CLI

```bash
starter --help
starter --verbose
```

## 🔍 验证建议 | Verification Tips

```bash
# 运行完整校验
pnpm ci

# 测试 CLI
pnpm start --help

# 检查导出
pnpm check-exports
```

## 📚 文档 | Documentation

### 核心文档 | Core Documents

- 📘 **[仓库分析报告](./docs/REPO-ANALYSIS.md)** - 从多角度深入分析代码现状与优化方向
- 📋 **[产品需求文档 (PRD)](./docs/PRD.md)** - 完整的产品定位、功能规划与里程碑
- 🗂️ **[任务拆解文档](./docs/TASKS.md)** - 详细的开发任务与实施路线图
- 🚀 **[仓库优化计划](./docs/OPTIMIZATION-PLAN.md)** - 先优化本仓库为 ts-lib，再扩展模板功能（推荐阅读）

### 技术设计 | Technical Design

- 📦 **[轻量级模板仓库方案](./docs/template-repository-simple.md)** - 简单实用的 Git 模板仓库方案（推荐）
- 🎯 **[远程模板完整方案](./docs/remote-template-registry.md)** - 完整的多源模板架构（可选参考）

### 开发指南 | Development Guides

- 🔄 **[开发工作流](./docs/development-workflow.md)** - 开发、测试、发布流程
- 📖 **[ESM/CJS 兼容性](./docs/esm-cjs-compatibility.md)** - 双格式构建最佳实践

## 📚 参考说明 | Notes

- 该模板保持单包结构，不默认引入 monorepo 约束
- 默认不使用 pnpm catalogs
- 根目录的 `pnpm-workspace.yaml` 仅用于 `pnpm 10/11` 的 `allowBuilds` 配置，不表示该模板采用 monorepo/workspace 结构
- 默认不依赖第三方整套 ESLint 风格预设

## 📄 License

[MIT](./LICENSE)
