# Implementation Plan: Modernize TypeScript Library Template

**Workspace**: `lib-starter` | **Date**: 2026-05-20 | **Spec**: [spec.md](spec.md)  
**Input**: Feature specification from `specs/modernize-lib-template/spec.md`

## Summary

Upgrade the starter to current mainstream library-template practices while preserving its existing single-package style, dual-format package output, CLI support, and documentation tone. The recommended approach is to modernize the toolchain in place: switch to `tsdown`, update lint/typecheck to modern `typescript-eslint` patterns, add modern package validation, and move publishing toward CI release with npm Trusted Publisher / GitHub OIDC.

## Architecture Overview

This change touches the template's build and developer-experience layers rather than application logic. The main components are:

- Package metadata and scripts in `package.json`
- TypeScript compiler settings in `tsconfig.json`
- Build pipeline in `tsup.config.ts` or its replacement
- Lint configuration in `eslint.config.js`
- CI and release workflows in `.github/workflows/`
- User-facing docs in `README.md` and setup docs

The data flow is simple: source code is linted and type-checked locally and in CI, built into package artifacts for both library and CLI usage, validated for export correctness, then published through a trusted CI release path.

## Key Design Decisions

### Decision 1: Replace `tsup` with `tsdown`

- **背景**: The current template uses `tsup`, while the target direction is a more current library bundler aligned with modern library-template practice.
- **选项**:
  - A: Keep `tsup` — lowest change, but not the target of the requested modernization.
  - B: Switch to `tsdown` — current mainstream library-template direction, better fit for the requested upgrade.
- **结论**: Choose B.
- **影响**: Build config and related scripts will need adjustment, but output goals stay the same.
- **来源**: https://tsdown.dev/guide/getting-started

### Decision 2: Modernize ESLint without adopting `@antfu/eslint-config`

- **背景**: The user explicitly wants to preserve the current style rather than adopting a full third-party opinionated preset.
- **选项**:
  - A: Keep the current manual flat config — style stays familiar, but typed linting remains dated.
  - B: Move to modern `typescript-eslint` flat-config patterns with typed linting support — preserves custom style while updating the foundation.
- **结论**: Choose B.
- **影响**: ESLint setup becomes more current; some rules and parser options will change.
- **来源**: https://typescript-eslint.io/getting-started/typed-linting

### Decision 3: Use CI release with npm Trusted Publisher / GitHub OIDC

- **背景**: Current docs still center on token-based publishing; modern npm publishing prefers trusted publishing via OIDC.
- **选项**:
  - A: Keep `NPM_TOKEN` publishing — workable, but less secure and less modern.
  - B: Adopt trusted publishing in CI and keep token-based publishing only as a fallback or migration path.
- **结论**: Choose B.
- **影响**: Release workflow and README need updates; npm package settings become part of setup guidance.
- **来源**: https://docs.npmjs.com/trusted-publishers

### Decision 4: Add package validation with `publint` and `attw`

- **背景**: The starter already validates builds and exports, but package-shape checks are now a common baseline for library templates.
- **选项**:
  - A: Keep only build/test checks — simpler, but weaker for published package correctness.
  - B: Add package validation checks — catches export/type issues before publish.
- **结论**: Choose B.
- **影响**: Adds a small verification step with good payoff.
- **来源**: https://www.npmjs.com/package/publint, https://github.com/arethetypeswrong/arethetypeswrong.github.io

## Module Design

### Module: Package Metadata and Scripts

**职责**: Define the template's runtime baseline, package entrypoints, and developer scripts.

**改动概述**: Update Node/pnpm baselines, script names, publish commands, and package validation commands while preserving the current template's public shape.

**关键接口 / 行为**:

```text
scripts:
  dev, build, test, lint, typecheck, check-exports, release
package exports:
  keep dual library export and CLI entry compatibility
```

**注意事项**:

- Keep the starter single-package.
- Avoid introducing catalogs or workspace-only assumptions.

### Module: Build Pipeline

**职责**: Produce distributable library and CLI artifacts.

**改动概述**: Swap the bundler layer to `tsdown` while preserving ESM/CJS output goals and CLI executable behavior.

**关键接口 / 行为**:

```text
library build -> dist
cli build -> executable artifact with shebang
source maps -> preserved where useful
```

**注意事项**:

- Preserve current output semantics as much as practical.
- Keep consumer-facing entrypoints stable.

### Module: Lint and Typecheck

**职责**: Enforce code quality with modern TypeScript-aware linting.

**改动概述**: Replace dated ESLint integration with current flat-config patterns and typed linting support where valuable.

**关键接口 / 行为**:

```text
eslint.config.js
  -> JS recommended rules
  -> TypeScript rules
  -> typed linting for selected paths
typecheck
  -> TypeScript compiler no-emit check
```

**注意事项**:

- Keep the template's custom rule style.
- Do not adopt a full external preset.

### Module: CI and Release

**职责**: Validate the starter and publish releases safely.

**改动概述**: Keep CI checks, add or adjust release workflow for tag-based publishing, and update npm publishing instructions toward trusted publishing.

**关键接口 / 行为**:

```text
CI:
  lint -> typecheck -> test -> build -> package checks
Release:
  version bump -> tag -> CI publish
```

**注意事项**:

- Keep CI validation separate from publishing.
- Document the first-time Trusted Publisher setup clearly.

## Project Structure

```text
package.json
tsconfig.json
eslint.config.js
tsdown.config.ts or tsdown config replacement
.github/workflows/
README.md
docs/
```

## Risks and Tradeoffs

- `tsdown` migration may require config tuning to preserve the current CLI output behavior.
- Typed linting can slow lint runs if enabled too broadly.
- Trusted Publisher adds a setup step on npm, but materially improves publish security.
- Keeping the current style while upgrading tooling can leave some old conventions in place intentionally.

## Verification Strategy

- Run lint, typecheck, test, and build locally.
- Verify library and CLI output still work.
- Run package-exit validation (`publint` and `attw`) on the built package.
- Verify CI workflow syntax and release path expectations.
- Confirm README instructions match the actual publish flow.

## Design Artifacts

本次计划涉及的产物：

| 产物          | 是否需要     | 说明                         |
| ------------- | ------------ | ---------------------------- |
| plan.md       | 必须         | 主实现计划                   |
| data-model.md | 不需要       | 本次不涉及实体或状态模型变化 |
| tasks.md      | 后续阶段生成 | 由 `tasks` 阶段产出          |
| acceptance.md | 后续阶段生成 | 用于最终验收结论             |

## Notes

- This plan intentionally avoids a monorepo conversion and avoids adopting `@antfu/eslint-config`.
- The unresolved release-workflow split question is resolved here as: keep CI validation separate from publishing, with tag-based release publishing.

## Sources

| 决策                                    | 来源 URL                                                       | 备注             |
| --------------------------------------- | -------------------------------------------------------------- | ---------------- |
| `tsdown` build direction                | https://tsdown.dev/guide/getting-started                       | 官方入门文档     |
| typed linting for TypeScript            | https://typescript-eslint.io/getting-started/typed-linting     | 官方指南         |
| npm trusted publishing / OIDC           | https://docs.npmjs.com/trusted-publishers                      | 官方发布文档     |
| npm publish provenance and CLI behavior | https://docs.npmjs.com/cli/v11/commands/npm-publish/           | 官方 CLI 文档    |
| `publint` package validation            | https://www.npmjs.com/package/publint                          | npm package 页面 |
| `attw` package/export validation        | https://github.com/arethetypeswrong/arethetypeswrong.github.io | 官方项目页       |
