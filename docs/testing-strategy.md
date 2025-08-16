# 测试策略文档 / Testing Strategy

## 📋 **测试层次划分**

### **1. 单元测试 (Unit Tests)**

**位置**: `src/**/*.test.ts`  
**工具**: Vitest  
**覆盖范围**: 纯函数、业务逻辑、工具函数

#### **适合单元测试的代码**

- ✅ **纯函数逻辑** - 无副作用，输入输出明确
- ✅ **数据转换** - 格式化、验证、计算
- ✅ **错误处理** - 错误分类、消息格式化
- ✅ **业务规则** - 核心逻辑验证

#### **不适合单元测试的代码**

- ❌ **`process.exit()` 调用** - 会终止测试进程
- ❌ **复杂的用户交互** - 需要真实环境
- ❌ **系统级集成** - 文件系统、网络调用
- ❌ **外部依赖** - 第三方服务、数据库

### **2. E2E 测试 (End-to-End Tests)**

**位置**: `test/e2e/**/*.test.ts`  
**工具**: Vitest + Execa  
**覆盖范围**: 完整的 CLI 交互流程

#### **E2E 测试场景**

- ✅ **命令行参数解析** - 各种参数组合
- ✅ **完整的执行流程** - 从输入到输出
- ✅ **错误处理流程** - 异常情况的用户体验
- ✅ **真实的文件操作** - 实际的输入输出

## 🎯 **覆盖率目标**

### **当前覆盖率 (重构后)**

```
All files          |   89.03% |    90.66% |      95% |   89.03%
 src               |     100% |      100% |     100% |     100%
 src/cli           |   81.62% |    85.29% |    87.5% |   81.62%
 src/utils         |     100% |    94.11% |     100% |     100%
```

### **目标设定**

```typescript
// vitest.config.ts
thresholds: {
  global: {
    branches: 75,    // 分支覆盖率
    functions: 80,   // 函数覆盖率
    lines: 80,       // 行覆盖率
    statements: 80,  // 语句覆盖率
  },
}
```

### **覆盖率策略**

- **核心业务逻辑**: 100% 覆盖率
- **CLI 交互代码**: 80%+ 覆盖率 (排除 `process.exit()`)
- **工具函数**: 95%+ 覆盖率
- **类型定义**: 排除在覆盖率统计之外

## 🏗️ **CLI 测试架构重构**

### **重构前的问题**

```typescript
// ❌ 难以测试的代码
export async function main(): Promise<void> {
  try {
    const { command, options } = await parseArgs()

    if (command === 'run') {
      const result = await starterAsync(options)
      if (result.success) {
        console.log('✅ 成功')
        process.exit(0) // 🚫 无法在单元测试中测试
      }
    }
  } catch (error) {
    console.error('❌ 失败')
    process.exit(1) // 🚫 无法在单元测试中测试
  }
}
```

### **重构后的改进**

```typescript
// ✅ 可测试的代码架构
export async function main(deps: CliDependencies = defaultDependencies): Promise<void> {
  try {
    const { command, options } = await deps.parseArgs()
    const result = await handleCommand(command, options, deps)

    if (result.shouldExit) {
      deps.exit(result.exitCode) // 🎯 依赖注入，可 mock
    }
  } catch (error) {
    const errorOutput = formatError(error, deps.classifyError) // 🎯 纯函数，可测试
    deps.console.error(errorOutput.message)
    deps.exit(ExitCode.FatalError)
  }
}

// 🎯 纯函数，易于测试
export function formatError(error: Error, classifyErrorFn: typeof classifyError) {
  // 纯逻辑，无副作用
}

// 🎯 纯函数，易于测试
export function formatRunResult(result: { success: boolean; message?: string }) {
  // 纯逻辑，无副作用
}
```

### **关键改进点**

1. **依赖注入** - 通过 `CliDependencies` 接口注入外部依赖
2. **纯函数提取** - 将格式化逻辑提取为纯函数
3. **副作用分离** - 将 `console.log`、`process.exit` 等副作用隔离
4. **返回值设计** - 用返回值代替直接的副作用调用

## 🧪 **测试示例**

### **单元测试示例**

```typescript
// src/cli/index.test.ts
describe('formatWelcomeMessage', () => {
  it('should format welcome message correctly', () => {
    const message = formatWelcomeMessage()

    expect(message).toContain('🚀 Starter')
    expect(message).toContain('TypeScript Library Development Tool')
  })
})

describe('handleCommand', () => {
  it('should handle run command', async () => {
    const mockDeps = {
      starterAsync: vi.fn().mockResolvedValue({ success: true }),
      console: { log: vi.fn() },
      // ...
    }

    const result = await handleCommand('run', options, mockDeps)

    expect(result.shouldExit).toBe(false)
    expect(mockDeps.starterAsync).toHaveBeenCalled()
  })
})
```

### **E2E 测试示例**

```typescript
// test/e2e/cli.test.ts
describe('CLI E2E Tests', () => {
  it('should execute run command with basic options', async () => {
    const { stdout, exitCode } = await execa('node', [
      cliPath,
      './src',
      '--output',
      './test-output',
      '--dry-run',
    ])

    expect(exitCode).toBe(0)
    expect(stdout).toContain('✅ 操作成功完成')
  })
})
```

## 📊 **测试执行命令**

```bash
# 运行所有测试
npm run test

# 只运行单元测试
npm run test:unit

# 只运行 E2E 测试
npm run test:e2e

# 运行测试并生成覆盖率报告
npm run test:coverage

# 监视模式运行测试
npm run test:watch

# 使用 UI 界面运行测试
npm run test:ui
```

## 🎯 **最佳实践**

### **单元测试最佳实践**

1. **测试纯函数** - 优先测试无副作用的函数
2. **Mock 外部依赖** - 使用依赖注入和 Mock
3. **测试边界条件** - 包括成功、失败、边界情况
4. **保持测试独立** - 每个测试应该独立运行

### **E2E 测试最佳实践**

1. **测试真实场景** - 模拟用户的实际使用流程
2. **验证完整输出** - 检查退出码、标准输出、错误输出
3. **测试错误处理** - 验证各种错误情况的处理
4. **保持测试稳定** - 避免依赖外部环境变化

### **覆盖率优化策略**

1. **合理排除文件** - 排除类型定义、配置文件等
2. **关注关键逻辑** - 重点提高核心业务逻辑覆盖率
3. **平衡成本效益** - 不追求 100% 覆盖率，关注质量
4. **持续监控** - 在 CI/CD 中集成覆盖率检查

## 🔄 **持续改进**

### **当前待优化项**

- [ ] 提高 `parse-args.ts` 的测试覆盖率 (当前 57.33%)
- [ ] 添加更多边界条件测试
- [ ] 优化 E2E 测试的执行速度
- [ ] 添加性能测试

### **未来规划**

- [ ] 集成测试覆盖率到 CI/CD
- [ ] 添加视觉回归测试 (如果有 UI 组件)
- [ ] 性能基准测试
- [ ] 兼容性测试 (不同 Node.js 版本)

---

这个测试策略确保了 `lib-starter` 模板具有高质量的测试覆盖率，同时保持了合理的测试成本和维护负担。通过单元测试和 E2E 测试的结合，我们既保证了代码质量，又验证了用户体验。
