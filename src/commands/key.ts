import chalk from 'chalk';
import inquirer from 'inquirer';
import Table from 'cli-table3';
import { ConfigManager } from '../config-manager';
import { maskApiKey, getActiveKey } from '../utils/config-helpers';

/**
 * key add 命令 - 添加新的 API Key
 */
export async function keyAddCommand(
  manager: ConfigManager,
  configName?: string,
  options: {
    apiKey?: string;
    alias?: string;
  } = {}
): Promise<void> {
  try {
    // 如果没有提供配置名称，交互式选择
    if (!configName) {
      const configs = manager.getAllConfigs();
      if (configs.length === 0) {
        console.log(chalk.yellow('还没有任何配置'));
        console.log(chalk.gray('使用 "ccm add" 添加第一个配置'));
        return;
      }

      const { selected } = await inquirer.prompt([
        {
          type: 'list',
          name: 'selected',
          message: '选择要添加 Key 的配置:',
          choices: configs.map(c => ({
            name: `${c.name} (${c.baseUrl})`,
            value: c.name
          }))
        }
      ]);
      configName = selected;
    }

    // 检查配置是否存在
    const config = manager.getConfig(configName!);
    if (!config) {
      console.log(chalk.red(`配置 "${configName}" 不存在`));
      return;
    }

    let { apiKey, alias } = options;

    // 交互式输入缺失字段
    if (!apiKey) {
      const answers = await inquirer.prompt([
        {
          type: 'password',
          name: 'apiKey',
          message: 'API Key:',
          mask: '*',
          validate: (input: string) => {
            if (!input.trim()) {
              return 'API Key 不能为空';
            }
            return true;
          }
        }
      ]);
      apiKey = answers.apiKey;
    }

    if (!alias) {
      const answers = await inquirer.prompt([
        {
          type: 'input',
          name: 'alias',
          message: '别名 (可选):',
        }
      ]);
      alias = answers.alias || undefined;
    }

    // 添加 Key
    await manager.addKey(configName!, apiKey!, alias);

    console.log(chalk.green(`✓ 已为配置 "${configName}" 添加新的 API Key`));
    if (alias) {
      console.log(chalk.gray(`  别名: ${alias}`));
    }
  } catch (error) {
    if (error instanceof Error) {
      console.log(chalk.red(`✗ ${error.message}`));
    } else {
      console.log(chalk.red('添加 Key 失败'));
    }
    throw error;
  }
}

/**
 * key list 命令 - 列出配置的所有 Keys
 */
export async function keyListCommand(
  manager: ConfigManager,
  configName?: string
): Promise<void> {
  try {
    // 如果没有提供配置名称，交互式选择
    if (!configName) {
      const configs = manager.getAllConfigs();
      if (configs.length === 0) {
        console.log(chalk.yellow('还没有任何配置'));
        console.log(chalk.gray('使用 "ccm add" 添加第一个配置'));
        return;
      }

      const { selected } = await inquirer.prompt([
        {
          type: 'list',
          name: 'selected',
          message: '选择要查看 Keys 的配置:',
          choices: configs.map(c => ({
            name: `${c.name} (${c.baseUrl})`,
            value: c.name
          }))
        }
      ]);
      configName = selected;
    }

    const config = manager.getConfig(configName!);
    if (!config) {
      console.log(chalk.red(`配置 "${configName}" 不存在`));
      return;
    }

    const keys = manager.listKeys(configName!);

    if (keys.length === 0) {
      console.log(chalk.yellow(`配置 "${configName}" 没有 API Key`));
      return;
    }

    const activeKey = getActiveKey(config);

    console.log(chalk.bold(`\n${configName} 的 API Keys:\n`));

    const table = new Table({
      head: [
        chalk.cyan('别名'),
        chalk.cyan('API Key'),
        chalk.cyan('状态'),
        chalk.cyan('最后使用')
      ],
      colWidths: [20, 25, 12, 20]
    });

    keys.forEach(key => {
      const isActive = activeKey?.id === key.id;
      const status = isActive ? chalk.green('✓ 活动') : (key.isDefault ? chalk.blue('默认') : '');
      const alias = key.alias || chalk.gray('(无)');
      const lastUsed = key.lastUsed
        ? new Date(key.lastUsed).toLocaleString('zh-CN')
        : chalk.gray('-');

      table.push([
        alias,
        maskApiKey(key.apiKey),
        status,
        lastUsed
      ]);
    });

    console.log(table.toString());
    console.log(chalk.gray(`\n共 ${keys.length} 个 Key`));
    console.log('');
  } catch (error) {
    if (error instanceof Error) {
      console.log(chalk.red(`✗ ${error.message}`));
    } else {
      console.log(chalk.red('列出 Keys 失败'));
    }
    throw error;
  }
}

