# 轻量级模板仓库方案

> 🎯 简单、实用、够用：配置仓库 URL → 列出模板 → 使用模板

---

## 核心理念

**Keep It Simple**：不需要复杂的架构，只需要一个 Git 仓库存放模板，CLI 能读取并使用即可。

---

## 仓库结构

### 模板仓库目录结构

```
starter-templates/
├── templates/
│   ├── ts-lib/              # TypeScript 库模板
│   │   ├── template/        # 模板文件
│   │   │   ├── package.json
│   │   │   ├── src/
│   │   │   ├── tsconfig.json
│   │   │   └── ...
│   │   ├── template.json    # 模板元信息
│   │   └── README.md
│   ├── vscode-extension/    # VSCode 扩展模板
│   │   ├── template/
│   │   ├── template.json
│   │   └── README.md
│   ├── ui/                  # UI 组件库模板
│   │   ├── template/
│   │   ├── template.json
│   │   └── README.md
│   ├── admin/               # OA 管理后台模板
│   │   ├── template/
│   │   ├── template.json
│   │   └── README.md
│   └── landing/             # Landing 页模板
│       ├── template/
│       ├── template.json
│       └── README.md
├── .starter-templates       # 模板仓库标识（空文件即可）
└── README.md
```

### template.json 格式（极简）

```json
{
  "name": "ts-lib",
  "displayName": "TypeScript Library",
  "description": "Modern TypeScript library template",
  "author": "NorthSeacoder",
  "version": "1.0.0"
}
```

**仅需 5 个字段**，其他都是可选的。

---

## 配置方式

### 用户配置文件

`.starterrc.json`:

```json
{
  "repositories": [
    "https://github.com/NorthSeacoder/starter-templates"
    // 可以添加多个仓库
  ]
}
```

或者通过 CLI 添加：

```bash
# 添加仓库
starter repo add https://github.com/NorthSeacoder/starter-templates

# 查看仓库列表
starter repo list

# 删除仓库
starter repo remove https://github.com/NorthSeacoder/starter-templates
```

---

## 工作流程

### 1. 列出模板

```bash
$ starter template list

可用模板：

📚 ts-lib - TypeScript Library
   Modern TypeScript library template
   来源: https://github.com/NorthSeacoder/starter-templates

🔌 vscode-extension - VSCode Extension
   VSCode extension development template
   来源: https://github.com/NorthSeacoder/starter-templates

🎨 ui - UI Component Library
   React/Vue component library template
   来源: https://github.com/NorthSeacoder/starter-templates

🏢 admin - Admin Dashboard
   OA management dashboard template
   来源: https://github.com/NorthSeacoder/starter-templates

🚀 landing - Landing Page
   Marketing landing page template
   来源: https://github.com/NorthSeacoder/starter-templates
```

### 2. 使用模板

```bash
# 基本用法
starter create my-lib --template ts-lib

# 指定仓库（如果有多个仓库有同名模板）
starter create my-ext --template vscode-extension --repo https://github.com/NorthSeacoder/starter-templates

# 交互式选择
starter create my-project
# 会显示模板列表让你选择
```

---

## 技术实现

### 核心代码（简化版）

