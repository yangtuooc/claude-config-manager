/**
 * 自定义错误类型
 */

/**
 * 基础应用错误类
 */
export class AppError extends Error {
  public readonly code: string;
  public readonly isOperational: boolean;

  constructor(message: string, code: string = 'APP_ERROR', isOperational: boolean = true) {
    super(message);
    this.name = this.constructor.name;
    this.code = code;
    this.isOperational = isOperational;
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * 配置相关错误
 */
export class ConfigError extends AppError {
  constructor(message: string, code: string = 'CONFIG_ERROR') {
    super(message, code);
  }
}

/**
 * 配置不存在错误
 */
export class ConfigNotFoundError extends ConfigError {
  constructor(configName: string) {
    super(`配置 "${configName}" 不存在`, 'CONFIG_NOT_FOUND');
  }
}

/**
 * 配置已存在错误
 */
export class ConfigExistsError extends ConfigError {
  constructor(configName: string) {
    super(`配置 "${configName}" 已存在`, 'CONFIG_EXISTS');
  }
}

/**
 * 验证错误
 */
export class ValidationError extends AppError {
  public readonly errors: string[];

  constructor(errors: string | string[]) {
    const errorArray = Array.isArray(errors) ? errors : [errors];
    super(errorArray.join('; '), 'VALIDATION_ERROR');
    this.errors = errorArray;
  }
}

/**
 * API Key 相关错误
 */
export class ApiKeyError extends AppError {
  constructor(message: string, code: string = 'API_KEY_ERROR') {
    super(message, code);
  }
}

/**
 * API Key 不存在错误
 */
export class ApiKeyNotFoundError extends ApiKeyError {
  constructor(keyIdentifier: string) {
    super(`API Key "${keyIdentifier}" 不存在`, 'API_KEY_NOT_FOUND');
  }
}

/**
 * API Key 已存在错误
 */
export class ApiKeyExistsError extends ApiKeyError {
  constructor(message: string = '该 API Key 已存在') {
    super(message, 'API_KEY_EXISTS');
  }
}

/**
 * 文件操作错误
 */
export class FileError extends AppError {
  constructor(message: string, code: string = 'FILE_ERROR') {
    super(message, code);
  }
}

/**
 * 用户取消操作错误
 */
export class UserCancelledError extends AppError {
  constructor(message: string = '操作已取消') {
    super(message, 'USER_CANCELLED', false);
  }
}

/**
 * 检查是否为操作性错误（可预期的错误）
 */
export function isOperationalError(error: Error): boolean {
  if (error instanceof AppError) {
    return error.isOperational;
  }
  return false;
}
