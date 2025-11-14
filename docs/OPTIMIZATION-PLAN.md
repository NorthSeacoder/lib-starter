# 仓库优化计划

> 🎯 先把当前仓库打磨成优秀的 ts-lib 模板，再扩展模板管理功能

---

## 优化理念

**分两步走**：

1. **Step 1**: 优化本仓库 → 成为完整的 TypeScript 库模板示例
2. **Step 2**: 基于成熟的模板，实现模板管理功能

**为什么这样做**？

- ✅ 实践出真知：先做出一个好的模板，才知道模板应该长什么样
- ✅ 吃自己的狗粮：本仓库会成为第一个模板，必须足够好
- ✅ 降低风险：核心功能先稳定，再扩展
- ✅ 快速迭代：先完成核心价值，再增加功能

---

## 当前问题分析

### 核心功能缺失

```typescript
// src/starter.ts - 当前只是占位代码
export function starter(options: StarterOptions = {}): StarterResult {
  try {
    console.log('Starter initialized with options:', options) // 只有日志
    return { success: true, message: 'Starter completed successfully' }
  } catch (error) {
    return { success: false, message: error.message }
  }
}
```

**问题**：

- ❌ 没有实际业务逻辑
- ❌ 不能作为真实的库使用示例
- ❌ 测试覆盖的是空逻辑

### 缺少实用示例

- ❌ 没有真实的函数/类实现
- ❌ 没有展示 TypeScript 最佳实践
- ❌ 没有展示如何构建可维护的库

### 文档不够完善

- ❌ API 文档未生成
- ❌ 缺少使用示例
- ❌ 缺少最佳实践说明

---

## Step 1: 优化为完整的 ts-lib 模板

### 1.1 设计核心功能（1-2 天）

**目标**：实现一个有实际价值的工具库作为示例

**方案选项**：

#### 选项 A：通用工具库（推荐）⭐

实现常用的工具函数，展示如何构建工具库：

```typescript
// src/string/index.ts
export function capitalize(str: string): string
export function kebabCase(str: string): string
export function camelCase(str: string): string
export function snakeCase(str: string): string

// src/array/index.ts
export function chunk<T>(array: T[], size: number): T[][]
export function unique<T>(array: T[]): T[]
export function groupBy<T>(array: T[], key: keyof T): Record<string, T[]>

// src/object/index.ts
export function pick<T, K extends keyof T>(obj: T, keys: K[]): Pick<T, K>
export function omit<T, K extends keyof T>(obj: T, keys: K[]): Omit<T, K>
export function deepClone<T>(obj: T): T

// src/async/index.ts
export function sleep(ms: number): Promise<void>
export function retry<T>(fn: () => Promise<T>, options?: RetryOptions): Promise<T>
export function timeout<T>(promise: Promise<T>, ms: number): Promise<T>
```

**优势**：

- ✅ 功能实用，可直接使用
- ✅ 展示模块化组织
- ✅ 展示 TypeScript 类型编程
- ✅ 展示测试编写
- ✅ 展示文档编写

#### 选项 B：配置管理器

```typescript
// 配置加载、合并、校验
export class ConfigManager<T> {
  load(path: string): T
  merge(...configs: Partial<T>[]): T
  validate(config: unknown): config is T
}
```

#### 选项 C：事件总线

```typescript
// 轻量级事件系统
export class EventBus<T> {
  on(event: keyof T, handler: (data: T[event]) => void): void
  emit(event: keyof T, data: T[event]): void
  off(event: keyof T, handler?: Function): void
}
```

**推荐方案**：**选项 A - 通用工具库**

原因：

- 功能清晰，易于理解
- 展示面广，可以体现多种最佳实践
- 实用性强，用户可以直接使用
- 易于测试和文档化

---

### 1.2 代码结构优化（2-3 天）

#### 目录结构调整

