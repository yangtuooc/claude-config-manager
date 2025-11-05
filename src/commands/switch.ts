import inquirer from 'inquirer';
import chalk from 'chalk';
import { ConfigManager } from '../config-manager';
import { UserCancelledError } from '../utils/errors';
import logger from '../utils/logger';

/**
 * 切换配置命令
 * @param manager 配置管理器
 * @param name 配置名称（可选）
 */
export async function switchCommand(
  manager: ConfigManager,
  name?: string
): Promise<void> {
  try {
    const configs = manager.getAllConfigs();

    if (configs.length === 0) {
      logger.warn('还没有任何配置');
      logger.log(chalk.gray('使用 "ccm add" 添加第一个配置'));
      return;
    }

    let targetName = name;

    // 如果没有指定配置名称，显示选择列表
    if (!targetName) {
      const activeConfig = await manager.getActiveConfig();
      const choices = [
        ...configs.map(config => ({
          name: config.name === activeConfig?.name
            ? `${config.name} ${chalk.green('(当前)')}`
            : config.name,
          value: config.name,
          short: config.name
        })),
        new inquirer.Separator(),
        { name: chalk.gray('取消'), value: '__cancel__' }
      ];

      const answers = await inquirer.prompt([
        {
          type: 'list',
          name: 'config',
          message: '选择要切换的配置:',
          choices,
          pageSize: 10
        }
      ]);

      if (answers.config === '__cancel__') {
        throw new UserCancelledError();
      }

      targetName = answers.config;
    }

    // 确保有配置名称
    if (!targetName) {
      logger.error('未选择配置');
      return;
    }

    // 应用配置
    await manager.applyToClaudeCode(targetName);

    logger.success(`已切换到配置 "${targetName}"`);
    logger.log(chalk.gray('Claude Code 将使用新的 API 配置'));

    // 显示配置信息
    const config = manager.getConfig(targetName);
    if (config) {
      logger.log('');
      logger.log(chalk.cyan('Base URL: ') + config.baseUrl);
      logger.log(chalk.cyan('类型:     ') + config.type);
    }
  } catch (error) {
    // 错误将由命令包装器处理
    throw error;
  }
}
