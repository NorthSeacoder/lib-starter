# 远程模板仓库 - 快速概览

> 📦 为 @nsea/starter 引入远程模板仓库的核心价值与实施路径

---

## 为什么需要远程模板仓库？

### 核心问题

当前所有模板都与主仓库耦合，带来以下问题：

1. **包体积膨胀**: 每个模板增加 CLI 包大小
2. **发布耦合**: 模板更新需要发布新的 CLI 版本
3. **扩展困难**: 社区难以贡献模板
4. **企业场景**: 无法使用内部私有模板

### 解决方案价值

| 价值点          | 说明                             | 影响    |
| --------------- | -------------------------------- | ------- |
| 🎯 **解耦**     | 模板独立管理，CLI 保持轻量       | 🔴 关键 |
| 🚀 **性能**     | 按需下载，减少 50%+ 安装时间     | 🟡 重要 |
| 🤝 **生态**     | 社区可贡献，形成模板市场         | 🟢 增强 |
| 🔒 **安全**     | Checksum 校验、签名、安全扫描    | 🔴 关键 |
| 📦 **企业支持** | 私有 Registry、内网部署          | 🟡 重要 |
| 🔄 **版本管理** | 模板独立版本，灵活升级           | 🟢 增强 |
| 💡 **开发体验** | 模板开发者工作流独立，迭代速度快 | 🟢 增强 |
| 📊 **可观测性** | 模板下载统计、使用分析           | 🟢 增强 |

---

## 架构概览

```
CLI 客户端 (轻量级)
    ↓ 按需下载
官方模板仓库 (独立)
    ├── library-default
    ├── cli-default
    └── monorepo-default
    ↓ 发布到
npm Registry / GitHub Releases
    ↓ 可选镜像
CDN / 国内镜像 (加速)
```

---

## 支持的模板来源

| 类型            | 格式示例                                 | 优先级 | 用途      |
| --------------- | ---------------------------------------- | ------ | --------- |
| 官方模板        | `library-default`                        | P0     | 默认推荐  |
| npm 包          | `npm:@company/template@1.0.0`            | P0     | 稳定分发  |
| GitHub 仓库     | `github:user/repo#main`                  | P0     | 开源协作  |
| Git 仓库        | `git:https://gitlab.com/user/repo.git`   | P1     | 内网/私有 |
| 本地路径        | `file:../my-template`                    | P1     | 本地开发  |
| 自定义 Registry | `registry:https://templates.company.com` | P2     | 企业私有  |

---

## 核心模块

### 1. TemplateLoader (模板加载器)

- 解析模板标识符 (`library-default`, `npm:...`, `github:...`)
- 根据类型选择加载策略
- 验证模板完整性和安全性

### 2. TemplateCache (缓存管理)

- 本地缓存模板（`~/.starter/cache`）
- 自动过期检测（默认 24 小时）
- 提供缓存清理和更新命令

### 3. TemplateRegistry (注册表)

- 维护官方模板元信息（`registry.json`）
- 支持搜索、分类、标签过滤
- 版本管理和更新检查

### 4. TemplateSecurity (安全校验)

- Checksum 校验（sha256）
- 可疑文件扫描（.exe, .sh 等）
- 代码模式检测（eval, exec 等）

---

## 安全保障

| 措施            | 实施方式               | 防护等级 |
| --------------- | ---------------------- | -------- |
| Checksum 校验   | sha256 哈希验证        | 🔴 必需  |
| HTTPS 传输      | 所有下载强制 HTTPS     | 🔴 必需  |
| 安全扫描        | 扫描可疑文件和代码模式 | 🟡 推荐  |
| 模板签名 (可选) | GPG 签名验证           | 🟢 增强  |
| 来源白名单      | 限制可信来源           | 🟡 推荐  |
| 沙箱执行 (可选) | 隔离执行模板钩子脚本   | 🟢 增强  |

---

## 典型使用场景

### 场景 1: 使用官方模板

```bash
# 最简单 - 使用官方默认模板
pnpm create @nsea/starter my-lib

# 指定官方模板
pnpm create @nsea/starter my-lib --template cli-default

# 指定版本
pnpm create @nsea/starter my-lib --template library-default@1.2.0
```

### 场景 2: 使用 npm 包模板

```bash
# 使用第三方 npm 包模板
pnpm create @nsea/starter my-app --template npm:@company/template-react

# 指定版本
pnpm create @nsea/starter my-app --template npm:@company/template-react@2.0.0
```

### 场景 3: 使用 GitHub 模板

```bash
# 使用 GitHub 仓库
pnpm create @nsea/starter my-app --template github:facebook/create-react-app

# 指定分支/标签
pnpm create @nsea/starter my-app --template github:vercel/next.js#canary

# Monorepo 子路径
pnpm create @nsea/starter my-app --template github:vercel/turborepo/examples/basic
```