```
src/
├── string/              # 字符串工具
│   ├── index.ts
│   ├── capitalize.ts
│   ├── case-convert.ts
│   └── index.test.ts
├── array/               # 数组工具
│   ├── index.ts
│   ├── chunk.ts
│   ├── unique.ts
│   └── index.test.ts
├── object/              # 对象工具
│   ├── index.ts
│   ├── pick-omit.ts
│   ├── deep-clone.ts
│   └── index.test.ts
├── async/               # 异步工具
│   ├── index.ts
│   ├── sleep.ts
│   ├── retry.ts
│   └── index.test.ts
├── types/               # 类型定义
│   ├── common.ts
│   ├── string.ts
│   └── async.ts
├── utils/               # 内部工具
│   └── is.ts           # 类型判断
├── cli/                 # CLI（保留）
│   └── ...
└── index.ts             # 主入口
```

#### 导出结构

```typescript
// src/index.ts
export * from './string'
export * from './array'
export * from './object'
export * from './async'
export type * from './types'

// 也支持按模块导入
// import { capitalize } from '@nsea/starter/string'
// import { chunk } from '@nsea/starter/array'
```

#### package.json 导出配置

```json
{
  "exports": {
    ".": {
      "import": "./dist/index.js",
      "require": "./dist/index.cjs",
      "types": "./dist/index.d.ts"
    },
    "./string": {
      "import": "./dist/string/index.js",
      "require": "./dist/string/index.cjs",
      "types": "./dist/string/index.d.ts"
    },
    "./array": {
      "import": "./dist/array/index.js",
      "require": "./dist/array/index.cjs",
      "types": "./dist/array/index.d.ts"
    },
    "./object": {
      "import": "./dist/object/index.js",
      "require": "./dist/object/index.cjs",
      "types": "./dist/object/index.d.ts"
    },
    "./async": {
      "import": "./dist/async/index.js",
      "require": "./dist/async/index.cjs",
      "types": "./dist/async/index.d.ts"
    }
  }
}
```

---

### 1.3 测试完善（1-2 天）

#### 单元测试

```typescript
// src/string/capitalize.test.ts
import { describe, it, expect } from 'vitest'
import { capitalize } from './capitalize'

describe('capitalize', () => {
  it('should capitalize first letter', () => {
    expect(capitalize('hello')).toBe('Hello')
  })

  it('should handle empty string', () => {
    expect(capitalize('')).toBe('')
  })

  it('should not change already capitalized', () => {
    expect(capitalize('Hello')).toBe('Hello')
  })

  it('should handle single character', () => {
    expect(capitalize('a')).toBe('A')
  })
})
```

#### 集成测试

```typescript
// test/integration/usage.test.ts
import { describe, it, expect } from 'vitest'
import * as utils from '../src'

describe('Integration: Common use cases', () => {
  it('should handle string transformation pipeline', () => {
    const result = utils.capitalize(utils.camelCase('hello-world'))
    expect(result).toBe('HelloWorld')
  })

  it('should handle array operations', () => {
    const arr = [1, 2, 2, 3, 3, 3]
    const unique = utils.unique(arr)
    const chunks = utils.chunk(unique, 2)
    expect(chunks).toEqual([[1, 2], [3]])
  })
})
```

#### 性能测试（可选）

```typescript
// test/benchmark/performance.test.ts
import { describe, it } from 'vitest'
import { deepClone } from '../src'

describe('Performance', () => {
  it('should handle large objects efficiently', () => {
    const largeObj = {
      /* ... */
    }
    const start = performance.now()
    deepClone(largeObj)
    const duration = performance.now() - start
    expect(duration).toBeLessThan(100) // 100ms
  })
})
```

---

### 1.4 文档完善（1-2 天）

#### API 文档生成

```bash
# 添加 typedoc
pnpm add -D typedoc

# 配置 typedoc.json
{
  "entryPoints": ["src/index.ts"],
  "out": "docs/api",
  "theme": "default",
  "readme": "README.md",
  "exclude": ["**/*.test.ts", "**/cli/**"]
}

# 生成文档
pnpm exec typedoc
```

#### README 更新

