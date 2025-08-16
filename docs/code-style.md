# 代码风格配置 / Code Style Configuration

## 📋 **工具集成**

本项目使用 **ESLint** + **Prettier** 的组合来确保代码质量和格式一致性：

- **ESLint** - 代码质量检查、语法错误检测、最佳实践建议
- **Prettier** - 代码格式化、统一代码风格
- **eslint-config-prettier** - 禁用与 Prettier 冲突的 ESLint 规则
- **eslint-plugin-prettier** - 将 Prettier 作为 ESLint 规则运行

## 🎯 **配置原则**

### **1. 避免冲突**

```javascript
// eslint.config.js
import prettierConfig from 'eslint-config-prettier'

export default [
  js.configs.recommended,
  prettierConfig, // 🎯 禁用与 Prettier 冲突的规则
  {
    rules: {
      'prettier/prettier': 'error', // 🎯 将 Prettier 规则作为 ESLint 错误
    },
  },
]
```

### **2. 统一标准**

```json
// .prettierrc.json
{
  "semi": false, // 不使用分号
  "singleQuote": true, // 使用单引号
  "tabWidth": 2, // 2 空格缩进
  "trailingComma": "es5", // ES5 兼容的尾随逗号
  "printWidth": 100, // 行长度 100 字符
  "endOfLine": "lf" // Unix 风格换行符
}
```

## 🔧 **配置文件详解**

### **ESLint 配置 (`eslint.config.js`)**

```javascript
import js from '@eslint/js'
import typescript from '@typescript-eslint/eslint-plugin'
import typescriptParser from '@typescript-eslint/parser'
import prettier from 'eslint-plugin-prettier'
import prettierConfig from 'eslint-config-prettier'

export default [
  js.configs.recommended,
  prettierConfig, // 🎯 关键：禁用冲突规则
  {
    files: ['**/*.ts', '**/*.tsx'],
    languageOptions: {
      parser: typescriptParser,
      parserOptions: {
        ecmaVersion: 2022,
        sourceType: 'module',
      },
      globals: {
        // Node.js 环境全局变量
        console: 'readonly',
        process: 'readonly',
        Buffer: 'readonly',
        // ...
      },
    },
    plugins: {
      '@typescript-eslint': typescript,
      prettier: prettier, // 🎯 集成 Prettier
    },
    rules: {
      'prettier/prettier': 'error', // 🎯 Prettier 规则作为错误

      // TypeScript 规则
      '@typescript-eslint/no-unused-vars': [
        'warn',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          ignoreRestSiblings: true,
        },
      ],
      '@typescript-eslint/no-explicit-any': 'off',

      // 禁用需要类型信息的规则（模板项目）
      '@typescript-eslint/prefer-nullish-coalescing': 'off',
      '@typescript-eslint/prefer-optional-chain': 'off',
      '@typescript-eslint/strict-boolean-expressions': 'off',
      '@typescript-eslint/explicit-function-return-type': 'off',

      // 禁用基础 JS 规则，让 TypeScript 处理
      'no-undef': 'off',
      'no-unused-vars': 'off',
      'no-redeclare': 'off',
      'no-dupe-class-members': 'off',
    },
  },
  {
    // 测试文件特殊规则
    files: ['**/*.test.ts', '**/*.spec.ts'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/no-unused-vars': 'off',
    },
  },
  {
    // 忽略文件
    ignores: ['dist/', 'node_modules/', 'coverage/', '*.config.js', '*.config.ts'],
  },
]
```

### **Prettier 配置 (`.prettierrc.json`)**

```json
{
  "semi": false, // 不使用分号
  "singleQuote": true, // 使用单引号
  "tabWidth": 2, // 2 空格缩进
  "trailingComma": "es5", // ES5 兼容的尾随逗号
  "printWidth": 100, // 行长度限制
  "useTabs": false, // 使用空格而不是制表符
  "quoteProps": "as-needed", // 仅在需要时给对象属性加引号
  "bracketSpacing": true, // 对象字面量的大括号间加空格
  "arrowParens": "always", // 箭头函数参数总是加括号
  "endOfLine": "lf", // Unix 风格换行符
  "bracketSameLine": false, // 多行元素的 > 放在新行
  "proseWrap": "preserve", // 保持 markdown 等文档的换行
  "embeddedLanguageFormatting": "auto", // 自动格式化嵌入的代码
  "htmlWhitespaceSensitivity": "css", // HTML 空白符敏感性
  "insertPragma": false, // 不插入 @format pragma
  "requirePragma": false, // 不要求 @format pragma
  "vueIndentScriptAndStyle": false // Vue 文件中不缩进 <script> 和 <style>
}
```

