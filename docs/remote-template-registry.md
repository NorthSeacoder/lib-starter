# 远程模板仓库设计方案

> 📦 为 @nsea/starter 设计分布式模板管理系统  
> 🌐 支持官方仓库、社区贡献与企业私有模板  
> 🔐 强调安全、版本控制与可扩展性

---

## 1. 背景与目标

### 1.1 为什么需要远程模板仓库？

**当前痛点：**

- 模板与主仓库耦合，每次添加模板需要发布新版本
- 模板体积大，影响 CLI 包大小和下载速度
- 用户无法轻松贡献和分享自定义模板
- 企业内部模板难以管理和复用

**目标：**

- 🎯 **解耦**: 模板独立于主仓库，按需下载
- 🚀 **性能**: 减少 CLI 包体积，加速安装
- 🤝 **生态**: 社区可贡献模板，形成生态
- 🔒 **安全**: 模板来源可信，支持签名验证
- 📦 **企业**: 支持私有模板仓库
- 🔄 **版本**: 模板独立版本管理，支持升级

---

## 2. 架构设计

### 2.1 整体架构

```
┌─────────────────────────────────────────────────────────────┐
│                         CLI Client                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │   Template   │  │    Cache     │  │  Validator   │      │
│  │    Loader    │  │   Manager    │  │  (Checksum)  │      │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
└────────────┬────────────────┬────────────────┬─────────────┘
             │                │                │
             │                │                │
┌────────────▼────────────────▼────────────────▼─────────────┐
│                      Registry API                           │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │   Metadata   │  │   Version    │  │   Security   │      │
│  │   Service    │  │   Control    │  │   Service    │      │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
└────────────┬────────────────┬────────────────┬─────────────┘
             │                │                │
┌────────────▼────────────────▼────────────────▼─────────────┐
│                      Storage Layer                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │   GitHub     │  │   npm CDN    │  │   Custom     │      │
│  │  Releases    │  │   (unpkg)    │  │   S3/OSS     │      │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
└─────────────────────────────────────────────────────────────┘
```

### 2.2 模板来源类型

| 类型             | 格式                                         | 示例                                                     | 优先级 |
| ---------------- | -------------------------------------------- | -------------------------------------------------------- | ------ |
| 官方仓库         | `official/<name>` 或 `<name>`                | `library-default`, `official/cli`                        | P0     |
| npm 包           | `npm:<package>[@version]`                    | `npm:@company/template-react@1.0.0`                      | P0     |
| GitHub 仓库      | `github:<owner>/<repo>[#branch\|tag]`        | `github:facebook/create-react-app#main`                  | P0     |
| Git 仓库         | `git:<url>[#branch\|tag]`                    | `git:https://gitlab.com/user/template.git#v1.0`          | P1     |
| 本地路径         | `file:<path>`                                | `file:../my-template`, `file:/Users/me/templates/custom` | P1     |
| 远程压缩包       | `https://<url>/template.tar.gz`              | `https://example.com/templates/react-v1.0.0.tar.gz`      | P2     |
| 自定义 Registry  | `registry:<url>/<name>[@version]`            | `registry:https://templates.company.com/react@2.0.0`     | P2     |
| Monorepo 子路径  | `github:<owner>/<repo>/<path>[#branch\|tag]` | `github:vercel/turborepo/examples/basic#main`            | P2     |
| GitLab/Bitbucket | `gitlab:<owner>/<repo>`, `bitbucket:...`     | `gitlab:company/templates/backend#production`            | P2     |
| 镜像/代理        | `mirror:<source>[@version]`                  | `mirror:library-default` (从国内镜像拉取)                | P2     |

---

## 3. 官方模板仓库设计

### 3.1 仓库结构

建议创建独立仓库: `@nsea/starter-templates`

```
@nsea/starter-templates/
├── packages/                 # Monorepo 结构
│   ├── library-default/     # 库模板
│   │   ├── template/        # 模板文件
│   │   │   ├── package.json.ejs
│   │   │   ├── src/
│   │   │   └── ...
│   │   ├── template.json    # 模板元信息
│   │   ├── prompts.ts       # 交互问题（可选）
│   │   ├── hooks.ts         # 生命周期钩子（可选）
│   │   ├── README.md        # 模板说明
│   │   └── package.json     # 模板包配置
│   ├── cli-default/         # CLI 模板
│   ├── monorepo-default/    # Monorepo 模板
│   ├── fullstack-nextjs/    # 全栈模板
│   └── backend-nestjs/      # 后端模板
├── .changeset/              # 版本管理
├── pnpm-workspace.yaml      # pnpm workspace
├── registry.json            # 模板注册表（元数据）
├── scripts/
│   ├── publish.ts           # 发布脚本
│   └── verify.ts            # 校验脚本
└── README.md
```

### 3.2 模板元信息格式

`template.json`:

```json
{
  "$schema": "https://starter.nsea.io/schema/template.json",
  "name": "library-default",
  "version": "1.0.0",
  "displayName": "TypeScript Library",
  "description": "A modern TypeScript library template with testing and building tools",
  "author": "NorthSeacoder",
  "keywords": ["typescript", "library", "vitest", "tsup"],
  "category": "library",
  "tags": ["typescript", "esm", "cjs", "testing"],
  "license": "MIT",

  "repository": {
    "type": "git",
    "url": "https://github.com/NorthSeacoder/starter-templates",
    "directory": "packages/library-default"
  },

  "variants": [
    {
      "name": "default",
      "description": "Standard TypeScript library",
      "default": true
    },
    {
      "name": "minimal",
      "description": "Minimal setup without CLI"
    }
  ],

  "engine": {
    "node": ">=20.0.0",
    "pnpm": ">=8.0.0"
  },

  "features": [
    {
      "name": "testing",
      "description": "Include Vitest testing setup",
      "default": true
    },
    {
      "name": "ci",
      "description": "Include GitHub Actions CI/CD",
      "default": true
    },
    {
      "name": "docs",
      "description": "Include documentation setup",
      "default": false
    }
  ],

  "prompts": [
    {
      "name": "projectName",
      "type": "text",
      "message": "Project name",
      "initial": "my-library",
      "validate": "^[a-z0-9-]+$"
    },
    {
      "name": "description",
      "type": "text",
      "message": "Project description",
      "initial": "My awesome TypeScript library"
    },
    {
      "name": "author",
      "type": "text",
      "message": "Author name",
      "initial": "{git.user.name}"
    }
  ],

  "hooks": {
    "onInit": "./hooks.ts#onInit",
    "onAfterRender": "./hooks.ts#onAfterRender"
  },

  "dependencies": {
    "typescript": "^5.5.0",
    "tsup": "^8.0.0",
    "vitest": "^3.0.0"
  },

  "files": {
    "include": ["template/**/*", "template.json", "README.md"],
    "exclude": ["template/node_modules", "template/dist"]
  },

  "checksum": {
    "algorithm": "sha256",
    "hash": "abc123..."
  }
}
```

### 3.3 Registry 注册表格式

`registry.json`:

```json
{
  "version": "1.0.0",
  "updatedAt": "2024-11-15T00:00:00Z",
  "templates": {
    "library-default": {
      "name": "library-default",
      "displayName": "TypeScript Library",
      "description": "Modern TypeScript library template",
      "category": "library",
      "tags": ["typescript", "library"],
      "latest": "1.2.0",
      "versions": {
        "1.2.0": {
          "version": "1.2.0",
          "published": "2024-11-15T00:00:00Z",
          "source": {
            "type": "npm",
            "package": "@nsea/template-library-default",
            "version": "1.2.0"
          },
          "checksum": {
            "sha256": "abc123..."
          }
        },
        "1.1.0": {
          "version": "1.1.0",
          "published": "2024-10-01T00:00:00Z",
          "source": {
            "type": "github",
            "repo": "NorthSeacoder/starter-templates",
            "path": "packages/library-default",
            "tag": "library-default@1.1.0"
          },
          "checksum": {
            "sha256": "def456..."
          }
        }
      },
      "deprecated": false,
      "maintainers": ["NorthSeacoder"]
    },
    "cli-default": {
      "name": "cli-default",
      "displayName": "CLI Application",
      "description": "Command-line tool template",
      "category": "cli",
      "tags": ["cli", "commander"],
      "latest": "1.0.0",
      "versions": {
        "1.0.0": {
          "version": "1.0.0",
          "published": "2024-11-01T00:00:00Z",
          "source": {
            "type": "npm",
            "package": "@nsea/template-cli-default",
            "version": "1.0.0"
          },
          "checksum": {
            "sha256": "ghi789..."
          }
        }
      },
      "deprecated": false,
      "maintainers": ["NorthSeacoder"]
    }
  }
}
```

---

## 4. CLI 实现方案

### 4.1 模板加载器架构