### 场景 4: 企业内网模板

```bash
# 配置私有 Registry
echo '{ "registries": [{"name": "company", "url": "https://templates.company.com"}] }' > .starterrc.json

# 使用内网 GitLab
pnpm create @nsea/starter my-app --template gitlab:company/templates/backend

# 使用本地模板（开发测试）
pnpm create @nsea/starter my-app --template file:../my-custom-template
```

---

## 模板管理命令

```bash
# 列出所有官方模板
starter template list

# 搜索模板
starter template search react

# 查看模板详情
starter template info library-default

# 添加自定义模板
starter template add my-template github:user/my-template

# 查看缓存
starter template cache list

# 清空缓存
starter template cache clear

# 更新模板
starter template update library-default
starter template update --all
```

---

## 实施路线图

### Phase 0: 设计与规划 ✅

- [x] 完成远程模板架构设计
- [x] 定义模板规范和元信息格式
- [x] 确定安全策略和版本管理方案

### Phase 4: 核心实现 (预计 3 周)

1. **Week 1: 基础架构**
   - 实现 TemplateLoader、TemplateCache、TemplateRegistry
   - 支持官方、npm、GitHub 三种来源
   - 实现 Checksum 校验

2. **Week 2: CLI 集成**
   - 实现 `template` 命令集
   - 在 `create` 命令中集成远程加载
   - 完善缓存管理功能

3. **Week 3: 官方仓库**
   - 创建 `@nsea/starter-templates` 仓库
   - 迁移和发布官方模板
   - 创建 registry.json 和文档

---

## 性能优化

| 优化项   | 方案                             | 提升   |
| -------- | -------------------------------- | ------ |
| 缓存机制 | 本地缓存，24 小时有效期          | 90%+   |
| 并行下载 | 批量下载时并发执行（p-limit）    | 3x     |
| 增量更新 | 只下载变更的文件                 | 50%+   |
| CDN 镜像 | 国内镜像加速（ghproxy, npm镜像） | 5x-10x |
| 按需加载 | CLI 不打包模板，减少包体积       | 50%+   |

---

## 企业部署指南

### 方案 1: 使用 npm 私有 Registry

```json
// .npmrc
@company:registry=https://npm.company.com
//npm.company.com/:_authToken=${NPM_TOKEN}
```

```bash
# 发布企业模板
npm publish --registry https://npm.company.com

# 使用企业模板
starter create my-app --template npm:@company/template-backend
```

### 方案 2: 使用内网 Git 仓库

```bash
# GitLab
starter create my-app --template gitlab:company/templates/fullstack

# Gitea/Gogs
starter create my-app --template git:https://git.company.com/templates/react.git
```

### 方案 3: 部署私有 Registry 服务

```typescript
// 提供 API: GET /api/v1/templates
// 返回企业模板列表和元信息
```

---

## FAQ

### Q1: 远程模板如何保证安全？

A: 多重安全机制：

- Checksum 校验（sha256 哈希）
- HTTPS 强制传输
- 安全扫描（可疑文件、代码模式）
- 官方模板经过审核

### Q2: 模板下载慢怎么办？

A: 性能优化方案：

- 启用本地缓存（默认开启）
- 配置国内镜像（ghproxy, npm 镜像）
- 使用 CDN 加速

### Q3: 如何贡献模板到官方仓库？

A: 贡献流程：

1. Fork `@nsea/starter-templates` 仓库
2. 在 `packages/` 下创建模板
3. 添加 `template.json` 元信息
4. 提交 PR，通过审核后合并

### Q4: 企业内网如何使用？

A: 三种方案：

- 使用 `file:` 本地路径
- 配置内网 Git 仓库
- 部署私有 npm Registry

### Q5: 模板缓存占用空间大吗？

A: 管理建议：

- 单个模板通常 < 10MB
- 缓存自动过期（24 小时）
- 可手动清理：`starter template cache clear`

---

## 相关文档

- 📘 **详细设计**: [`docs/remote-template-registry.md`](./remote-template-registry.md)
- 📋 **任务拆解**: [`docs/TASKS.md`](./TASKS.md) - Phase 4 相关任务
- 📦 **PRD**: [`docs/PRD.md`](./PRD.md) - 产品需求文档

---

## 下一步行动

1. ✅ Review 远程模板设计方案
2. ⏳ 开始实施 P4-T4-4: 远程模板基础架构
3. ⏳ 创建 `@nsea/starter-templates` 独立仓库
4. ⏳ 迁移现有模板并发布到 npm

---

**文档维护者**: Tech Lead  
**最后更新**: 2024-11  
**版本**: v1.0
