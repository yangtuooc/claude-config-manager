import chalk from 'chalk';

/**
 * 日志级别
 */
export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
  SILENT = 4
}

/**
 * 日志工具类
 */
export class Logger {
  private level: LogLevel;

  constructor(level: LogLevel = LogLevel.INFO) {
    this.level = level;
  }

  /**
   * 设置日志级别
   */
  setLevel(level: LogLevel): void {
    this.level = level;
  }

  /**
   * 调试日志
   */
  debug(message: string, ...args: any[]): void {
    if (this.level <= LogLevel.DEBUG) {
      console.log(chalk.gray(`[DEBUG] ${message}`), ...args);
    }
  }

  /**
   * 信息日志
   */
  info(message: string, ...args: any[]): void {
    if (this.level <= LogLevel.INFO) {
      console.log(chalk.blue(message), ...args);
    }
  }

  /**
   * 成功日志
   */
  success(message: string, ...args: any[]): void {
    if (this.level <= LogLevel.INFO) {
      console.log(chalk.green(`✓ ${message}`), ...args);
    }
  }

  /**
   * 警告日志
   */
  warn(message: string, ...args: any[]): void {
    if (this.level <= LogLevel.WARN) {
      console.log(chalk.yellow(`⚠ ${message}`), ...args);
    }
  }

  /**
   * 错误日志
   */
  error(message: string, error?: Error | any, ...args: any[]): void {
    if (this.level <= LogLevel.ERROR) {
      console.log(chalk.red(`✗ ${message}`), ...args);
      if (error && this.level === LogLevel.DEBUG) {
        console.error(error);
      }
    }
  }

  /**
   * 一般日志（不带颜色）
   */
  log(message: string, ...args: any[]): void {
    if (this.level <= LogLevel.INFO) {
      console.log(message, ...args);
    }
  }

  /**
   * 取消操作日志
   */
  cancelled(message: string = '操作已取消'): void {
    if (this.level <= LogLevel.INFO) {
      console.log(chalk.gray(`✖ ${message}`));
    }
  }
}

// 默认日志实例
export const logger = new Logger(
  process.env.DEBUG ? LogLevel.DEBUG : LogLevel.INFO
);

// 便捷导出
export default logger;