```typescript
// src/template/loader.ts
export interface TemplateSource {
  type: 'official' | 'npm' | 'github' | 'git' | 'file' | 'url'
  identifier: string
  version?: string
  branch?: string
  subpath?: string
}

export interface TemplateLoaderOptions {
  cache?: boolean
  force?: boolean
  timeout?: number
  registry?: string // 自定义 registry URL
  mirrors?: Record<string, string> // 镜像配置
}

export class TemplateLoader {
  private cache: TemplateCache
  private registry: TemplateRegistry

  /**
   * 解析模板字符串为 TemplateSource
   * @example
   * - "library-default" → { type: "official", identifier: "library-default" }
   * - "npm:@company/template@1.0.0" → { type: "npm", identifier: "@company/template", version: "1.0.0" }
   * - "github:user/repo#main" → { type: "github", identifier: "user/repo", branch: "main" }
   */
  parse(input: string): TemplateSource {
    // 实现解析逻辑
  }

  /**
   * 加载模板到本地
   */
  async load(source: TemplateSource, options?: TemplateLoaderOptions): Promise<Template> {
    // 1. 检查缓存
    if (options?.cache && !options?.force) {
      const cached = await this.cache.get(source)
      if (cached) return cached
    }

    // 2. 根据类型加载
    const template = await this.loadByType(source, options)

    // 3. 验证模板
    await this.validate(template)

    // 4. 缓存模板
    if (options?.cache) {
      await this.cache.set(source, template)
    }

    return template
  }

  private async loadByType(
    source: TemplateSource,
    options?: TemplateLoaderOptions
  ): Promise<Template> {
    switch (source.type) {
      case 'official':
        return this.loadOfficial(source, options)
      case 'npm':
        return this.loadNpm(source, options)
      case 'github':
        return this.loadGitHub(source, options)
      case 'git':
        return this.loadGit(source, options)
      case 'file':
        return this.loadFile(source, options)
      case 'url':
        return this.loadUrl(source, options)
      default:
        throw new Error(`Unsupported template source type: ${source.type}`)
    }
  }

  /**
   * 从官方仓库加载
   */
  private async loadOfficial(
    source: TemplateSource,
    options?: TemplateLoaderOptions
  ): Promise<Template> {
    // 从 registry 获取元信息
    const metadata = await this.registry.getTemplate(source.identifier, source.version)

    // 根据 source 类型下载
    if (metadata.source.type === 'npm') {
      return this.loadNpm(
        {
          type: 'npm',
          identifier: metadata.source.package,
          version: metadata.source.version,
        },
        options
      )
    } else if (metadata.source.type === 'github') {
      return this.loadGitHub(
        {
          type: 'github',
          identifier: metadata.source.repo,
          branch: metadata.source.tag,
          subpath: metadata.source.path,
        },
        options
      )
    }

    throw new Error('Invalid official template source')
  }

  /**
   * 从 npm 加载
   */
  private async loadNpm(
    source: TemplateSource,
    options?: TemplateLoaderOptions
  ): Promise<Template> {
    // 使用 pacote 下载 npm 包
    const tarball = await this.downloadNpmPackage(source.identifier, source.version, options)
    return this.extractTemplate(tarball)
  }

  /**
   * 从 GitHub 加载
   */
  private async loadGitHub(
    source: TemplateSource,
    options?: TemplateLoaderOptions
  ): Promise<Template> {
    // 使用 GitHub API 或 git clone 下载
    const tempDir = await this.cloneGitHubRepo(source, options)
    return this.extractTemplate(tempDir)
  }

  /**
   * 从 Git 仓库加载
   */
  private async loadGit(
    source: TemplateSource,
    options?: TemplateLoaderOptions
  ): Promise<Template> {
    const tempDir = await this.cloneGitRepo(source, options)
    return this.extractTemplate(tempDir)
  }

  /**
   * 从本地路径加载
   */
  private async loadFile(
    source: TemplateSource,
    options?: TemplateLoaderOptions
  ): Promise<Template> {
    const resolvedPath = path.resolve(source.identifier)
    if (!(await fs.pathExists(resolvedPath))) {
      throw new Error(`Template path not found: ${resolvedPath}`)
    }
    return this.extractTemplate(resolvedPath)
  }

  /**
   * 从远程 URL 加载
   */
  private async loadUrl(
    source: TemplateSource,
    options?: TemplateLoaderOptions
  ): Promise<Template> {
    const tempFile = await this.downloadFile(source.identifier, options)
    return this.extractTemplate(tempFile)
  }

  /**
   * 验证模板完整性和安全性
   */
  private async validate(template: Template): Promise<void> {
    // 1. 校验 template.json 格式
    if (!template.metadata) {
      throw new Error('Missing template.json')
    }

    // 2. 校验 checksum
    if (template.metadata.checksum) {
      const actualHash = await this.calculateHash(template)
      if (actualHash !== template.metadata.checksum.hash) {
        throw new Error('Template checksum verification failed')
      }
    }

    // 3. 安全扫描（可选）
    await this.securityScan(template)
  }
}
```

### 4.2 缓存管理

