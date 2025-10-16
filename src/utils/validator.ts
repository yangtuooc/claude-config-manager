import { IApiConfig } from '../types';

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
  // API Key 不能为空
  return apiKey.trim().length > 0;
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
 * 验证完整的配置对象
 * @param config 配置对象
 * @returns 验证结果 {valid: boolean, errors: string[]}
 */
export function validateConfig(config: Partial<IApiConfig>): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (!config.name || !isValidConfigName(config.name)) {
    errors.push('配置名称无效：只能包含字母、数字、连字符和下划线，长度 1-50');
  }

  if (!config.apiKey || !isValidApiKey(config.apiKey)) {
    errors.push('API Key 不能为空');
  }

  if (!config.baseUrl || !isValidBaseUrl(config.baseUrl)) {
    errors.push('Base URL 格式无效：必须是有效的 HTTP/HTTPS URL');
  }

  if (config.type && !['official', 'third-party', 'community'].includes(config.type)) {
    errors.push('配置类型无效：必须是 official、third-party 或 community');
  }

  return {
    valid: errors.length === 0,
    errors
  };
}