```typescript
// src/template/repository.ts

interface TemplateMetadata {
  name: string
  displayName: string
  description: string
  author?: string
  version?: string
}

interface Template {
  metadata: TemplateMetadata
  path: string // 本地缓存路径
  source: string // 来源仓库 URL
}

export class TemplateRepository {
  private cacheDir = path.join(os.homedir(), '.starter/cache')

  /**
   * 获取配置的仓库列表
   */
  async getRepositories(): Promise<string[]> {
    const config = await this.loadConfig()
    return config.repositories || []
  }

  /**
   * 列出所有可用模板
   */
  async listTemplates(): Promise<Template[]> {
    const repos = await this.getRepositories()
    const templates: Template[] = []

    for (const repo of repos) {
      const repoTemplates = await this.getTemplatesFromRepo(repo)
      templates.push(...repoTemplates)
    }

    return templates
  }

  /**
   * 从仓库获取模板列表
   */
  private async getTemplatesFromRepo(repoUrl: string): Promise<Template[]> {
    // 1. 克隆或更新仓库到本地缓存
    const repoPath = await this.cloneOrUpdateRepo(repoUrl)

    // 2. 扫描 templates/ 目录
    const templatesDir = path.join(repoPath, 'templates')
    if (!fs.existsSync(templatesDir)) {
      return []
    }

    const templateDirs = fs.readdirSync(templatesDir)
    const templates: Template[] = []

    for (const dir of templateDirs) {
      const templatePath = path.join(templatesDir, dir)
      const metadataPath = path.join(templatePath, 'template.json')

      // 3. 读取 template.json
      if (fs.existsSync(metadataPath)) {
        const metadata = JSON.parse(fs.readFileSync(metadataPath, 'utf-8'))
        templates.push({
          metadata,
          path: templatePath,
          source: repoUrl,
        })
      }
    }

    return templates
  }

  /**
   * 克隆或更新仓库
   */
  private async cloneOrUpdateRepo(repoUrl: string): Promise<string> {
    const repoName = this.getRepoName(repoUrl)
    const repoPath = path.join(this.cacheDir, repoName)

    if (fs.existsSync(repoPath)) {
      // 已存在，执行 git pull
      await this.gitPull(repoPath)
    } else {
      // 不存在，执行 git clone
      await this.gitClone(repoUrl, repoPath)
    }

    return repoPath
  }

  /**
   * 使用模板创建项目
   */
  async useTemplate(templateName: string, targetDir: string): Promise<void> {
    const templates = await this.listTemplates()
    const template = templates.find((t) => t.metadata.name === templateName)

    if (!template) {
      throw new Error(`Template "${templateName}" not found`)
    }

    // 复制 template/ 目录到目标位置
    const templateDir = path.join(template.path, 'template')
    await this.copyTemplate(templateDir, targetDir)

    console.log(`✅ Project created from template: ${template.metadata.displayName}`)
  }

  /**
   * 复制模板文件
   */
  private async copyTemplate(source: string, target: string): Promise<void> {
    // 递归复制文件
    // 支持变量替换（如 {{projectName}}）
    // 这里简化处理
    fs.cpSync(source, target, { recursive: true })
  }

  // Git 操作辅助方法
  private async gitClone(url: string, target: string): Promise<void> {
    const { execa } = await import('execa')
    await execa('git', ['clone', '--depth', '1', url, target])
  }

  private async gitPull(repoPath: string): Promise<void> {
    const { execa } = await import('execa')
    await execa('git', ['pull'], { cwd: repoPath })
  }

  private getRepoName(url: string): string {
    // 从 URL 提取仓库名
    // https://github.com/user/repo -> repo
    // https://github.com/user/repo.git -> repo
    const match = url.match(/\/([^/]+?)(\.git)?$/)
    return match ? match[1] : 'unknown'
  }

  private async loadConfig(): Promise<{ repositories: string[] }> {
    // 读取 .starterrc.json
    const configPath = path.join(process.cwd(), '.starterrc.json')
    if (fs.existsSync(configPath)) {
      return JSON.parse(fs.readFileSync(configPath, 'utf-8'))
    }
    return { repositories: [] }
  }
}
```

### CLI 命令实现

```typescript
// src/cli/commands/template.ts

export function createTemplateCommand(): Command {
  const program = new Command('template')

  // starter template list
  program
    .command('list')
    .description('列出所有可用模板')
    .action(async () => {
      const repo = new TemplateRepository()
      const templates = await repo.listTemplates()

      console.log('\n可用模板：\n')
      for (const template of templates) {
        console.log(`📦 ${template.metadata.name} - ${template.metadata.displayName}`)
        console.log(`   ${template.metadata.description}`)
        console.log(`   来源: ${template.source}`)
        console.log()
      }
    })

  return program
}

// src/cli/commands/repo.ts

export function createRepoCommand(): Command {
  const program = new Command('repo')

  // starter repo add <url>
  program
    .command('add <url>')
    .description('添加模板仓库')
    .action(async (url: string) => {
      const config = await loadConfig()
      config.repositories = config.repositories || []

      if (config.repositories.includes(url)) {
        console.log(`仓库已存在: ${url}`)
        return
      }

      config.repositories.push(url)
      await saveConfig(config)
      console.log(`✅ 已添加仓库: ${url}`)
    })

  // starter repo list
  program
    .command('list')
    .description('列出已配置的仓库')
    .action(async () => {
      const config = await loadConfig()
      const repos = config.repositories || []

      if (repos.length === 0) {
        console.log('未配置任何仓库')
        return
      }

      console.log('\n已配置的仓库：\n')
      repos.forEach((repo, index) => {
        console.log(`${index + 1}. ${repo}`)
      })
      console.log()
    })

  // starter repo remove <url>
  program
    .command('remove <url>')
    .alias('rm')
    .description('移除模板仓库')
    .action(async (url: string) => {
      const config = await loadConfig()
      config.repositories = config.repositories || []

      const index = config.repositories.indexOf(url)
      if (index === -1) {
        console.log(`仓库不存在: ${url}`)
        return
      }

      config.repositories.splice(index, 1)
      await saveConfig(config)
      console.log(`✅ 已移除仓库: ${url}`)
    })

  return program
}
```

---

## 缓存策略（简化）

### 缓存位置

```
~/.starter/cache/
├── starter-templates/     # 仓库缓存
│   └── templates/
│       ├── ts-lib/
│       ├── vscode-extension/
│       └── ...
└── .cache-meta.json       # 缓存元信息（最后更新时间等）
```

