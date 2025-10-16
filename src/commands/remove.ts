import inquirer from 'inquirer';
import chalk from 'chalk';
import { ConfigManager } from '../config-manager';

/**
 * 删除配置命令
 * @param manager 配置管理器
 * @param name 配置名称
 */
export async function removeCommand(
  manager: ConfigManager,
  name?: string
): Promise<void> {
  try {
    const configs = manager.getAllConfigs();

    if (configs.length === 0) {
      console.log(chalk.yellow('还没有任何配置'));
      return;
    }

    let targetName = name;

    // 如果没有指定配置名称，显示选择列表
    if (!targetName) {
      const choices = configs.map(config => ({
        name: config.name,
        value: config.name
      }));

      const answers = await inquirer.prompt([
        {
          type: 'list',
          name: 'config',
          message: '选择要删除的配置:',
          choices,
          pageSize: 10
        }
      ]);

      targetName = answers.config;
    }

    // 确保有配置名称
    if (!targetName) {
      console.log(chalk.red('未选择配置'));
      return;
    }

    // 检查配置是否存在
    const config = manager.getConfig(targetName);
    if (!config) {
      console.log(chalk.red(`配置 "${targetName}" 不存在`));
      return;
    }

    // 二次确认
    const { confirm } = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'confirm',
        message: `确定要删除配置 "${targetName}"?`,
        default: false
      }
    ]);

    if (!confirm) {
      console.log(chalk.gray('已取消删除'));
      return;
    }

    // 删除配置
    await manager.removeConfig(targetName);

    console.log(chalk.green(`✓ 配置 "${targetName}" 已删除`));

    // 如果删除的是当前活动配置，提示
    const activeConfig = manager.getActiveConfig();
    if (activeConfig && activeConfig.name !== targetName) {
      console.log(chalk.yellow(`当前活动配置已自动切换到: ${activeConfig.name}`));
    } else if (!activeConfig) {
      console.log(chalk.yellow('没有活动配置，请使用 "ccm switch" 切换'));
    }
  } catch (error) {
    if (error instanceof Error) {
      console.log(chalk.red(`✗ ${error.message}`));
    } else {
      console.log(chalk.red('删除配置失败'));
    }
    throw error;
  }
}
