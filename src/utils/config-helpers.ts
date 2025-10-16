import { IApiConfig, IApiKey } from '../types';
import { randomBytes } from 'crypto';

/**
 * 生成唯一的 Key ID
 */
export function generateKeyId(): string {
  return randomBytes(8).toString('hex');
}

/**
 * 迁移旧格式配置到新格式
 * @param config 可能是旧格式的配置
 * @returns 新格式的配置
 */
export function migrateConfig(config: any): IApiConfig {
  // 如果已经是新格式（有 keys 数组），直接返回
  if (config.keys && Array.isArray(config.keys)) {
    return config as IApiConfig;
  }

  // 旧格式：有 apiKey 字段
  if (config.apiKey) {
    const keyId = generateKeyId();
    const apiKey: IApiKey = {
      id: keyId,
      apiKey: config.apiKey,
      isDefault: true,
      createdAt: config.createdAt || new Date().toISOString()
    };

    const migratedConfig: IApiConfig = {
      ...config,
      keys: [apiKey],
      activeKeyId: keyId
    };

    // 删除旧的 apiKey 字段
    delete (migratedConfig as any).apiKey;

    return migratedConfig;
  }

  // 没有 apiKey 也没有 keys，返回带空 keys 数组的配置
  return {
    ...config,
    keys: []
  } as IApiConfig;
}

/**
 * 获取配置的活动 Key
 * @param config 配置对象
 * @returns 活动的 Key，如果没有则返回 undefined
 */
export function getActiveKey(config: IApiConfig): IApiKey | undefined {
  if (config.keys.length === 0) {
    return undefined;
  }

  // 如果指定了 activeKeyId，返回对应的 key
  if (config.activeKeyId) {
    const key = config.keys.find(k => k.id === config.activeKeyId);
    if (key) return key;
  }

  // 否则返回默认 key
  const defaultKey = config.keys.find((k: IApiKey) => k.isDefault);
  if (defaultKey) return defaultKey;

  // 如果没有默认 key，返回第一个
  return config.keys[0];
}

/**
 * 获取配置的活动 API Key 字符串
 * @param config 配置对象
 * @returns API Key 字符串
 */
export function getActiveApiKey(config: IApiConfig): string | undefined {
  const activeKey = getActiveKey(config);
  return activeKey?.apiKey;
}

/**
 * 脱敏显示 API Key
 * @param apiKey API Key
 * @returns 脱敏后的 API Key
 */
export function maskApiKey(apiKey: string): string {
  if (apiKey.length <= 8) {
    return '***';
  }
  return `${apiKey.substring(0, 4)}...${apiKey.substring(apiKey.length - 4)}`;
}
