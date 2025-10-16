/**
 * API 配置类型
 */
export type ApiConfigType = 'official' | 'third-party' | 'community';

/**
 * API Key 信息
 */
export interface IApiKey {
  /** Key ID（唯一标识） */
  id: string;

  /** API Key */
  apiKey: string;

  /** 别名（可选） */
  alias?: string;

  /** 是否为默认 Key */
  isDefault?: boolean;

  /** 创建时间 */
  createdAt: string;

  /** 最后使用时间 */
  lastUsed?: string;
}

/**
 * API 配置接口
 */
export interface IApiConfig {
  /** 配置名称（唯一标识） */
  name: string;

  /** API Keys 列表 */
  keys: IApiKey[];

  /** 当前活动的 Key ID */
  activeKeyId?: string;

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

  // 以下字段用于向后兼容，不推荐使用
  /** @deprecated 使用 keys 代替 */
  apiKey?: string;
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
 * Claude Code 配置接口（settings.json 格式）
 */
export interface IClaudeConfig {
  /** 环境变量配置 */
  env?: {
    /** API Base URL */
    ANTHROPIC_BASE_URL?: string;
    /** API Auth Token */
    ANTHROPIC_AUTH_TOKEN?: string;
  };
  /** 其他可能的配置字段 */
  [key: string]: any;
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