```typescript
// src/template/cache.ts
export class TemplateCache {
  private cacheDir: string

  constructor(cacheDir: string = '~/.starter/cache') {
    this.cacheDir = path.resolve(os.homedir(), cacheDir)
  }

  /**
   * 获取缓存路径
   */
  private getCachePath(source: TemplateSource): string {
    const key = this.generateKey(source)
    return path.join(this.cacheDir, key)
  }

  /**
   * 生成缓存键
   */
  private generateKey(source: TemplateSource): string {
    const str = `${source.type}:${source.identifier}@${source.version || 'latest'}`
    return crypto.createHash('md5').update(str).digest('hex')
  }

  /**
   * 获取缓存
   */
  async get(source: TemplateSource): Promise<Template | null> {
    const cachePath = this.getCachePath(source)

    if (!(await fs.pathExists(cachePath))) {
      return null
    }

    // 检查缓存是否过期
    const stats = await fs.stat(cachePath)
    const age = Date.now() - stats.mtimeMs
    const maxAge = 24 * 60 * 60 * 1000 // 24 小时

    if (age > maxAge) {
      await this.delete(source)
      return null
    }

    // 读取缓存
    const metadata = await fs.readJSON(path.join(cachePath, 'template.json'))
    return {
      path: cachePath,
      metadata,
    }
  }

  /**
   * 设置缓存
   */
  async set(source: TemplateSource, template: Template): Promise<void> {
    const cachePath = this.getCachePath(source)

    // 复制模板到缓存目录
    await fs.ensureDir(cachePath)
    await fs.copy(template.path, cachePath, {
      overwrite: true,
      dereference: true,
    })

    // 记录元信息
    await fs.writeJSON(
      path.join(cachePath, '.cache-meta.json'),
      {
        source,
        cachedAt: new Date().toISOString(),
      },
      { spaces: 2 }
    )
  }

  /**
   * 删除缓存
   */
  async delete(source: TemplateSource): Promise<void> {
    const cachePath = this.getCachePath(source)
    await fs.remove(cachePath)
  }

  /**
   * 清空所有缓存
   */
  async clear(): Promise<void> {
    await fs.remove(this.cacheDir)
  }

  /**
   * 列出所有缓存
   */
  async list(): Promise<
    Array<{
      source: TemplateSource
      cachedAt: string
      size: number
    }>
  > {
    if (!(await fs.pathExists(this.cacheDir))) {
      return []
    }

    const caches = await fs.readdir(this.cacheDir)
    const results = []

    for (const cache of caches) {
      const cachePath = path.join(this.cacheDir, cache)
      const metaPath = path.join(cachePath, '.cache-meta.json')

      if (await fs.pathExists(metaPath)) {
        const meta = await fs.readJSON(metaPath)
        const stats = await fs.stat(cachePath)
        const size = await this.getDirSize(cachePath)

        results.push({
          source: meta.source,
          cachedAt: meta.cachedAt,
          size,
        })
      }
    }

    return results
  }

  private async getDirSize(dirPath: string): Promise<number> {
    let size = 0
    const files = await fs.readdir(dirPath)

    for (const file of files) {
      const filePath = path.join(dirPath, file)
      const stats = await fs.stat(filePath)

      if (stats.isDirectory()) {
        size += await this.getDirSize(filePath)
      } else {
        size += stats.size
      }
    }

    return size
  }
}
```

### 4.3 CLI 命令扩展