### **Prettier 忽略文件 (`.prettierignore`)**

```gitignore
# Dependencies
node_modules/
pnpm-lock.yaml
package-lock.json
yarn.lock

# Build outputs
dist/
coverage/
*.min.js
*.min.css

# Generated files
CHANGELOG.md
.changeset/

# Config files that should not be formatted
.env
.env.*

# Documentation that should preserve formatting
LICENSE

# Ignore specific file patterns
**/*.md.bak
**/*.json.bak
```

## 🚀 **使用命令**

### **开发时使用**

```bash
# 检查代码质量和格式
npm run lint:check    # ESLint 检查
npm run format:check  # Prettier 检查

# 自动修复
npm run lint          # ESLint 自动修复
npm run format        # Prettier 自动格式化

# 完整的 CI 检查
npm run ci            # 运行所有检查
```

### **Git Hooks 集成**

```json
// .lintstagedrc.json
{
  "*.{ts,tsx,js,jsx}": [
    "eslint --fix", // 🎯 先运行 ESLint 修复
    "prettier --write" // 🎯 再运行 Prettier 格式化
  ],
  "*.{json,md}": ["prettier --write"]
}
```

```json
// package.json
{
  "simple-git-hooks": {
    "pre-commit": "lint-staged",
    "commit-msg": "commitlint --edit $1"
  }
}
```

## 📊 **配置验证**

### **测试配置是否正确**

```bash
# 1. 检查 ESLint 配置
npx eslint --print-config src/index.ts

# 2. 检查 Prettier 配置
npx prettier --check src/

# 3. 验证集成是否正常
npm run lint:check && npm run format:check
```

### **常见问题排查**

#### **问题 1: ESLint 和 Prettier 冲突**

```bash
# 症状：ESLint 要求的格式与 Prettier 不一致
# 解决：确保安装了 eslint-config-prettier
npm install -D eslint-config-prettier
```

#### **问题 2: 格式化不一致**

```bash
# 症状：不同开发者的格式化结果不同
# 解决：确保所有人使用相同的配置文件
git add .prettierrc.json .prettierignore
git commit -m "Add prettier config"
```

#### **问题 3: CI 检查失败**

```bash
# 症状：本地通过，CI 失败
# 解决：运行完整的 CI 检查
npm run ci

# 如果失败，逐步检查
npm run lint:check
npm run format:check
npm run typecheck
npm run test:coverage
npm run build
```

## 🎯 **最佳实践**

### **1. 编辑器集成**

#### **VS Code 配置 (`.vscode/settings.json`)**

```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "eslint.validate": ["javascript", "javascriptreact", "typescript", "typescriptreact"]
}
```

### **2. 团队协作**

- ✅ **统一配置文件** - 所有配置文件都提交到版本控制
- ✅ **Git Hooks** - 使用 `simple-git-hooks` + `lint-staged`
- ✅ **CI 检查** - 在 CI/CD 中强制执行格式检查
- ✅ **编辑器插件** - 团队成员都安装相同的编辑器插件

### **3. 性能优化**

- ✅ **缓存配置** - ESLint 和 Prettier 都支持缓存
- ✅ **增量检查** - 只检查修改的文件
- ✅ **并行执行** - 在 CI 中并行运行检查

```bash
# 使用缓存
npx eslint --cache src/
npx prettier --cache --check src/

# 只检查修改的文件
npx lint-staged
```

## 🔄 **维护和更新**

### **定期更新依赖**

```bash
# 检查过时的依赖
npm outdated

# 更新 ESLint 和 Prettier 相关包
npm update eslint @typescript-eslint/eslint-plugin @typescript-eslint/parser
npm update prettier eslint-config-prettier eslint-plugin-prettier
```

### **配置调整**

当需要调整代码风格时：

1. **修改配置文件** - 更新 `.prettierrc.json` 或 `eslint.config.js`
2. **重新格式化** - 运行 `npm run format` 格式化所有文件
3. **测试验证** - 运行 `npm run ci` 确保所有检查通过
4. **团队同步** - 确保所有团队成员更新配置

---

这个配置确保了 ESLint 和 Prettier 的完美集成，避免了常见的冲突问题，并提供了一致的代码风格体验。🎉
