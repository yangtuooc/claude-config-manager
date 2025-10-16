import { promises as fs } from 'fs';
import { dirname } from 'path';
import { IApiConfig, IConfigStore, IClaudeConfig, IApiKey } from './types';
import {
  CONFIG_VERSION,
  CONFIG_DIR,
  CONFIG_STORE_PATH,
  CLAUDE_CONFIG_PATH,
  CLAUDE_CONFIG_DIR
} from './constants';
import {
  migrateConfig,
  getActiveKey,
  getActiveApiKey,
  generateKeyId
} from './utils/config-helpers';

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
    const rawStore = JSON.parse(content);

    // 迁移所有配置到新格式
    if (rawStore.configs && Array.isArray(rawStore.configs)) {
      rawStore.configs = rawStore.configs.map((config: any) => migrateConfig(config));
    }

    this.store = rawStore;

    // 如果有迁移，保存新格式
    await this.save();
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
   * @param config 配置对象（可以包含旧格式的 apiKey 字段）
   * @returns 是否添加成功
   */
  async addConfig(config: Omit<IApiConfig, 'createdAt' | 'updatedAt' | 'keys'> & { apiKey?: string; keys?: IApiKey[] }): Promise<boolean> {
    // 检查是否已存在同名配置
    if (this.store.configs.some(c => c.name === config.name)) {
      throw new Error(`配置 "${config.name}" 已存在`);
    }

    const now = new Date().toISOString();

    // 处理 keys：如果传入了 apiKey，转换为 keys 数组
    let keys: IApiKey[] = [];
    if (config.apiKey) {
      const keyId = generateKeyId();
      keys = [{
        id: keyId,
        apiKey: config.apiKey,
        isDefault: true,
        createdAt: now
      }];
    } else if (config.keys) {
      keys = config.keys;
    }

    const newConfig: IApiConfig = {
      name: config.name,
      keys,
      activeKeyId: keys.length > 0 ? keys[0].id : undefined,
      baseUrl: config.baseUrl,
      type: config.type,
      description: config.description,
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
   * 为配置添加新的 API Key
   * @param configName 配置名称
   * @param apiKey API Key
   * @param alias Key 别名（可选）
   * @returns 是否添加成功
   */
  async addKey(configName: string, apiKey: string, alias?: string): Promise<boolean> {
    const config = this.getConfig(configName);

    if (!config) {
      throw new Error(`配置 "${configName}" 不存在`);
    }

    // 检查是否已存在相同的 API Key
    if (config.keys.some(k => k.apiKey === apiKey)) {
      throw new Error('该 API Key 已存在');
    }

    // 检查别名是否已被使用
    if (alias && config.keys.some(k => k.alias === alias)) {
      throw new Error(`别名 "${alias}" 已被使用`);
    }

    const newKey: IApiKey = {
      id: generateKeyId(),
      apiKey,
      alias,
      isDefault: config.keys.length === 0, // 如果是第一个 Key，设为默认
      createdAt: new Date().toISOString()
    };

    config.keys.push(newKey);
    config.updatedAt = new Date().toISOString();

    // 如果这是第一个 Key，设置为活动 Key
    if (!config.activeKeyId) {
      config.activeKeyId = newKey.id;
    }

    await this.save();
    return true;
  }

  /**
   * 删除配置中的 API Key
   * @param configName 配置名称
   * @param keyIdOrAlias Key ID 或别名
   * @returns 是否删除成功
   */
  async removeKey(configName: string, keyIdOrAlias: string): Promise<boolean> {
    const config = this.getConfig(configName);

    if (!config) {
      throw new Error(`配置 "${configName}" 不存在`);
    }

    const index = config.keys.findIndex(
      k => k.id === keyIdOrAlias || k.alias === keyIdOrAlias
    );

    if (index === -1) {
      throw new Error(`Key "${keyIdOrAlias}" 不存在`);
    }

    // 不允许删除最后一个 Key
    if (config.keys.length === 1) {
      throw new Error('不能删除最后一个 API Key');
    }

    const removedKey = config.keys[index];
    config.keys.splice(index, 1);

    // 如果删除的是活动 Key，切换到第一个 Key
    if (config.activeKeyId === removedKey.id) {
      config.activeKeyId = config.keys[0].id;
    }

    // 如果删除的是默认 Key，将第一个 Key 设为默认
    if (removedKey.isDefault) {
      config.keys[0].isDefault = true;
    }

    config.updatedAt = new Date().toISOString();
    await this.save();
    return true;
  }

  /**
   * 切换配置的活动 API Key
   * @param configName 配置名称
   * @param keyIdOrAlias Key ID 或别名
   * @returns 是否切换成功
   */
  async switchKey(configName: string, keyIdOrAlias: string): Promise<boolean> {
    const config = this.getConfig(configName);

    if (!config) {
      throw new Error(`配置 "${configName}" 不存在`);
    }

    const key = config.keys.find(
      k => k.id === keyIdOrAlias || k.alias === keyIdOrAlias
    );

    if (!key) {
      throw new Error(`Key "${keyIdOrAlias}" 不存在`);
    }

    config.activeKeyId = key.id;
    key.lastUsed = new Date().toISOString();
    config.updatedAt = new Date().toISOString();

    await this.save();
    return true;
  }

  /**
   * 列出配置的所有 API Keys
   * @param configName 配置名称
   * @returns Key 列表
   */
  listKeys(configName: string): IApiKey[] {
    const config = this.getConfig(configName);

    if (!config) {
      throw new Error(`配置 "${configName}" 不存在`);
    }

    return [...config.keys];
  }

  /**
   * 从 Claude Code 配置文件中读取当前配置
   * @returns Claude Code 的配置对象，如果文件不存在返回 undefined
   */
  async getClaudeCodeConfig(): Promise<IClaudeConfig | undefined> {
    try {
      const content = await fs.readFile(CLAUDE_CONFIG_PATH, 'utf-8');
      return JSON.parse(content);
    } catch (error) {
      // 配置文件不存在或读取失败
      return undefined;
    }
  }

  /**
   * 获取当前活动配置
   * 通过读取 Claude Code 的实际配置文件来确定当前活动的配置
   * @returns 活动配置对象
   */
  async getActiveConfig(): Promise<IApiConfig | undefined> {
    // 读取 Claude Code 的实际配置
    const claudeConfig = await this.getClaudeCodeConfig();

    if (!claudeConfig || !claudeConfig.env) {
      return undefined;
    }

    const { ANTHROPIC_BASE_URL, ANTHROPIC_AUTH_TOKEN } = claudeConfig.env;

    if (!ANTHROPIC_AUTH_TOKEN) {
      return undefined;
    }

    // 在配置列表中查找匹配的配置
    // 通过遍历每个配置的 keys 来匹配 API Token
    const matchedConfig = this.store.configs.find(config => {
      // 检查配置中的任何一个 key 是否匹配
      const hasMatchingKey = config.keys.some(key => key.apiKey === ANTHROPIC_AUTH_TOKEN);
      const hasMatchingUrl = ANTHROPIC_BASE_URL ? config.baseUrl === ANTHROPIC_BASE_URL : true;
      return hasMatchingKey && hasMatchingUrl;
    });

    return matchedConfig;
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
   * @param keyId 指定要使用的 Key ID（可选，默认使用活动 Key）
   * @returns 是否应用成功
   */
  async applyToClaudeCode(name: string, keyId?: string): Promise<boolean> {
    const config = this.getConfig(name);

    if (!config) {
      throw new Error(`配置 "${name}" 不存在`);
    }

    // 获取要使用的 API Key
    let apiKey: string | undefined;
    if (keyId) {
      const key = config.keys.find(k => k.id === keyId);
      if (!key) {
        throw new Error(`Key ID "${keyId}" 不存在`);
      }
      apiKey = key.apiKey;
    } else {
      apiKey = getActiveApiKey(config);
    }

    if (!apiKey) {
      throw new Error(`配置 "${name}" 没有可用的 API Key`);
    }

    // 确保 Claude 配置目录存在
    await fs.mkdir(CLAUDE_CONFIG_DIR, { recursive: true });

    // 读取现有的 settings.json（如果存在）
    let existingConfig: IClaudeConfig = {};
    try {
      const content = await fs.readFile(CLAUDE_CONFIG_PATH, 'utf-8');
      existingConfig = JSON.parse(content);
    } catch (error) {
      // 文件不存在，使用空对象
    }

    // 更新 env 字段，保留其他字段
    const updatedConfig: IClaudeConfig = {
      ...existingConfig,
      env: {
        ...existingConfig.env,
        ANTHROPIC_BASE_URL: config.baseUrl,
        ANTHROPIC_AUTH_TOKEN: apiKey
      }
    };

    // 写入 Claude 配置文件
    const content = JSON.stringify(updatedConfig, null, 2);
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