```typescript
// src/cli/commands/template.ts
import { Command } from 'commander'
import { TemplateLoader } from '../../template/loader'
import { TemplateCache } from '../../template/cache'
import { TemplateRegistry } from '../../template/registry'

export function createTemplateCommand(): Command {
  const program = new Command('template')

  program.description('管理模板')

  // template list - 列出可用模板
  program
    .command('list')
    .description('列出所有可用模板')
    .option('--official', '只显示官方模板')
    .option('--category <category>', '按分类过滤')
    .option('--tag <tag>', '按标签过滤')
    .option('--json', '输出 JSON 格式')
    .action(async (options) => {
      const registry = new TemplateRegistry()
      const templates = await registry.list({
        official: options.official,
        category: options.category,
        tag: options.tag,
      })

      if (options.json) {
        console.log(JSON.stringify(templates, null, 2))
      } else {
        // 格式化输出
        console.log('\n可用模板:\n')
        for (const template of templates) {
          console.log(`  ${template.name}@${template.latest}`)
          console.log(`    ${template.description}`)
          console.log(`    类别: ${template.category} | 标签: ${template.tags.join(', ')}`)
          console.log()
        }
      }
    })

  // template search - 搜索模板
  program
    .command('search <keyword>')
    .description('搜索模板')
    .action(async (keyword) => {
      const registry = new TemplateRegistry()
      const results = await registry.search(keyword)

      console.log(`\n找到 ${results.length} 个模板:\n`)
      for (const template of results) {
        console.log(`  ${template.name} - ${template.description}`)
      }
    })

  // template info - 查看模板详情
  program
    .command('info <template>')
    .description('查看模板详细信息')
    .option('--version <version>', '指定版本')
    .action(async (templateName, options) => {
      const registry = new TemplateRegistry()
      const info = await registry.getTemplate(templateName, options.version)

      console.log('\n模板信息:\n')
      console.log(`名称: ${info.name}`)
      console.log(`版本: ${info.version}`)
      console.log(`描述: ${info.description}`)
      console.log(`作者: ${info.author}`)
      console.log(`分类: ${info.category}`)
      console.log(`标签: ${info.tags.join(', ')}`)
      console.log(`仓库: ${info.repository?.url}`)
      console.log()
    })

  // template cache - 缓存管理
  const cacheCmd = program.command('cache').description('管理模板缓存')

  cacheCmd
    .command('list')
    .description('列出缓存的模板')
    .action(async () => {
      const cache = new TemplateCache()
      const caches = await cache.list()

      if (caches.length === 0) {
        console.log('没有缓存的模板')
        return
      }

      console.log('\n缓存的模板:\n')
      for (const item of caches) {
        const size = (item.size / 1024 / 1024).toFixed(2)
        console.log(`  ${item.source.identifier}@${item.source.version || 'latest'}`)
        console.log(`    缓存时间: ${item.cachedAt}`)
        console.log(`    大小: ${size} MB`)
        console.log()
      }
    })

  cacheCmd
    .command('clear')
    .description('清空模板缓存')
    .option('--force', '强制清空不提示')
    .action(async (options) => {
      if (!options.force) {
        // 提示用户确认
        const { confirm } = await prompts({
          type: 'confirm',
          name: 'confirm',
          message: '确定要清空所有缓存吗?',
          initial: false,
        })

        if (!confirm) {
          console.log('取消操作')
          return
        }
      }

      const cache = new TemplateCache()
      await cache.clear()
      console.log('✅ 缓存已清空')
    })

  // template add - 添加自定义模板源
  program
    .command('add <name> <source>')
    .description('添加自定义模板源')
    .example('template add my-template github:user/repo')
    .example('template add company-template npm:@company/template')
    .action(async (name, source) => {
      // 保存到配置文件
      const config = await loadConfig()
      config.templates = config.templates || {}
      config.templates[name] = source
      await saveConfig(config)

      console.log(`✅ 模板 "${name}" 已添加`)
    })

  // template remove - 删除自定义模板源
  program
    .command('remove <name>')
    .alias('rm')
    .description('删除自定义模板源')
    .action(async (name) => {
      const config = await loadConfig()
      if (!config.templates?.[name]) {
        console.error(`模板 "${name}" 不存在`)
        process.exit(1)
      }

      delete config.templates[name]
      await saveConfig(config)

      console.log(`✅ 模板 "${name}" 已删除`)
    })

  // template update - 更新模板
  program
    .command('update [template]')
    .description('更新模板到最新版本')
    .option('--all', '更新所有缓存的模板')
    .action(async (templateName, options) => {
      const cache = new TemplateCache()

      if (options.all) {
        const caches = await cache.list()
        console.log(`开始更新 ${caches.length} 个模板...`)

        for (const item of caches) {
          await cache.delete(item.source)
          console.log(`✅ ${item.source.identifier} 缓存已清除`)
        }

        console.log('✅ 所有模板缓存已清除，下次使用时将自动下载最新版本')
      } else if (templateName) {
        const loader = new TemplateLoader()
        const source = loader.parse(templateName)
        await cache.delete(source)
        console.log(`✅ ${templateName} 缓存已清除，下次使用时将自动下载最新版本`)
      } else {
        console.error('请指定模板名称或使用 --all 更新所有模板')
        process.exit(1)
      }
    })

  return program
}
```

---

## 5. Registry API 设计

### 5.1 RESTful API

如果选择构建独立的 Registry 服务，API 设计如下：

```
GET /api/v1/templates
  查询参数:
    - category: 分类过滤
    - tag: 标签过滤
    - search: 搜索关键词
    - page: 页码
    - limit: 每页数量
  返回: 模板列表

GET /api/v1/templates/:name
  返回: 模板详细信息（包含所有版本）

GET /api/v1/templates/:name/:version
  返回: 特定版本的模板信息

GET /api/v1/templates/:name/:version/download
  返回: 模板下载 URL 或直接返回文件

POST /api/v1/templates
  请求体: 模板元信息
  返回: 创建的模板信息
  权限: 需要身份验证

PUT /api/v1/templates/:name/:version
  请求体: 更新的模板信息
  返回: 更新后的模板信息
  权限: 需要身份验证

DELETE /api/v1/templates/:name/:version
  返回: 删除确认
  权限: 需要身份验证

GET /api/v1/search?q=<keyword>
  返回: 搜索结果

GET /api/v1/categories
  返回: 所有分类

GET /api/v1/tags
  返回: 所有标签

GET /api/v1/stats
  返回: 统计信息（下载量、模板数量等）
```

### 5.2 简化方案：静态 JSON + CDN

对于初期版本，可采用更简单的方案：

1. **在 GitHub 仓库维护 `registry.json`**
2. **通过 GitHub Pages 或 CDN 分发**
3. **CLI 定期拉取并缓存**

优点：

