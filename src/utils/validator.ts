import { IApiConfig, IApiKey, ApiConfigType } from '../types';

/**
 * 验证配置名称
 * @param name 配置名称
 * @returns 是否有效
 */
export function isValidConfigName(name: string): boolean {
  // 配置名称只能包含字母、数字、连字符和下划线
  const pattern = /^[a-zA-Z0-9_-]+$/;
  return pattern.test(name) && name.length > 0 && name.length <= 50;
}

/**
 * 验证 API Key
 * @param apiKey API Key
 * @returns 是否有效
 */
export function isValidApiKey(apiKey: string): boolean {
  // API Key 不能为空且应该有合理长度
  return typeof apiKey === 'string' && apiKey.trim().length > 0 && apiKey.length <= 500;
}

/**
 * 验证 Base URL
 * @param baseUrl Base URL
 * @returns 是否有效
 */
export function isValidBaseUrl(baseUrl: string): boolean {
  try {
    const url = new URL(baseUrl);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}

/**
 * 验证配置类型
 * @param type 配置类型
 * @returns 是否有效
 */
export function isValidConfigType(type: string): type is ApiConfigType {
  return ['official', 'third-party', 'community'].includes(type);
}

/**
 * 验证 API Key 对象
 * @param key API Key 对象
 * @returns 验证结果
 */
export function validateApiKey(key: Partial<IApiKey>): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (!key.id || typeof key.id !== 'string' || key.id.trim().length === 0) {
    errors.push('Key ID 无效');
  }

  if (!key.apiKey || !isValidApiKey(key.apiKey)) {
    errors.push('API Key 无效：不能为空且长度不能超过 500');
  }

  if (key.alias !== undefined && key.alias !== null) {
    if (typeof key.alias !== 'string' || key.alias.length > 50) {
      errors.push('Key 别名无效：长度不能超过 50');
    }
  }

  if (key.isDefault !== undefined && typeof key.isDefault !== 'boolean') {
    errors.push('isDefault 必须是布尔值');
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * 验证完整的配置对象
 * @param config 配置对象（可能包含旧格式的 apiKey 字段或新格式的 keys 数组）
 * @returns 验证结果 {valid: boolean, errors: string[]}
 */
export function validateConfig(
  config: Partial<IApiConfig> & { apiKey?: string }
): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  // 验证配置名称
  if (!config.name || !isValidConfigName(config.name)) {
    errors.push('配置名称无效：只能包含字母、数字、连字符和下划线，长度 1-50');
  }

  // 验证 API Key（兼容旧格式和新格式）
  if (config.apiKey) {
    // 旧格式：直接提供 apiKey
    if (!isValidApiKey(config.apiKey)) {
      errors.push('API Key 不能为空且长度不能超过 500');
    }
  } else if (config.keys && Array.isArray(config.keys)) {
    // 新格式：keys 数组
    if (config.keys.length === 0) {
      errors.push('配置必须至少包含一个 API Key');
    } else {
      // 验证每个 key
      config.keys.forEach((key, index) => {
        const keyValidation = validateApiKey(key);
        if (!keyValidation.valid) {
          errors.push(`Key ${index + 1} 验证失败: ${keyValidation.errors.join(', ')}`);
        }
      });

      // 检查是否有重复的 key ID
      const keyIds = config.keys.map(k => k.id);
      const uniqueKeyIds = new Set(keyIds);
      if (keyIds.length !== uniqueKeyIds.size) {
        errors.push('存在重复的 Key ID');
      }

      // 检查是否有重复的别名
      const aliases = config.keys.filter(k => k.alias).map(k => k.alias);
      const uniqueAliases = new Set(aliases);
      if (aliases.length !== uniqueAliases.size) {
        errors.push('存在重复的 Key 别名');
      }
    }
  } else {
    errors.push('配置必须包含 API Key（apiKey 字段或 keys 数组）');
  }

  // 验证 Base URL
  if (!config.baseUrl || !isValidBaseUrl(config.baseUrl)) {
    errors.push('Base URL 格式无效：必须是有效的 HTTP/HTTPS URL');
  }

  // 验证配置类型
  if (config.type && !isValidConfigType(config.type)) {
    errors.push('配置类型无效：必须是 official、third-party 或 community');
  }

  // 验证描述长度
  if (config.description && config.description.length > 200) {
    errors.push('描述长度不能超过 200 字符');
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * 验证配置存储对象
 * @param store 配置存储对象
 * @returns 验证结果
 */
export function validateConfigStore(store: any): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (!store || typeof store !== 'object') {
    errors.push('配置存储必须是对象');
    return { valid: false, errors };
  }

  if (!store.version || typeof store.version !== 'string') {
    errors.push('配置版本无效');
  }

  if (typeof store.activeConfig !== 'string') {
    errors.push('activeConfig 必须是字符串');
  }

  if (!Array.isArray(store.configs)) {
    errors.push('configs 必须是数组');
  } else {
    // 验证每个配置
    store.configs.forEach((config: any, index: number) => {
      const configValidation = validateConfig(config);
      if (!configValidation.valid) {
        errors.push(`配置 ${index + 1} (${config.name || 'unnamed'}) 验证失败: ${configValidation.errors.join(', ')}`);
      }
    });
  }

  return {
    valid: errors.length === 0,
    errors
  };
}
