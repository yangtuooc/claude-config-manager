import { IConfigTemplate } from './types';
import { homedir } from 'os';
import { join } from 'path';

/**
 * 配置文件版本
 */
export const CONFIG_VERSION = '1.0.0';

/**
 * 配置管理器的配置目录
 */
export const CONFIG_DIR = join(homedir(), '.claude-config-manager');

/**
 * 配置存储文件路径
 */
export const CONFIG_STORE_PATH = join(CONFIG_DIR, 'config.json');

/**
 * Claude Code 配置目录
 */
export const CLAUDE_CONFIG_DIR = join(homedir(), '.claude');

/**
 * Claude Code 配置文件路径
 */
export const CLAUDE_CONFIG_PATH = join(CLAUDE_CONFIG_DIR, 'config.json');

/**
 * 预设的配置模板
 * 注意：这些模板仅包含 Base URL，用户仍需提供自己的 API Key
 */
export const CONFIG_TEMPLATES: IConfigTemplate[] = [
  {
    name: 'anthropic-official',
    baseUrl: 'https://api.anthropic.com',
    type: 'official',
    description: 'Anthropic 官方 API'
  },
  {
    name: 'openrouter',
    baseUrl: 'https://openrouter.ai/api',
    type: 'third-party',
    description: 'OpenRouter - 多模型聚合平台'
  },
  // 可以在这里添加更多公益站模板
];

/**
 * 默认 API 类型
 */
export const DEFAULT_API_TYPE = 'third-party';
