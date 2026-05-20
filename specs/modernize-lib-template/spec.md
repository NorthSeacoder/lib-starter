# Feature Specification: Modernize TypeScript Library Template

**Workspace**: `lib-starter`  
**Created**: 2026-05-20  
**Status**: Draft  
**Input**: 用户描述: "评估下这个现代化 TypeScript 库开发模板是否还足够现代化，尤其是相关的依赖是否有了更好的替代品，相关功能是否有了更优雅的实现方式，从最佳实践的角度来看。同时分析 `~/personal/libs` 下的 `pnpm-workspace-utils` 和 `starter-ts`，分别有哪些功能与配置，哪些可以应用到当前项目。保留原来的风格，只使用更新的库与约束/工具等，并把 `tsdown`、`bumpp + CI release`、`Trusted Publisher / OIDC` 纳入升级方案，使用 SDD 流程。"

---

## User Scenarios & Testing _(mandatory)_

### User Story 1 - Template Maintainer Upgrades the Starter (Priority: P1)

作为这个模板的维护者，我希望在不改变模板整体风格和单包结构的前提下，把工具链和约束升级到当前主流，以便新项目初始化时默认拥有更现代、更稳健的工程基线。

**Why this priority**: 这是本次工作的核心目标，决定模板是否仍然适合作为新的库项目起点。

**Acceptance Scenarios**:

1. **[US1-1]**
   **Given** 当前模板使用旧版工具和部分过时集成方式  
   **When** 维护者完成本次升级  
   **Then** 模板应切换到当前主流的 Node、pnpm、TypeScript、构建、lint 和包校验基线，同时保留现有模板的总体组织方式

2. **[US1-2]**
   **Given** 当前模板已有双格式库输出、CLI、测试、发布脚本  
   **When** 升级完成  
   **Then** 这些能力仍然存在，且其默认实现方式更贴近当前最佳实践

**Edge Cases**:

- **[US1-3]** 升级不能把单包模板变成 monorepo 或引入只有 monorepo 才有明显价值的复杂约束
- **[US1-4]** 升级不能强制采用与当前模板风格明显不同的 ESLint 风格预设
- **[US1-5]** 升级不能破坏现有 ESM/CJS 导出和 CLI 可用性

### User Story 2 - Template Consumer Uses the Starter with Modern Defaults (Priority: P1)

作为使用该模板创建库项目的开发者，我希望模板默认提供现代构建、现代包发布和现代质量检查流程，以便少做额外决策即可进入正常开发与发布。

**Why this priority**: 模板的价值不仅在于能跑，还在于默认即合理。

**Acceptance Scenarios**:

1. **[US2-1]**
   **Given** 开发者基于模板创建新库项目  
   **When** 查看脚本、CI 和 README  
   **Then** 应看到清晰的现代开发、校验、构建和发布路径

2. **[US2-2]**
   **Given** 开发者希望发布到 npm  
   **When** 按模板文档配置发布流程  
   **Then** 模板默认应优先引导其使用 GitHub OIDC / npm Trusted Publisher，而不是传统长期 `NPM_TOKEN`

**Edge Cases**:

- **[US2-3]** 如果用户尚未启用 Trusted Publisher，文档应明确首次发布或迁移步骤
- **[US2-4]** 如果用户只关心本地开发，开发和测试命令仍应简单直接

### User Story 3 - Maintainer Reuses Good Ideas Without Full Style Adoption (Priority: P2)

作为模板维护者，我希望从 `pnpm-workspace-utils` 和 `starter-ts` 吸收适合当前仓库的做法，而不是整套复刻，以便获得更新的约束和工具，同时避免风格漂移。

**Why this priority**: 用户已明确希望“借鉴当前主流”，而不是转成另一套作者模板。

**Acceptance Scenarios**:

1. **[US3-1]**
   **Given** 参考项目中包含 monorepo 专属配置与作者偏好  
   **When** 维护者决定迁移内容  
   **Then** 只迁移对单包库模板确有价值的部分

2. **[US3-2]**
   **Given** 存在更主流的替代工具  
   **When** 模板升级  
   **Then** 模板应优先采纳这些工具，而不是继续保留仅仅“还能用”的旧方案

**Edge Cases**:

- **[US3-3]** 若某个参考做法会显著增加理解成本，但收益有限，则不应纳入模板默认值

---

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: 模板必须继续作为单包 TypeScript 库模板工作，不引入 monorepo 必需结构。
- **FR-002**: 模板必须保留库构建能力，并继续支持对外发布可消费的包产物。
- **FR-003**: 模板必须继续支持 CLI 入口场景，且升级后 CLI 使用路径不应消失。
- **FR-004**: 模板必须把构建工具升级为当前主流的方案，并替代现有较旧的默认方案。
- **FR-005**: 模板必须把 lint 与 typecheck 配置升级为当前主流写法，同时保留当前仓库自定义风格而非切换为第三方整套风格预设。
- **FR-006**: 模板必须移除当前不再推荐的格式化/Lint 集成方式，并改为更主流的职责分离方式。
- **FR-007**: 模板必须提供现代的包产物验证能力，覆盖至少导出正确性和包结构有效性。
- **FR-008**: 模板必须把 CI/release 流程升级为当前主流方式，包含 `bumpp + CI release` 的支持。
- **FR-009**: 模板必须在文档与工作流中优先采用 npm Trusted Publisher / GitHub OIDC 发布路径。
- **FR-010**: 模板必须更新 README 和相关文档，使其反映升级后的环境要求、工具链和发布流程。
- **FR-011**: 模板必须从 `pnpm-workspace-utils` 与 `starter-ts` 中仅采纳适合单包库模板的实践，而不引入对当前场景收益不高的 monorepo 约束。

### Non-Functional Requirements _(if applicable)_

- **NFR-001**: 升级后的模板应保持较低认知负担，避免为了“更现代”而显著增加复杂度。
- **NFR-002**: 升级后的模板应尽量保持现有目录结构和脚本语义，减少模板使用者迁移成本。
- **NFR-003**: 升级后的模板应尽量兼容当前主流 Node LTS 环境。

### Key Entities _(if applicable)_

- **Template Toolchain**: 模板使用的 Node、pnpm、TypeScript、构建器、测试框架、lint/typecheck、包验证与发布相关工具集合。
- **Release Workflow**: 从版本提升、CI 校验到 npm 发布的完整链路。
- **Reference Practices**: 从 `pnpm-workspace-utils` 和 `starter-ts` 中筛选出的可迁移做法清单。

---

## Out of Scope _(if applicable)_

明确不在本次功能范围内的内容：

- 将当前模板重构为 monorepo
- 引入 `@antfu/eslint-config` 作为默认 ESLint 风格
- 完全复制 `starter-ts` 或 `pnpm-workspace-utils` 的目录与工程约定
- 引入仅在多包 workspace 下才明显有价值的 `pnpm catalogs`
- 重写模板业务示例代码以追求新的代码风格偏好

---

## Unclear Questions _(if applicable)_

- 是否需要在本次升级中一并把 release workflow 拆分为单独的 CI 与 tag-release 两条工作流，还是只需做到主流发布链路即可