- 无需维护服务器
- 利用 GitHub/CDN 的可靠性
- 简单快速

---

## 6. 安全设计

### 6.1 安全威胁

| 威胁                 | 风险等级 | 缓解措施                            |
| -------------------- | -------- | ----------------------------------- |
| 恶意模板（包含病毒） | 🔴 高    | Checksum 校验、安全扫描             |
| 供应链攻击           | 🔴 高    | 模板签名、来源白名单                |
| 中间人攻击           | 🟡 中    | HTTPS、证书验证                     |
| 模板劫持             | 🟡 中    | Checksum 校验、版本锁定             |
| 隐私泄露             | 🟢 低    | 不上传用户数据、本地缓存加密        |
| 权限提升             | 🟡 中    | 最小权限原则、禁止执行任意命令      |
| DOS 攻击             | 🟢 低    | 下载超时、大小限制、频率限制        |
| 依赖漏洞             | 🟡 中    | 定期扫描依赖、使用 npm audit        |
| 配置注入             | 🟡 中    | 输入验证、Schema 校验、转义特殊字符 |

### 6.2 安全措施

#### 1. Checksum 校验

```typescript
// src/template/security.ts
export class TemplateSecurity {
  /**
   * 计算目录的哈希值
   */
  async calculateDirectoryHash(dirPath: string, algorithm = 'sha256'): Promise<string> {
    const hash = crypto.createHash(algorithm)
    const files = await this.getAllFiles(dirPath)

    // 按文件名排序确保一致性
    files.sort()

    for (const file of files) {
      const content = await fs.readFile(file)
      const relativePath = path.relative(dirPath, file)
      hash.update(relativePath)
      hash.update(content)
    }

    return hash.digest('hex')
  }

  /**
   * 验证模板 checksum
   */
  async verifyChecksum(template: Template): Promise<boolean> {
    if (!template.metadata.checksum) {
      console.warn('⚠️  模板没有 checksum，跳过校验')
      return true
    }

    const expectedHash = template.metadata.checksum.hash
    const algorithm = template.metadata.checksum.algorithm || 'sha256'

    const actualHash = await this.calculateDirectoryHash(template.path, algorithm)

    if (actualHash !== expectedHash) {
      throw new Error(
        `模板 checksum 校验失败！\n` +
          `期望: ${expectedHash}\n` +
          `实际: ${actualHash}\n` +
          `这可能表示模板已被篡改，请谨慎使用。`
      )
    }

    return true
  }
}
```

#### 2. 模板签名（可选，高级特性）

```typescript
/**
 * 使用 GPG 签名模板
 */
async signTemplate(templatePath: string, privateKey: string): Promise<string> {
  const hash = await this.calculateDirectoryHash(templatePath)
  const signature = await gpg.sign(hash, privateKey)
  return signature
}

/**
 * 验证模板签名
 */
async verifySignature(template: Template, publicKey: string): Promise<boolean> {
  const hash = await this.calculateDirectoryHash(template.path)
  const signature = template.metadata.signature

  if (!signature) {
    throw new Error('模板没有签名')
  }

  return await gpg.verify(hash, signature, publicKey)
}
```

#### 3. 安全扫描

```typescript
/**
 * 扫描模板中的潜在安全问题
 */
async scanTemplate(template: Template): Promise<SecurityScanResult> {
  const issues: SecurityIssue[] = []

  // 1. 扫描可疑文件
  const suspiciousFiles = await this.scanSuspiciousFiles(template.path)
  issues.push(...suspiciousFiles)

  // 2. 扫描可疑代码模式
  const suspiciousCode = await this.scanSuspiciousCode(template.path)
  issues.push(...suspiciousCode)

  // 3. 扫描依赖漏洞
  const vulnerabilities = await this.scanDependencies(template.path)
  issues.push(...vulnerabilities)

  return {
    passed: issues.length === 0,
    issues,
  }
}

private async scanSuspiciousFiles(dirPath: string): Promise<SecurityIssue[]> {
  const issues: SecurityIssue[] = []
  const files = await this.getAllFiles(dirPath)

  const suspiciousExtensions = ['.exe', '.dll', '.so', '.dylib', '.sh', '.bat', '.ps1']

  for (const file of files) {
    const ext = path.extname(file)
    if (suspiciousExtensions.includes(ext)) {
      issues.push({
        severity: 'warning',
        type: 'suspicious-file',
        message: `发现可疑文件: ${path.relative(dirPath, file)}`,
        file,
      })
    }
  }

  return issues
}

private async scanSuspiciousCode(dirPath: string): Promise<SecurityIssue[]> {
  const issues: SecurityIssue[] = []
  const files = await this.getAllFiles(dirPath)

  // 扫描危险的代码模式
  const dangerousPatterns = [
    /eval\(/g, // eval 调用
    /Function\(/g, // Function 构造器
    /child_process/g, // 子进程
    /exec\(/g, // exec 调用
    /\.rm\s+-rf/g, // 危险的删除命令
  ]

  for (const file of files) {
    const content = await fs.readFile(file, 'utf-8')

    for (const pattern of dangerousPatterns) {
      if (pattern.test(content)) {
        issues.push({
          severity: 'warning',
          type: 'suspicious-code',
          message: `发现潜在危险代码: ${pattern.source}`,
          file,
        })
      }
    }
  }

  return issues
}
```