```markdown
# @nsea/starter

> 🛠️ Modern TypeScript utility library with comprehensive tooling

## Features

- 🔤 **String utilities**: case conversion, manipulation
- 📦 **Array utilities**: chunk, unique, groupBy
- 🎯 **Object utilities**: pick, omit, deep clone
- ⏱️ **Async utilities**: sleep, retry, timeout
- 📘 **Full TypeScript support**: Complete type definitions
- 🧪 **100% tested**: Comprehensive test coverage
- 📦 **Tree-shakeable**: ES modules with tree-shaking
- 🚀 **Zero dependencies**: No external dependencies

## Installation

\`\`\`bash
npm install @nsea/starter

# or

pnpm add @nsea/starter
\`\`\`

## Usage

### String utilities

\`\`\`typescript
import { capitalize, camelCase, kebabCase } from '@nsea/starter'

capitalize('hello world') // 'Hello world'
camelCase('hello-world') // 'helloWorld'
kebabCase('helloWorld') // 'hello-world'
\`\`\`

### Array utilities

\`\`\`typescript
import { chunk, unique, groupBy } from '@nsea/starter'

chunk([1, 2, 3, 4, 5], 2) // [[1, 2], [3, 4], [5]]
unique([1, 1, 2, 2, 3]) // [1, 2, 3]
groupBy(users, 'role') // { admin: [...], user: [...] }
\`\`\`

### Async utilities

\`\`\`typescript
import { sleep, retry, timeout } from '@nsea/starter'

await sleep(1000) // Wait 1 second

await retry(() => fetchData(), {
attempts: 3,
delay: 1000
})

await timeout(slowOperation(), 5000) // 5s timeout
\`\`\`

## API Documentation

See [API Documentation](./docs/api/README.md) for detailed API reference.
```

#### 使用示例

创建 `examples/` 目录：

```typescript
// examples/basic.ts
import { capitalize, chunk, sleep } from '@nsea/starter'

// String example
const title = capitalize('hello world')
console.log(title) // 'Hello world'

// Array example
const items = [1, 2, 3, 4, 5, 6]
const groups = chunk(items, 2)
console.log(groups) // [[1, 2], [3, 4], [5, 6]]

// Async example
async function demo() {
  console.log('Starting...')
  await sleep(1000)
  console.log('After 1 second')
}

demo()
```

---

### 1.5 构建优化（1 天）

#### tsup 配置优化

```typescript
// tsup.config.ts
import { defineConfig } from 'tsup'

export default defineConfig([
  // 主入口
  {
    entry: {
      index: 'src/index.ts',
      string: 'src/string/index.ts',
      array: 'src/array/index.ts',
      object: 'src/object/index.ts',
      async: 'src/async/index.ts',
    },
    format: ['cjs', 'esm'],
    dts: true,
    sourcemap: true,
    clean: true,
    splitting: false,
    treeshake: true,
    minify: false,
    target: 'es2022',
  },
  // CLI 入口（如果保留）
  {
    entry: ['src/cli/run.ts'],
    format: ['cjs'],
    dts: false,
    sourcemap: true,
    treeshake: true,
    banner: {
      js: '#!/usr/bin/env node',
    },
    noExternal: ['chalk', 'commander'],
  },
])
```

#### Bundle 分析

```bash
# 分析打包大小
pnpm analyze

# 检查类型导出
pnpm check-exports
```

---

## Step 2: 实现模板管理功能

**前置条件**：Step 1 完成，本仓库已成为优秀的 ts-lib 模板

### 2.1 模板化当前仓库（1 天）

创建模板仓库结构：

```
starter-templates/
├── templates/
│   └── ts-lib/
│       ├── template/              # 当前仓库的副本
│       │   ├── src/
│       │   ├── test/
│       │   ├── package.json
│       │   └── ...
│       ├── template.json          # 元信息
│       └── README.md              # 模板说明
└── README.md
```

**template.json**：

```json
{
  "name": "ts-lib",
  "displayName": "TypeScript Library",
  "description": "Modern TypeScript library with utilities, testing, and tooling",
  "author": "NorthSeacoder",
  "version": "1.0.0",
  "category": "library",
  "tags": ["typescript", "library", "utils", "esm", "cjs"],
  "features": [
    "String/Array/Object/Async utilities",
    "100% TypeScript with strict mode",
    "Comprehensive test coverage",
    "ESM + CJS dual output",
    "Tree-shakeable",
    "CLI support"
  ]
}
```

