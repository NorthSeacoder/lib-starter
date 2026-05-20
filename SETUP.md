# 🚀 快速配置指南 | Quick Setup Guide

## 📋 配置清单 | Configuration Checklist

### 1. 基础项目配置 | Basic Project Configuration

- [ ] 修改 `package.json` 中的项目信息
  - [ ] `name`
  - [ ] `description`
  - [ ] `author`
  - [ ] `repository`
  - [ ] `homepage`
  - [ ] `bugs`

- [ ] 更新 `README.md`
  - [ ] 修改项目标题和描述
  - [ ] 更新 badges 中的仓库地址
  - [ ] 添加项目特定的使用说明

- [ ] 更新 `LICENSE` 文件中的版权信息

### 2. GitHub 与 npm 配置 | GitHub and npm Setup

#### 必需的 Secrets | Required Secrets

- [ ] **`CODECOV_TOKEN`** - Codecov 上传令牌

  ```bash
  # 1. 访问 https://codecov.io
  # 2. 使用 GitHub 账号登录
  # 3. 添加你的仓库
  # 4. 复制 Repository Upload Token
  # 5. 添加到 GitHub Secrets
  ```

#### 推荐发布方式 | Recommended Publishing Setup

- [ ] 首次手动发布一次包，创建 npm package

  ```bash
  pnpm ci
  npm publish --access public
  ```

- [ ] 在 npm 后台启用 **Trusted Publisher**
  - 打开你的 npm package 页面
  - 进入 package settings / publishing settings
  - 连接对应的 GitHub 仓库作为 Trusted Publisher

- [ ] 确认 GitHub Actions release workflow 已启用

#### 分支保护规则 | Branch Protection Rules

- [ ] 为 `main` 设置分支保护
  - Require a pull request before merging
  - Require status checks to pass before merging
  - Require branches to be up to date before merging

### 3. 本地开发环境 | Local Development Environment

- [ ] 安装依赖

  ```bash
  pnpm install
  ```

- [ ] 配置 Git Hooks

  ```bash
  pnpm prepare
  ```

- [ ] 验证开发环境

  ```bash
  pnpm lint:check
  pnpm typecheck
  pnpm test
  pnpm build
  pnpm check-exports
  ```

### 4. 可选配置 | Optional Configuration

#### 4.1 自定义 CLI 命令名称 | Custom CLI Name

- [ ] 修改 `package.json` 中的 `bin` 字段
- [ ] 更新 `README.md` 中的 CLI 使用示例

#### 4.2 调整 CI 策略 | Adjust CI Strategy

当前默认策略：

- CI：Node.js 22 × Ubuntu / Windows / macOS
- Release：推送 `v*` tag 时触发
- `pnpm-workspace.yaml`：仅用于记录 `allowBuilds`，不是 monorepo 配置

如需更多 Node 版本验证，可在 `.github/workflows/ci.yml` 中扩展 matrix。

#### 4.3 配置发布策略 | Configure Release Strategy

- [ ] 调整 `bumpp` 使用方式（如需）
- [ ] 约定 tag 版本规则
- [ ] 根据需要补充 CHANGELOG 流程

## 🔍 验证配置 | Verify Configuration

### 本地验证 | Local Verification

```bash
pnpm ci
pnpm start --help
pnpm check-exports
```

### GitHub Actions 验证 | GitHub Actions Verification

```bash
git add .
git commit -m "feat: initial setup"
git push origin main

# 然后查看:
# https://github.com/your-username/your-repo/actions
```

### 发布验证 | Release Verification

```bash
pnpm release
git push origin --follow-tags
```

确认 `Release` workflow 成功并完成 npm 发布。

## 🎯 下一步 | Next Steps

- [ ] 开始开发你的库功能
- [ ] 补充测试用例
- [ ] 完善文档
- [ ] 发布第一个正式版本

## 🆘 需要帮助？ | Need Help?

- 查看 [README.md](./README.md)
- 查看 [Issues](https://github.com/NorthSeacoder/lib-starter/issues)
- 创建新的 Issue 报告问题

---

**提示**: 完成所有配置后，可以删除此 `SETUP.md` 文件。  
**Tip**: After finishing setup, you can delete this `SETUP.md` file.