#### 4. 沙箱执行（可选）

对于需要执行自定义脚本的模板，考虑沙箱隔离：

```typescript
/**
 * 在沙箱中执行模板钩子
 */
async executeInSandbox(script: string, context: any): Promise<any> {
  const vm = require('vm')
  const sandbox = vm.createContext({
    console: {
      log: (...args: any[]) => logger.info(...args),
      warn: (...args: any[]) => logger.warn(...args),
      error: (...args: any[]) => logger.error(...args),
    },
    // 只暴露安全的 API
    ...context,
  })

  const options = {
    timeout: 30000, // 30秒超时
    displayErrors: true,
  }

  return vm.runInContext(script, sandbox, options)
}
```

---

## 7. 版本管理策略

### 7.1 语义化版本

模板遵循 [Semver](https://semver.org/)：

- **MAJOR**: 破坏性变更（如文件结构重大调整）
- **MINOR**: 新增功能（如新增可选特性）
- **PATCH**: Bug 修复和小改进

### 7.2 版本约束

用户可指定版本范围：

```bash
# 精确版本
starter create my-lib --template library-default@1.2.0

# 版本范围
starter create my-lib --template library-default@^1.2.0
starter create my-lib --template library-default@~1.2.0
starter create my-lib --template library-default@>=1.0.0 <2.0.0

# 最新版本（默认）
starter create my-lib --template library-default@latest

# 指定 tag
starter create my-lib --template library-default@beta
```

### 7.3 版本锁定

在项目中记录使用的模板版本：

```json
// .starter-lock.json
{
  "template": {
    "name": "library-default",
    "version": "1.2.0",
    "source": "npm:@nsea/template-library-default@1.2.0",
    "checksum": "abc123...",
    "createdAt": "2024-11-15T00:00:00Z"
  }
}
```

---

## 8. 企业私有模板支持

### 8.1 私有 Registry

企业可部署自己的模板注册表：

```typescript
// .starterrc.json
{
  "registries": [
    {
      "name": "company-private",
      "url": "https://templates.company.com",
      "auth": {
        "type": "bearer",
        "token": "${COMPANY_TEMPLATE_TOKEN}"
      }
    },
    {
      "name": "official",
      "url": "https://registry.starter.nsea.io",
      "priority": 2
    }
  ]
}
```

### 8.2 私有 npm Scope

```bash
# 使用企业私有 npm 包
starter create my-app --template npm:@company/template-react@1.0.0

# 配置 npm registry
npm config set @company:registry https://npm.company.com
```

### 8.3 内网 Git 仓库

```bash
# GitLab
starter create my-app --template gitlab:company/templates/react#main

# Gitea/Gogs
starter create my-app --template git:https://git.company.com/templates/react.git#v1.0
```

---

## 9. 性能优化

### 9.1 并行下载

```typescript
// 批量下载模板时使用并行
import pLimit from 'p-limit'

const limit = pLimit(3) // 最多3个并发下载

const templates = ['library-default', 'cli-default', 'monorepo-default']

const downloads = templates.map((name) =>
  limit(() => loader.load(loader.parse(name), { cache: true }))
)

const results = await Promise.all(downloads)
```

### 9.2 增量更新

```typescript
// 只下载变更的文件
async incrementalUpdate(template: Template, version: string): Promise<Template> {
  const cached = await this.cache.get({ type: 'official', identifier: template.name })

  if (!cached) {
    return this.load(template.name, version)
  }

  // 获取 diff
  const diff = await this.registry.getDiff(template.name, cached.version, version)

  // 只下载变更的文件
  for (const change of diff.changes) {
    await this.downloadFile(change.url, path.join(cached.path, change.path))
  }

  return cached
}
```

### 9.3 CDN 加速

```typescript
// 配置 CDN 镜像
const CDN_MIRRORS = {
  github: {
    default: 'https://github.com',
    mirrors: ['https://ghproxy.com/https://github.com', 'https://hub.fastgit.xyz'],
  },
  npm: {
    default: 'https://registry.npmjs.org',
    mirrors: ['https://registry.npmmirror.com', 'https://registry.npm.taobao.org'],
  },
}

// 自动选择最快的镜像
async selectFastestMirror(urls: string[]): Promise<string> {
  const results = await Promise.race(urls.map((url) => this.testSpeed(url)))
  return results
}
```

---

## 10. 监控与统计

### 10.1 下载统计

```typescript
// 记录模板下载
async trackDownload(template: string, version: string, source: string): Promise<void> {
  // 匿名统计（可选）
  if (config.telemetry?.enabled) {
    await analytics.track('template.download', {
      template,
      version,
      source,
      timestamp: new Date().toISOString(),
    })
  }
}
```

### 10.2 错误上报

```typescript
// 上报模板加载错误
async reportError(error: Error, context: any): Promise<void> {
  if (config.telemetry?.errorReporting) {
    await errorReporter.report({
      error: error.message,
      stack: error.stack,
      context,
    })
  }
}
```

---

## 11. 实施路线图

### Phase 1: 基础架构（P0）

- [x] 设计模板规范和元信息格式
- [ ] 实现 TemplateLoader 核心类
- [ ] 支持官方模板、npm、GitHub 三种来源
- [ ] 实现基础缓存机制
- [ ] 实现 checksum 校验

### Phase 2: 官方仓库（P0）

- [ ] 创建 @nsea/starter-templates 仓库
- [ ] 实现 3 个官方模板（library/cli/monorepo）
- [ ] 发布模板到 npm
- [ ] 创建 registry.json

### Phase 3: CLI 集成（P0）

- [ ] 实现 `template list/info/search` 命令
- [ ] 实现 `template cache` 管理命令
- [ ] 在 `create` 命令中集成模板加载
- [ ] 添加模板选择交互界面

### Phase 4: 安全与优化（P1）

- [ ] 实现安全扫描
- [ ] 添加模板签名支持（可选）
- [ ] 性能优化（并行下载、增量更新）
- [ ] CDN 镜像配置

### Phase 5: 企业特性（P2）

- [ ] 支持私有 Registry
- [ ] 支持自定义认证
- [ ] 支持内网 Git 仓库
- [ ] 提供企业部署文档

### Phase 6: 生态建设（P2）

- [ ] 社区模板贡献流程
- [ ] 模板市场/展示页面
- [ ] 模板质量评级
- [ ] 模板使用统计展示

---

## 12. 配置示例

### 12.1 用户配置

`.starterrc.json`:

```json
{
  "templates": {
    "my-template": "github:myuser/my-template#main",
    "company-react": "npm:@company/template-react@2.0.0"
  },
  "registries": [
    {
      "name": "company",
      "url": "https://templates.company.com",
      "priority": 1
    }
  ],
  "cache": {
    "enabled": true,
    "directory": "~/.starter/cache",
    "maxAge": "7d"
  },
  "mirrors": {
    "github": "https://ghproxy.com/https://github.com",
    "npm": "https://registry.npmmirror.com"
  },
  "security": {
    "checksum": "enforce",
    "scan": true,
    "allowUnsigned": false
  }
}
```

### 12.2 环境变量

```bash
# Registry URL
STARTER_REGISTRY_URL=https://templates.company.com

# 认证 Token
STARTER_AUTH_TOKEN=xxx

# 镜像配置
STARTER_GITHUB_MIRROR=https://ghproxy.com/https://github.com
STARTER_NPM_MIRROR=https://registry.npmmirror.com

# 缓存目录
STARTER_CACHE_DIR=~/.starter/cache

# 禁用遥测
STARTER_TELEMETRY=false
```

---

## 13. FAQ

### Q1: 如何创建自己的模板？

参考官方模板结构，创建包含 `template.json` 的目录，发布到 npm 或 GitHub。

### Q2: 如何贡献模板到官方仓库？

1. Fork `@nsea/starter-templates` 仓库
2. 在 `packages/` 下创建模板
3. 提交 PR，通过 Review 后合并

### Q3: 模板安全吗？

官方模板经过审核和 checksum 校验。第三方模板请谨慎使用，建议启用安全扫描。

### Q4: 如何在内网环境使用？

1. 使用 `file:` 协议加载本地模板
2. 部署内网 Git 仓库
3. 配置私有 npm registry

### Q5: 如何加速模板下载？

1. 启用缓存
2. 配置 CDN 镜像
3. 使用国内镜像源

---

## 14. 总结

本设计方案提供了一个完整的远程模板管理系统，具备以下特点：

✅ **解耦**: 模板与主仓库分离，独立管理和版本控制  
✅ **灵活**: 支持多种模板来源（npm/GitHub/Git/本地）  
✅ **安全**: Checksum 校验、安全扫描、签名支持  
✅ **性能**: 缓存机制、并行下载、CDN 镜像  
✅ **企业**: 私有 Registry、内网支持  
✅ **生态**: 社区贡献、模板市场

**下一步行动**:

1. Review 本设计文档，确认技术方案
2. 创建 `@nsea/starter-templates` 仓库
3. 实施 Phase 1 基础架构
4. 迭代完善功能

---

**文档维护者**: Tech Lead  
**最后更新**: 2024-11  
**版本**: v1.0