/**
 * key switch 命令 - 切换活动 Key
 */
export async function keySwitchCommand(
  manager: ConfigManager,
  configName?: string,
  keyIdOrAlias?: string
): Promise<void> {
  try {
    // 如果没有提供配置名称，交互式选择
    if (!configName) {
      const configs = manager.getAllConfigs();
      if (configs.length === 0) {
        console.log(chalk.yellow('还没有任何配置'));
        console.log(chalk.gray('使用 "ccm add" 添加第一个配置'));
        return;
      }

      const { selected } = await inquirer.prompt([
        {
          type: 'list',
          name: 'selected',
          message: '选择要切换 Key 的配置:',
          choices: configs.map(c => ({
            name: `${c.name} (${c.baseUrl})`,
            value: c.name
          }))
        }
      ]);
      configName = selected;
    }

    const config = manager.getConfig(configName!);
    if (!config) {
      console.log(chalk.red(`配置 "${configName}" 不存在`));
      return;
    }

    // 如果没有指定 keyIdOrAlias，交互式选择
    if (!keyIdOrAlias) {
      const keys = manager.listKeys(configName!);
      if (keys.length === 0) {
        console.log(chalk.yellow('没有可用的 Key'));
        return;
      }

      const activeKey = getActiveKey(config);

      const { selected } = await inquirer.prompt([
        {
          type: 'list',
          name: 'selected',
          message: '选择要切换到的 Key:',
          choices: keys.map(k => ({
            name: `${k.alias || maskApiKey(k.apiKey)} ${activeKey?.id === k.id ? chalk.green('(当前)') : ''}`,
            value: k.id
          }))
        }
      ]);
      keyIdOrAlias = selected;
    }

    await manager.switchKey(configName!, keyIdOrAlias!);
    console.log(chalk.green(`✓ 已切换配置 "${configName}" 的活动 Key 到: ${keyIdOrAlias}`));

    // 询问是否立即应用
    const { apply } = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'apply',
        message: '是否立即应用到 Claude Code?',
        default: true
      }
    ]);

    if (apply) {
      await manager.applyToClaudeCode(configName!);
      console.log(chalk.green(`✓ 已应用到 Claude Code`));
    }
  } catch (error) {
    if (error instanceof Error) {
      console.log(chalk.red(`✗ ${error.message}`));
    } else {
      console.log(chalk.red('切换 Key 失败'));
    }
    throw error;
  }
}

/**
 * key remove 命令 - 删除 Key
 */
export async function keyRemoveCommand(
  manager: ConfigManager,
  configName?: string,
  keyIdOrAlias?: string
): Promise<void> {
  try {
    // 如果没有提供配置名称，交互式选择
    if (!configName) {
      const configs = manager.getAllConfigs();
      if (configs.length === 0) {
        console.log(chalk.yellow('还没有任何配置'));
        console.log(chalk.gray('使用 "ccm add" 添加第一个配置'));
        return;
      }

      const { selected } = await inquirer.prompt([
        {
          type: 'list',
          name: 'selected',
          message: '选择要删除 Key 的配置:',
          choices: configs.map(c => ({
            name: `${c.name} (${c.baseUrl})`,
            value: c.name
          }))
        }
      ]);
      configName = selected;
    }

    const config = manager.getConfig(configName!);
    if (!config) {
      console.log(chalk.red(`配置 "${configName}" 不存在`));
      return;
    }

    // 如果没有指定 keyIdOrAlias，交互式选择
    if (!keyIdOrAlias) {
      const keys = manager.listKeys(configName!);
      if (keys.length === 0) {
        console.log(chalk.yellow('没有可删除的 Key'));
        return;
      }

      const { selected } = await inquirer.prompt([
        {
          type: 'list',
          name: 'selected',
          message: '选择要删除的 Key:',
          choices: keys.map(k => ({
            name: `${k.alias || maskApiKey(k.apiKey)} ${k.isDefault ? chalk.blue('(默认)') : ''}`,
            value: k.id
          }))
        }
      ]);
      keyIdOrAlias = selected;
    }

    // 确认删除
    const { confirm } = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'confirm',
        message: `确认删除 Key "${keyIdOrAlias}"?`,
        default: false
      }
    ]);

    if (!confirm) {
      console.log(chalk.yellow('已取消'));
      return;
    }

    await manager.removeKey(configName!, keyIdOrAlias!);
    console.log(chalk.green(`✓ 已删除 Key "${keyIdOrAlias}"`));
  } catch (error) {
    if (error instanceof Error) {
      console.log(chalk.red(`✗ ${error.message}`));
    } else {
      console.log(chalk.red('删除 Key 失败'));
    }
    throw error;
  }
}

