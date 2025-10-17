import chalk from 'chalk';
import inquirer from 'inquirer';
import { ConfigManager } from '../config-manager';
import { ApiConfigType } from '../types';

/**
 * edit:profile 命令 - 编辑已有配置
 */
export async function editProfileCommand(
  manager: ConfigManager,
  profileName?: string,
  options: {
    name?: string;
    baseUrl?: string;
    type?: ApiConfigType;
    description?: string;
  } = {}
): Promise<void> {
  try {
    // 如果没有提供配置名称，交互式选择
    if (!profileName) {
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
          message: '选择要编辑的配置:',
          choices: [
            ...configs.map(c => ({
              name: `${c.name} (${c.baseUrl})`,
              value: c.name
            })),
            new inquirer.Separator(),
            { name: chalk.gray('取消'), value: '__cancel__' }
          ]
        }
      ]);
      
      if (selected === '__cancel__') {
        console.log(chalk.gray('✖ 操作已取消'));
        return;
      }
      
      profileName = selected;
    }

    // 检查配置是否存在
    const config = manager.getConfig(profileName!);
    if (!config) {
      console.log(chalk.red(`配置 "${profileName}" 不存在`));
      return;
    }

    // 检查是否有命令行参数，如果没有则进入交互式模式
    const hasOptions = options.name || options.baseUrl || options.type || options.description !== undefined;

    let updates: Partial<{
      name: string;
      baseUrl: string;
      type: ApiConfigType;
      description: string;
    }> = {};

    if (!hasOptions) {
      // 交互式模式
      console.log(chalk.bold(`\n编辑配置: ${profileName}\n`));
      console.log(chalk.gray('提示: 直接按 Enter 保持当前值不变\n'));

      const answers = await inquirer.prompt([
        {
          type: 'input',
          name: 'name',
          message: '配置名称:',
          default: config.name,
          validate: (input: string) => {
            if (!input.trim()) {
              return '配置名称不能为空';
            }
            if (!/^[a-zA-Z0-9_-]+$/.test(input)) {
              return '只能包含字母、数字、连字符和下划线';
            }
            return true;
          }
        },
        {
          type: 'input',
          name: 'baseUrl',
          message: 'Base URL:',
          default: config.baseUrl,
          validate: (input: string) => {
            try {
              new URL(input);
              return true;
            } catch {
              return '请输入有效的 URL';
            }
          }
        },
        {
          type: 'list',
          name: 'type',
          message: '配置类型:',
          default: config.type,
          choices: [
            { name: '官方 API', value: 'official' },
            { name: '第三方 API', value: 'third-party' },
            { name: '公益站 API', value: 'community' }
          ]
        },
        {
          type: 'input',
          name: 'description',
          message: '描述:',
          default: config.description || ''
        }
      ]);

      updates = answers;
    } else {
      // 命令行参数模式
      if (options.name) updates.name = options.name;
      if (options.baseUrl) updates.baseUrl = options.baseUrl;
      if (options.type) updates.type = options.type;
      if (options.description !== undefined) updates.description = options.description;
    }

    // 确认是否有实际变更
    const hasChanges = 
      (updates.name && updates.name !== config.name) ||
      (updates.baseUrl && updates.baseUrl !== config.baseUrl) ||
      (updates.type && updates.type !== config.type) ||
      (updates.description !== undefined && updates.description !== config.description);

    if (!hasChanges) {
      console.log(chalk.yellow('没有任何变更'));
      return;
    }

    // 验证更新后的配置字段
    if (updates.name && !/^[a-zA-Z0-9_-]+$/.test(updates.name)) {
      console.log(chalk.red('配置名称无效：只能包含字母、数字、连字符和下划线'));
      return;
    }

    if (updates.baseUrl) {
      try {
        new URL(updates.baseUrl);
      } catch {
        console.log(chalk.red('Base URL 格式无效：必须是有效的 HTTP/HTTPS URL'));
        return;
      }
    }

    if (updates.type && !['official', 'third-party', 'community'].includes(updates.type)) {
      console.log(chalk.red('配置类型无效：必须是 official、third-party 或 community'));
      return;
    }

    // 确认保存更改
    const { confirmEdit } = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'confirmEdit',
        message: '确认保存更改?',
        default: true
      }
    ]);

    if (!confirmEdit) {
      console.log(chalk.gray('✖ 操作已取消'));
      return;
    }

    // 如果名称改变，使用 renameConfig
    const oldName = profileName!;
    if (updates.name && updates.name !== config.name) {
      await manager.renameConfig(profileName!, updates.name);
      profileName = updates.name;
    }

    // 更新其他字段
    const fieldsToUpdate: any = {};
    if (updates.baseUrl) fieldsToUpdate.baseUrl = updates.baseUrl;
    if (updates.type) fieldsToUpdate.type = updates.type;
    if (updates.description !== undefined) fieldsToUpdate.description = updates.description;

    if (Object.keys(fieldsToUpdate).length > 0) {
      await manager.updateConfig(profileName!, fieldsToUpdate);
    }

    console.log(chalk.green(`✓ 配置 "${profileName}" 已更新`));

    // 如果这是当前活动配置，询问是否同步到 Claude Code
    const activeConfigName = manager.getActiveConfigName();
    if (activeConfigName && (activeConfigName === oldName || activeConfigName === profileName)) {
      const { apply } = await inquirer.prompt([
        {
          type: 'confirm',
          name: 'apply',
          message: '这是当前活动配置，是否同步到 Claude Code?',
          default: true
        }
      ]);

      if (apply) {
        await manager.applyToClaudeCode(profileName!);
        console.log(chalk.green(`✓ 已同步到 Claude Code`));
      }
    }
  } catch (error) {
    if (error instanceof Error) {
      console.log(chalk.red(`✗ ${error.message}`));
    } else {
      console.log(chalk.red('编辑配置失败'));
    }
    throw error;
  }
}
