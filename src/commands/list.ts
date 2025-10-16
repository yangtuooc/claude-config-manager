import chalk from 'chalk';
import Table from 'cli-table3';
import { ConfigManager } from '../config-manager';

/**
 * 列出所有配置命令
 * @param manager 配置管理器
 */
export async function listCommand(manager: ConfigManager): Promise<void> {
  const configs = manager.getAllConfigs();
  const activeConfig = await manager.getActiveConfig();

  if (configs.length === 0) {
    console.log(chalk.yellow('还没有任何配置'));
    console.log(chalk.gray('使用 "ccm add" 添加第一个配置'));
    return;
  }

  // 创建表格
  const table = new Table({
    head: [
      chalk.cyan('名称'),
      chalk.cyan('类型'),
      chalk.cyan('Base URL'),
      chalk.cyan('描述'),
      chalk.cyan('状态')
    ],
    colWidths: [20, 15, 35, 30, 10]
  });

  // 添加配置行
  configs.forEach(config => {
    const isActive = activeConfig?.name === config.name;
    const status = isActive ? chalk.green('✓ 活动') : '';
    const name = isActive ? chalk.bold.green(config.name) : config.name;

    table.push([
      name,
      formatType(config.type),
      truncate(config.baseUrl, 33),
      truncate(config.description || '-', 28),
      status
    ]);
  });

  console.log('\n' + table.toString() + '\n');
  console.log(chalk.gray(`共 ${configs.length} 个配置`));

  if (activeConfig) {
    console.log(chalk.green(`\n当前活动配置: ${activeConfig.name}`));
  }
}

/**
 * 格式化配置类型显示
 */
function formatType(type: string): string {
  const typeMap: Record<string, string> = {
    official: chalk.blue('官方'),
    'third-party': chalk.magenta('第三方'),
    community: chalk.yellow('公益站')
  };
  return typeMap[type] || type;
}

/**
 * 截断过长的字符串
 */
function truncate(str: string, maxLength: number): string {
  if (str.length <= maxLength) {
    return str;
  }
  return str.substring(0, maxLength - 3) + '...';
}

/**
 * 显示配置详情
 * @param manager 配置管理器
 * @param name 配置名称
 */
export async function showCommand(manager: ConfigManager, name: string): Promise<void> {
  const config = manager.getConfig(name);

  if (!config) {
    console.log(chalk.red(`配置 "${name}" 不存在`));
    return;
  }

  const activeConfig = await manager.getActiveConfig();
  const isActive = activeConfig?.name === name;

  console.log('\n' + chalk.bold('配置详情:') + '\n');
  console.log(chalk.cyan('名称:       ') + config.name);
  console.log(chalk.cyan('类型:       ') + formatType(config.type));
  console.log(chalk.cyan('Base URL:   ') + config.baseUrl);
  console.log(chalk.cyan('API Key:    ') + maskApiKey(config.apiKey));
  console.log(chalk.cyan('描述:       ') + (config.description || '-'));
  console.log(chalk.cyan('状态:       ') + (isActive ? chalk.green('活动') : chalk.gray('未激活')));
  console.log(chalk.gray('创建时间:   ') + new Date(config.createdAt).toLocaleString('zh-CN'));
  console.log(chalk.gray('更新时间:   ') + new Date(config.updatedAt).toLocaleString('zh-CN'));
  console.log('');
}

/**
 * 隐藏 API Key 中间部分
 */
function maskApiKey(apiKey: string): string {
  if (apiKey.length <= 10) {
    return '*'.repeat(apiKey.length);
  }
  const start = apiKey.substring(0, 4);
  const end = apiKey.substring(apiKey.length - 4);
  return `${start}${'*'.repeat(apiKey.length - 8)}${end}`;
}