/**
 * key edit 命令 - 编辑 API Key
 */
export async function keyEditCommand(
  manager: ConfigManager,
  configName?: string,
  keyIdOrAlias?: string,
  options: {
    apiKey?: string;
    alias?: string;
  } = {}
): Promise<void> {
  try {
    // 如果没有提供配置名称，交互式选择
    if (!configName) {
      const configs = manager.getAllConfigs();
      if (configs.length === 0) {
        console.log(chalk.yellow('还没有任何配置'));
        console.log(chalk.gray('使用 "ccm add" 添加第一个配置'));
        return;
      }

      const { selected } = await inquirer.prompt([
        {
          type: 'list',
          name: 'selected',
          message: '选择要编辑 Key 的配置:',
          choices: configs.map(c => ({
            name: `${c.name} (${c.baseUrl})`,
            value: c.name
          }))
        }
      ]);
      configName = selected;
    }

    const config = manager.getConfig(configName!);
    if (!config) {
      console.log(chalk.red(`配置 "${configName}" 不存在`));
      return;
    }

    // 如果没有指定 keyIdOrAlias，交互式选择
    if (!keyIdOrAlias) {
      const keys = manager.listKeys(configName!);
      if (keys.length === 0) {
        console.log(chalk.yellow('没有可编辑的 Key'));
        return;
      }

      const activeKey = getActiveKey(config);

      const { selected } = await inquirer.prompt([
        {
          type: 'list',
          name: 'selected',
          message: '选择要编辑的 Key:',
          choices: keys.map(k => ({
            name: `${k.alias || maskApiKey(k.apiKey)} ${activeKey?.id === k.id ? chalk.green('(当前)') : ''}`,
            value: k.id
          }))
        }
      ]);
      keyIdOrAlias = selected;
    }

    // 获取要编辑的 key
    const key = config.keys.find(k => k.id === keyIdOrAlias || k.alias === keyIdOrAlias);
    if (!key) {
      console.log(chalk.red(`Key "${keyIdOrAlias}" 不存在`));
      return;
    }

    // 检查是否有命令行参数，如果没有则进入交互式模式
    const hasOptions = options.apiKey || options.alias !== undefined;

    let updates: Partial<{
      apiKey: string;
      alias: string;
    }> = {};

    if (!hasOptions) {
      // 交互式模式
      console.log(chalk.bold(`\n编辑 API Key: ${key.alias || maskApiKey(key.apiKey)}\n`));
      console.log(chalk.gray('提示: 直接按 Enter 保持当前值不变\n'));

      const answers = await inquirer.prompt([
        {
          type: 'password',
          name: 'apiKey',
          message: `API Key (当前: ${maskApiKey(key.apiKey)}):`,
          mask: '*',
          validate: (input: string) => {
            if (input && !input.trim()) {
              return 'API Key 不能为空';
            }
            return true;
          }
        },
        {
          type: 'input',
          name: 'alias',
          message: '别名:',
          default: key.alias || ''
        }
      ]);

      // 只有当用户输入了内容才更新
      if (answers.apiKey) updates.apiKey = answers.apiKey;
      if (answers.alias !== key.alias) updates.alias = answers.alias;
    } else {
      // 命令行参数模式
      if (options.apiKey) updates.apiKey = options.apiKey;
      if (options.alias !== undefined) updates.alias = options.alias;
    }

    // 确认是否有实际变更
    if (Object.keys(updates).length === 0) {
      console.log(chalk.yellow('没有任何变更'));
      return;
    }

    // 更新 Key
    await manager.updateKey(configName!, keyIdOrAlias!, updates);
    console.log(chalk.green(`✓ 已更新 API Key`));

    // 如果这是当前活动配置的活动 Key，询问是否同步到 Claude Code
    const activeConfigName = manager.getActiveConfigName();
    const activeKey = getActiveKey(config);
    if (activeConfigName === configName && activeKey?.id === key.id) {
      const { apply } = await inquirer.prompt([
        {
          type: 'confirm',
          name: 'apply',
          message: '这是当前活动配置的活动 Key，是否同步到 Claude Code?',
          default: true
        }
      ]);

      if (apply) {
        await manager.applyToClaudeCode(configName!);
        console.log(chalk.green(`✓ 已同步到 Claude Code`));
      }
    }
  } catch (error) {
    if (error instanceof Error) {
      console.log(chalk.red(`✗ ${error.message}`));
    } else {
      console.log(chalk.red('编辑 Key 失败'));
    }
    throw error;
  }
}
