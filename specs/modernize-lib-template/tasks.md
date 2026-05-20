# Tasks: Modernize TypeScript Library Template

**Workspace**: `lib-starter` | **Date**: 2026-05-20  
**Input**: `specs/modernize-lib-template/spec.md` + `plan.md`  
**Prerequisites**: spec.md (必须), plan.md (必须), data-model.md (按需)

---

## 执行原则

- 按依赖顺序组织任务，先基础链路，后发布与文档，最后验证
- 每个任务都能直接执行到代码或配置修改
- 保持单包模板风格，不引入 monorepo 约束
- 任务覆盖实现、验证和收尾

---

## Phase 1: Toolchain Baseline

**目标**: 把模板的运行、构建和版本基线升级到当前主流，同时保持现有单包形态。

- [x] T001 [US1] 升级 package baseline 到当前主流 Node/pnpm/TypeScript 约束
  - scope: `package.json`, `.nvmrc`, `README.md`
  - verify: `node -v`/`pnpm -v` 约束与 README 一致，包元数据不再标记旧基线

- [x] T002 [US1] 把构建工具从 `tsup` 迁移到 `tsdown`
  - scope: `tsup.config.ts` 或替代配置、`package.json` scripts、构建输出相关设置
  - verify: `pnpm build` 仍输出 library + CLI 产物，ESM/CJS 行为保持一致

- [x] T003 [US1] 保持并校正 library/CLI exports 与打包产物声明
  - scope: `package.json`, `bin/`, `src/index.ts`, `src/cli/*`
  - verify: `pnpm check-exports` 通过，CLI 入口仍可直接执行

## Phase 2: Lint, Typecheck, and Package Validation

**目标**: 让质量检查更现代，但不改变模板原有风格。

- [x] T004 [US1][US3] 现代化 ESLint flat config 与 TypeScript-aware linting
  - scope: `eslint.config.js`, `package.json`, 相关 lint script
  - verify: `pnpm lint:check` 通过，规则风格仍保留当前模板取向

- [x] T005 [US1] 去掉 `eslint-plugin-prettier` 的 lint/format 耦合
  - scope: `eslint.config.js`, `package.json`, `.prettierrc.json`, `.prettierignore`
  - verify: ESLint 只负责代码质量，Prettier 只负责格式化

- [x] T006 [US1][US3] 增加包产物验证链路
  - scope: `package.json`, CI script, `publint`/`attw` 配置或脚本
  - verify: 包导出、类型声明和包结构检查可在本地与 CI 运行

## Phase 3: Release and CI

**目标**: 把发布链路升级到更安全的当前主流方式，并保持维护成本可控。

- [x] T007 [US2] 更新发布流程为 `bumpp + CI release` 模式
  - scope: `package.json`, `.github/workflows/*`, README 发布说明
  - verify: 版本提升、tag 发布、CI 发布路径可按文档完成

- [x] T008 [US2] 将 npm 发布说明切换为 Trusted Publisher / GitHub OIDC 优先
  - scope: `README.md`, `SETUP.md`, `SECURITY.md`
  - verify: 文档明确首次配置和后续发布流程，不再把长期 `NPM_TOKEN` 作为默认路径

- [x] T009 [US2] 调整 CI 为“验证与发布分离”的现代结构
  - scope: `.github/workflows/ci.yml`, `.github/workflows/release.yml`
  - verify: CI 只负责校验，release 只负责 tag 发布与上游发布动作

## Phase 4: Documentation and Cleanup

**目标**: 让模板文档、脚本和说明和升级后的行为保持一致。

- [x] T010 [US1][US2][US3] 更新 README 中的技术栈、脚本和发布说明
  - scope: `README.md`
  - verify: 新用户按 README 可以理解开发、验证、发布全流程

- [x] T011 [US3] 从参考项目中只吸收适合单包模板的做法并清理无关约定
  - scope: 依赖列表、脚本、配置注释、文档说明
  - verify: 没有引入 monorepo 专属约束或 `catalogs` 之类不必要的默认值

## Phase 5: Verification

**目标**: 确认升级后的模板仍然可用且符合预期。

- [x] T012 [US1][US2] 运行 lint / typecheck / test / build / package checks
  - scope: 整体仓库
  - verify: `pnpm lint:check && pnpm typecheck && pnpm test && pnpm build && pnpm check-exports`

- [x] T013 [US1][US2] 回归验证 CLI 与库导出
  - scope: `src/cli/*`, `src/index.ts`, `bin/`
  - verify: CLI 可启动，库导出在 ESM/CJS 下行为正常

---

## 依赖与顺序

- T001 必须先于 T002-T009
- T002、T003 是构建与包出口主路径，之后才能稳定做验证
- T004-T006 完成后再做 CI / release 调整更稳
- T010-T011 依赖前面所有主配置完成
- T012-T013 是最终验收门槛

## 覆盖检查

| 场景 / 需求 | 对应任务                                             |
| ----------- | ---------------------------------------------------- |
| US1         | T001, T002, T003, T004, T005, T006, T010, T012, T013 |
| US2         | T007, T008, T009, T010, T012, T013                   |
| US3         | T004, T006, T011                                     |

## Notes

- 如果 T002 迁移时发现 `tsdown` 配置需要新增独立配置文件，可在实现阶段补充，但不应改变任务目标
- 如果发布链路需要额外 GitHub Actions 权限或 npm 配置说明，可在 T008/T009 中补充
