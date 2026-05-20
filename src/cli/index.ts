import process from 'node:process'
import { Chalk } from 'chalk'
import { version as packageVersion } from '../../package.json'
import { starterAsync } from '../starter'
import { ExitCode } from './exit-code'
import { parseArgs } from './parse-args'
import { classifyError } from '../utils/error-handler'

const chalk = new Chalk()

// 依赖注入接口，便于测试
export interface CliDependencies {
  parseArgs: typeof parseArgs
  starterAsync: typeof starterAsync
  classifyError: typeof classifyError
  console: Console
  exit: (code: number) => never
}

// 默认依赖
const defaultDependencies: CliDependencies = {
  parseArgs,
  starterAsync,
  classifyError,
  console,
  exit: process.exit,
}

/**
 * CLI 主入口函数
 */
export async function main(deps: CliDependencies = defaultDependencies): Promise<void> {
  try {
    // 解析命令行参数
    const { command, options } = await deps.parseArgs()

    const result = await handleCommand(command, options, deps)

    if (result.shouldExit) {
      deps.exit(result.exitCode)
    }
  } catch (error) {
    const errorOutput = formatError(error as Error, deps.classifyError)
    deps.console.error(errorOutput.message)

    if (errorOutput.suggestions) {
      deps.console.error(errorOutput.suggestions)
    }

    if (errorOutput.debugInfo) {
      deps.console.error(errorOutput.debugInfo)
    }

    deps.exit(ExitCode.FatalError)
  }
}

/**
 * 处理命令（纯函数，易于测试）
 */
export async function handleCommand(
  command: string,
  options: any,
  deps: CliDependencies
): Promise<{ shouldExit: boolean; exitCode: number }> {
  switch (command) {
    case 'run':
      if (options) {
        await executeRunCommand(options, deps)
      }
      return { shouldExit: false, exitCode: ExitCode.Success }

    case 'version':
      deps.console.log(packageVersion)
      return { shouldExit: true, exitCode: ExitCode.Success }

    case 'help':
    default:
      // parseArgs 会自动显示帮助信息
      return { shouldExit: true, exitCode: ExitCode.Success }
  }
}

/**
 * 执行 run 命令（纯函数，易于测试）
 */
export async function executeRunCommand(options: any, deps: CliDependencies): Promise<void> {
  // 显示欢迎信息（仅在详细模式）
  if (options.verbose) {
    const welcomeMessage = formatWelcomeMessage()
    deps.console.log(welcomeMessage)
  }

  // 运行主要功能
  const result = await deps.starterAsync(options)

  const output = formatRunResult(result)

  if (result.success) {
    deps.console.log(output.successMessage)
    if (output.details) {
      deps.console.log(output.details)
    }
  } else {
    deps.console.error(output.errorMessage)
    if (output.details) {
      deps.console.error(output.details)
    }
    throw new Error(result.message || '操作失败')
  }
}

/**
 * 格式化欢迎信息（纯函数）
 */
export function formatWelcomeMessage(): string {
  return [
    chalk.bold.cyan('\n🚀 Starter'),
    chalk.gray('TypeScript Library Development Tool'),
    chalk.yellow(`版本: ${packageVersion}\n`),
  ].join('\n')
}

/**
 * 格式化运行结果（纯函数）
 */
export function formatRunResult(result: { success: boolean; message?: string }) {
  if (result.success) {
    return {
      successMessage: chalk.green('✅ 操作成功完成'),
      details: result.message ? chalk.gray(result.message) : undefined,
    }
  } else {
    return {
      errorMessage: chalk.red('❌ 操作失败'),
      details: result.message ? chalk.yellow(result.message) : undefined,
    }
  }
}

/**
 * 格式化错误信息（纯函数）
 */
export function formatError(
  error: Error,
  classifyErrorFn: typeof classifyError
): {
  message: string
  suggestions?: string
  debugInfo?: string
} {
  const classified = classifyErrorFn(error)

  const result = {
    message: chalk.red('\n💥 操作失败') + '\n' + chalk.yellow(`📋 ${classified.message}`),
    suggestions: undefined as string | undefined,
    debugInfo: undefined as string | undefined,
  }

  // 显示建议
  if (classified.suggestions.length > 0) {
    result.suggestions = [
      chalk.blue('\n💡 建议解决方案:'),
      ...classified.suggestions.map((suggestion) => chalk.gray(`  • ${suggestion}`)),
    ].join('\n')
  }

  // 在开发模式下显示完整堆栈
  if (process.env.DEBUG || process.env.NODE_ENV === 'development') {
    result.debugInfo = [
      chalk.gray('\n🔍 调试信息:'),
      chalk.gray(error.stack || error.message),
    ].join('\n')
  }

  return result
}
