import { promises as fs } from 'fs';
import { dirname } from 'path';
import { IApiConfig, IConfigStore, IClaudeConfig } from './types';
import {
  CONFIG_VERSION,
  CONFIG_DIR,
  CONFIG_STORE_PATH,
  CLAUDE_CONFIG_PATH,
  CLAUDE_CONFIG_DIR
} from './constants';

/**
 * 配置管理器类
 * 负责管理所有的 API 配置
 */
export class ConfigManager {
  private store: IConfigStore;

  constructor() {
    this.store = {
      version: CONFIG_VERSION,
      activeConfig: '',
      configs: []
    };
  }

  /**
   * 初始化配置管理器
   * 确保配置目录和文件存在
   */
  async initialize(): Promise<void> {
    try {
      // 确保配置目录存在
      await fs.mkdir(CONFIG_DIR, { recursive: true });

      // 尝试加载现有配置
      await this.load();
    } catch (error) {
      // 如果配置文件不存在，创建默认配置
      await this.save();
    }
  }

  /**
   * 从文件加载配置
   */
  async load(): Promise<void> {
    const content = await fs.readFile(CONFIG_STORE_PATH, 'utf-8');
    this.store = JSON.parse(content);
  }

  /**
   * 保存配置到文件
   */
  async save(): Promise<void> {
    const content = JSON.stringify(this.store, null, 2);
    await fs.writeFile(CONFIG_STORE_PATH, content, 'utf-8');
  }

  /**
   * 添加新配置
   * @param config 配置对象
   * @returns 是否添加成功
   */
  async addConfig(config: Omit<IApiConfig, 'createdAt' | 'updatedAt'>): Promise<boolean> {
    // 检查是否已存在同名配置
    if (this.store.configs.some(c => c.name === config.name)) {
      throw new Error(`配置 "${config.name}" 已存在`);
    }

    const now = new Date().toISOString();
    const newConfig: IApiConfig = {
      ...config,
      createdAt: now,
      updatedAt: now
    };

    this.store.configs.push(newConfig);

    // 如果是第一个配置，自动设为活动配置
    if (this.store.configs.length === 1) {
      this.store.activeConfig = config.name;
    }

    await this.save();
    return true;
  }

  /**
   * 删除配置
   * @param name 配置名称
   * @returns 是否删除成功
   */
  async removeConfig(name: string): Promise<boolean> {
    const index = this.store.configs.findIndex(c => c.name === name);

    if (index === -1) {
      throw new Error(`配置 "${name}" 不存在`);
    }

    this.store.configs.splice(index, 1);

    // 如果删除的是当前活动配置，清空活动配置
    if (this.store.activeConfig === name) {
      this.store.activeConfig = this.store.configs.length > 0 ? this.store.configs[0].name : '';
    }

    await this.save();
    return true;
  }

  /**
   * 更新配置
   * @param name 配置名称
   * @param updates 要更新的字段
   * @returns 是否更新成功
   */
  async updateConfig(
    name: string,
    updates: Partial<Omit<IApiConfig, 'name' | 'createdAt' | 'updatedAt'>>
  ): Promise<boolean> {
    const config = this.store.configs.find(c => c.name === name);

    if (!config) {
      throw new Error(`配置 "${name}" 不存在`);
    }

    Object.assign(config, updates, {
      updatedAt: new Date().toISOString()
    });

    await this.save();
    return true;
  }

  /**
   * 获取所有配置
   * @returns 配置列表
   */
  getAllConfigs(): IApiConfig[] {
    return [...this.store.configs];
  }

  /**
   * 获取指定配置
   * @param name 配置名称
   * @returns 配置对象
   */
  getConfig(name: string): IApiConfig | undefined {
    return this.store.configs.find(c => c.name === name);
  }

  /**
   * 获取当前活动配置
   * @returns 活动配置对象
   */
  getActiveConfig(): IApiConfig | undefined {
    if (!this.store.activeConfig) {
      return undefined;
    }
    return this.getConfig(this.store.activeConfig);
  }

  /**
   * 设置活动配置
   * @param name 配置名称
   * @returns 是否设置成功
   */
  async setActiveConfig(name: string): Promise<boolean> {
    const config = this.getConfig(name);

    if (!config) {
      throw new Error(`配置 "${name}" 不存在`);
    }

    this.store.activeConfig = name;
    await this.save();
    return true;
  }

  /**
   * 应用配置到 Claude Code
   * 将指定配置写入 Claude Code 的配置文件
   * @param name 配置名称
   * @returns 是否应用成功
   */
  async applyToClaudeCode(name: string): Promise<boolean> {
    const config = this.getConfig(name);

    if (!config) {
      throw new Error(`配置 "${name}" 不存在`);
    }

    // 确保 Claude 配置目录存在
    await fs.mkdir(CLAUDE_CONFIG_DIR, { recursive: true });

    // 构建 Claude 配置
    const claudeConfig: IClaudeConfig = {
      apiKey: config.apiKey,
      baseUrl: config.baseUrl
    };

    // 写入 Claude 配置文件
    const content = JSON.stringify(claudeConfig, null, 2);
    await fs.writeFile(CLAUDE_CONFIG_PATH, content, 'utf-8');

    // 设置为活动配置
    await this.setActiveConfig(name);

    return true;
  }

  /**
   * 导出所有配置
   * @returns 配置存储对象
   */
  exportConfigs(): IConfigStore {
    return { ...this.store };
  }

  /**
   * 导入配置
   * @param store 配置存储对象
   * @param merge 是否与现有配置合并（默认覆盖）
   */
  async importConfigs(store: IConfigStore, merge: boolean = false): Promise<void> {
    if (merge) {
      // 合并配置，避免重复
      for (const config of store.configs) {
        const existing = this.store.configs.find(c => c.name === config.name);
        if (!existing) {
          this.store.configs.push(config);
        }
      }
    } else {
      // 完全替换
      this.store = { ...store };
    }

    await this.save();
  }
}

/**
 * 创建配置管理器实例
 * @returns 配置管理器实例
 */
export async function createConfigManager(): Promise<ConfigManager> {
  const manager = new ConfigManager();
  await manager.initialize();
  return manager;
}