### 更新策略

- 每次 `starter template list` 时自动 `git pull` 更新
- 或者添加 `starter template update` 命令手动更新

---

## 示例模板：ts-lib

### 目录结构

```
templates/ts-lib/
├── template/
│   ├── .gitignore
│   ├── package.json
│   ├── tsconfig.json
│   ├── tsup.config.ts
│   ├── vitest.config.ts
│   ├── src/
│   │   └── index.ts
│   ├── test/
│   │   └── index.test.ts
│   └── README.md
├── template.json
└── README.md
```

### template.json

```json
{
  "name": "ts-lib",
  "displayName": "TypeScript Library",
  "description": "Modern TypeScript library with tsup and vitest",
  "author": "NorthSeacoder",
  "version": "1.0.0"
}
```

### 变量替换（可选）

如果需要变量替换，可以在 `package.json` 中使用占位符：

```json
{
  "name": "{{projectName}}",
  "version": "0.1.0",
  "description": "{{description}}",
  "author": "{{author}}"
}
```

CLI 创建时会提示输入这些变量。

---

## 完整工作流示例

### 1. 创建模板仓库

```bash
mkdir starter-templates
cd starter-templates

mkdir -p templates/ts-lib/template
touch .starter-templates

# 将当前项目作为第一个模板
cp -r ../lib-starter/* templates/ts-lib/template/

# 创建 template.json
cat > templates/ts-lib/template.json << EOF
{
  "name": "ts-lib",
  "displayName": "TypeScript Library",
  "description": "Modern TypeScript library template",
  "author": "NorthSeacoder",
  "version": "1.0.0"
}
EOF

git init
git add .
git commit -m "feat: add ts-lib template"
git remote add origin https://github.com/NorthSeacoder/starter-templates
git push -u origin main
```

### 2. 配置 CLI

```bash
# 用户配置仓库
starter repo add https://github.com/NorthSeacoder/starter-templates
```

### 3. 使用模板

```bash
# 列出模板
starter template list

# 创建项目
starter create my-lib --template ts-lib
```

---

## 实施计划

### Phase 1: 核心功能（1 周）

1. **Day 1-2**: 实现 `TemplateRepository` 类
   - Git clone/pull
   - 扫描模板目录
   - 读取 template.json

2. **Day 3-4**: 实现 CLI 命令
   - `starter repo add/list/remove`
   - `starter template list`
   - 更新 `starter create` 集成模板加载

3. **Day 5**: 创建模板仓库
   - 迁移当前项目为 ts-lib 模板
   - 创建其他基础模板（vscode-extension、ui 等）

### Phase 2: 完善体验（3 天）

1. 添加缓存更新策略
2. 添加变量替换功能（可选）
3. 添加进度提示
4. 完善错误处理

---

## 功能对比

| 功能       | 复杂方案                     | 简化方案 ✅   |
| ---------- | ---------------------------- | ------------- |
| 模板来源   | npm/GitHub/Git/本地/Registry | Git 仓库      |
| 安全校验   | Checksum/签名/扫描           | Git 信任      |
| 版本管理   | Semver/多版本                | Git 分支/Tag  |
| 缓存策略   | 复杂过期/增量更新            | 简单 git pull |
| 配置方式   | 多层优先级合并               | 单一配置文件  |
| 实现复杂度 | ⭐⭐⭐⭐⭐                   | ⭐⭐          |
| 开发周期   | 3-4 周                       | 1 周          |

---

## FAQ

### Q: 为什么不用 npm 包？

A: 模板不是依赖，不需要 npm 的版本管理和依赖解析。Git 仓库更简单直观。

### Q: 如何处理模板版本？

A: 使用 Git 分支或标签：

```bash
# 默认使用 main 分支
starter repo add https://github.com/user/templates

# 使用特定分支
starter repo add https://github.com/user/templates#develop

# 使用特定标签
starter repo add https://github.com/user/templates#v1.0.0
```

### Q: 如何支持私有模板？

A: 配置 Git 认证（SSH key 或 personal access token），仓库 URL 使用私有仓库地址即可。

### Q: 多个仓库有同名模板怎么办？

A:

1. 优先使用第一个匹配的模板
2. 或者通过 `--repo` 参数指定仓库

---

## 总结

**核心优势**：

- ✅ **简单**：只需要 Git 仓库 + template.json
- ✅ **够用**：满足模板管理的核心需求
- ✅ **灵活**：可以添加多个仓库，支持私有仓库
- ✅ **快速**：1 周内可以完成核心功能

**不包含的功能**（如需要可后续添加）：

- ❌ npm 包模板
- ❌ 复杂的安全校验
- ❌ 模板市场/评级
- ❌ 多版本并存
- ❌ 遥测统计

---

**文档维护者**: Tech Lead  
**最后更新**: 2024-11  
**版本**: v1.0-simplified