### 2.2 实现模板管理（1 周）

按照 `docs/template-repository-simple.md` 实现：

1. **Day 1-2**: `TemplateRepository` 类
2. **Day 3-4**: CLI 命令（repo, template）
3. **Day 5**: 创建其他模板（vscode-extension, ui 等）

---

## 实施计划

### Phase 1: 核心功能实现（4-5 天）

| 任务        | 描述                        | 工时 | 优先级 |
| ----------- | --------------------------- | ---- | ------ |
| 设计 API    | 确定实现哪些工具函数        | 0.5d | P0     |
| String 模块 | capitalize, case conversion | 1d   | P0     |
| Array 模块  | chunk, unique, groupBy      | 1d   | P0     |
| Object 模块 | pick, omit, deepClone       | 1d   | P0     |
| Async 模块  | sleep, retry, timeout       | 1d   | P0     |
| 单元测试    | 所有模块 100% 覆盖          | 1d   | P0     |

### Phase 2: 文档与示例（2-3 天）

| 任务        | 描述                     | 工时 | 优先级 |
| ----------- | ------------------------ | ---- | ------ |
| API 文档    | Typedoc 生成             | 0.5d | P0     |
| README 更新 | 使用示例、API 说明       | 0.5d | P0     |
| Examples    | 创建示例代码             | 0.5d | P1     |
| 最佳实践    | 编写 Best Practices 文档 | 0.5d | P1     |

### Phase 3: 模板化与管理（1 周）

按照 `docs/TASKS.md` Phase 4 执行。

---

## 验收标准

### Step 1 完成标准

- [ ] 实现至少 15 个实用工具函数
- [ ] 单元测试覆盖率 ≥ 95%
- [ ] 所有公共 API 有 JSDoc 注释
- [ ] README 包含完整使用示例
- [ ] API 文档生成成功
- [ ] 构建产物正确（ESM + CJS）
- [ ] 所有 CI 检查通过

### Step 2 完成标准

- [ ] 模板仓库创建成功
- [ ] ts-lib 模板可用
- [ ] CLI 命令正常工作
- [ ] 文档完整

---

## 快速开始

### 立即开始 Step 1

```bash
# 1. 创建功能分支
git checkout -b feat/implement-utils

# 2. 实现第一个模块
mkdir -p src/string
touch src/string/index.ts
touch src/string/capitalize.ts
touch src/string/index.test.ts

# 3. 开始编码
code src/string/capitalize.ts
```

### 推荐的实现顺序

1. **String 模块**（最简单，快速见效）
   - capitalize
   - camelCase
   - kebabCase
   - snakeCase

2. **Array 模块**（实用性强）
   - chunk
   - unique
   - groupBy

3. **Object 模块**（展示 TypeScript 能力）
   - pick
   - omit
   - deepClone

4. **Async 模块**（展示异步处理）
   - sleep
   - retry
   - timeout

---

## 参考资源

### 类似项目参考

- [lodash](https://lodash.com/) - 经典工具库
- [radash](https://radash-docs.vercel.app/) - 现代 TypeScript 工具库
- [remeda](https://remedajs.com/) - 类型安全的工具库
- [es-toolkit](https://es-toolkit.slash.page/) - 高性能工具库

### 最佳实践

- 每个函数单独文件
- 完整的 JSDoc 注释
- 100% 单元测试
- 类型安全优先
- 性能优化（但不过度）
- 清晰的错误信息

---

## 总结

**核心思路**：

1. ✅ **先做好自己** - 把当前仓库做成优秀的 ts-lib 模板
2. ✅ **再帮助别人** - 基于成熟的模板，实现模板管理功能
3. ✅ **快速迭代** - 先实现核心功能，再逐步完善

**时间估算**：

- Step 1: 1-1.5 周（优化本仓库）
- Step 2: 1 周（实现模板管理）
- **总计**: 2-2.5 周

**下一步行动**：

1. Review 本优化计划
2. 确定要实现的工具函数列表
3. 开始实现 String 模块（最简单）
4. 逐步完成所有模块

---

**文档维护者**: Tech Lead  
**最后更新**: 2024-11  
**版本**: v1.0
