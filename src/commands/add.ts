import inquirer from 'inquirer';
import chalk from 'chalk';
import { ConfigManager } from '../config-manager';
import { ApiConfigType } from '../types';
import { validateConfig } from '../utils/validator';
import { CONFIG_TEMPLATES, DEFAULT_API_TYPE } from '../constants';

/**
 * 添加配置命令
 * @param manager 配置管理器
 * @param options 命令选项
 */
export async function addCommand(
  manager: ConfigManager,
  options: {
    name?: string;
    apiKey?: string;
    baseUrl?: string;
    type?: ApiConfigType;
    description?: string;
    template?: string;
  } = {}
): Promise<void> {
  try {
    let config = { ...options };

    // 如果指定了模板，使用模板的 baseUrl 和 type
    if (options.template) {
      const template = CONFIG_TEMPLATES.find(t => t.name === options.template);
      if (template) {
        config.baseUrl = template.baseUrl;
        config.type = template.type;
        console.log(chalk.blue(`使用模板: ${template.description}`));
      } else {
        console.log(chalk.yellow(`模板 "${options.template}" 不存在，将手动输入`));
      }
    }

    // 交互式输入缺失的字段
    const answers = await inquirer.prompt([
      {
        type: 'input',
        name: 'name',
        message: '配置名称:',
        when: !config.name,
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
        type: 'password',
        name: 'apiKey',
        message: 'API Key:',
        when: !config.apiKey,
        mask: '*',
        validate: (input: string) => {
          if (!input.trim()) {
            return 'API Key 不能为空';
          }
          return true;
        }
      },
      {
        type: 'input',
        name: 'baseUrl',
        message: 'Base URL:',
        when: !config.baseUrl,
        default: 'https://api.anthropic.com',
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
        when: !config.type,
        choices: [
          { name: '官方 API', value: 'official' },
          { name: '第三方 API', value: 'third-party' },
          { name: '公益站 API', value: 'community' }
        ],
        default: DEFAULT_API_TYPE
      },
      {
        type: 'input',
        name: 'description',
        message: '描述 (可选):',
        when: !config.description
      }
    ]);

    // 合并答案
    config = { ...config, ...answers };

    // 验证配置
    const validation = validateConfig(config);
    if (!validation.valid) {
      console.log(chalk.red('配置验证失败:'));
      validation.errors.forEach(error => console.log(chalk.red(`  - ${error}`)));
      return;
    }

    // 添加配置
    await manager.addConfig({
      name: config.name!,
      apiKey: config.apiKey!,
      baseUrl: config.baseUrl!,
      type: config.type!,
      description: config.description
    });

    console.log(chalk.green(`✓ 配置 "${config.name}" 已成功添加`));

    // 询问是否立即应用
    const { apply } = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'apply',
        message: '是否立即应用此配置到 Claude Code?',
        default: true
      }
    ]);

    if (apply) {
      await manager.applyToClaudeCode(config.name!);
      console.log(chalk.green(`✓ 配置已应用到 Claude Code`));
    }
  } catch (error) {
    if (error instanceof Error) {
      console.log(chalk.red(`✗ ${error.message}`));
    } else {
      console.log(chalk.red('发生未知错误'));
    }
    throw error;
  }
}

/**
 * 列出可用的模板
 */
export async function listTemplates(): Promise<void> {
  console.log(chalk.bold('\n可用的配置模板:\n'));

  CONFIG_TEMPLATES.forEach((template, index) => {
    console.log(chalk.cyan(`${index + 1}. ${template.name}`));
    console.log(`   ${template.description}`);
    console.log(chalk.gray(`   Base URL: ${template.baseUrl}\n`));
  });
}
