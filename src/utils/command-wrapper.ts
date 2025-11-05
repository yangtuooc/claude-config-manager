import { ConfigManager } from '../config-manager';
import { AppError, UserCancelledError, ValidationError } from './errors';
import logger from './logger';

/**
 * 命令处理函数类型
 */
export type CommandHandler<T = void> = (manager: ConfigManager, ...args: any[]) => Promise<T>;

/**
 * 命令包装器选项
 */
export interface CommandWrapperOptions {
  /** 是否需要配置管理器 */
  requireManager?: boolean;
  /** 是否在错误时退出进程 */
  exitOnError?: boolean;
  /** 错误退出码 */
  exitCode?: number;
}

/**
 * 包装命令处理函数，统一错误处理
 * @param handler 命令处理函数
 * @param options 包装器选项
 * @returns 包装后的命令处理函数
 */
export function wrapCommand<T = void>(
  handler: CommandHandler<T>,
  options: CommandWrapperOptions = {}
): (...args: any[]) => Promise<void> {
  const {
    requireManager = true,
    exitOnError = true,
    exitCode = 1
  } = options;

  return async (...args: any[]): Promise<void> => {
    try {
      // 创建配置管理器（如果需要）
      let manager: ConfigManager | undefined;
      if (requireManager) {
        const { createConfigManager } = await import('../config-manager');
        manager = await createConfigManager();
      }

      // 执行命令处理函数
      await handler(manager!, ...args);
    } catch (error) {
      // 处理错误
      handleCommandError(error);

      // 如果需要，退出进程
      if (exitOnError) {
        process.exit(exitCode);
      }
    }
  };
}

/**
 * 处理命令错误
 * @param error 错误对象
 */
export function handleCommandError(error: any): void {
  // 用户取消操作
  if (error instanceof UserCancelledError) {
    logger.cancelled(error.message);
    return;
  }

  // 验证错误
  if (error instanceof ValidationError) {
    logger.error('验证失败:');
    error.errors.forEach(err => logger.error(`  - ${err}`));
    return;
  }

  // 应用错误
  if (error instanceof AppError) {
    logger.error(error.message);
    if (process.env.DEBUG) {
      logger.debug(`错误代码: ${error.code}`);
      logger.debug(`堆栈: ${error.stack}`);
    }
    return;
  }

  // 未知错误
  if (error instanceof Error) {
    logger.error('发生未知错误', error);
    if (process.env.DEBUG && error.stack) {
      logger.debug(error.stack);
    }
  } else {
    logger.error('发生未知错误', error);
  }
}

/**
 * 包装异步函数，添加错误处理
 * @param fn 异步函数
 * @returns 包装后的函数
 */
export async function tryCatch<T>(
  fn: () => Promise<T>,
  errorMessage?: string
): Promise<T> {
  try {
    return await fn();
  } catch (error) {
    if (errorMessage && error instanceof Error) {
      throw new AppError(`${errorMessage}: ${error.message}`);
    }
    throw error;
  }
}
