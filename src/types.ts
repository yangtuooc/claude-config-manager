/**
 * API 配置类型
 */
export type ApiConfigType = 'official' | 'third-party' | 'community';

/**
 * API 配置接口
 */
export interface IApiConfig {
  /** 配置名称（唯一标识） */
  name: string;

  /** API Key */
  apiKey: string;

  /** API Base URL */
  baseUrl: string;

  /** 配置类型 */
  type: ApiConfigType;

  /** 配置描述 */
  description?: string;

  /** 创建时间 */
  createdAt: string;

  /** 更新时间 */
  updatedAt: string;
}

/**
 * 配置存储接口
 */
export interface IConfigStore {
  /** 配置文件版本 */
  version: string;

  /** 当前激活的配置名称 */
  activeConfig: string;

  /** 所有配置列表 */
  configs: IApiConfig[];
}

/**
 * Claude Code 配置接口
 */
export interface IClaudeConfig {
  /** API Key */
  apiKey: string;

  /** API Base URL */
  baseUrl?: string;
}

/**
 * 配置模板接口
 */
export interface IConfigTemplate {
  /** 模板名称 */
  name: string;

  /** Base URL */
  baseUrl: string;

  /** 配置类型 */
  type: ApiConfigType;

  /** 模板描述 */
  description: string;
}

/**
 * 命令执行结果接口
 */
export interface ICommandResult {
  /** 是否成功 */
  success: boolean;

  /** 消息 */
  message: string;

  /** 数据 */
  data?: any;
}
