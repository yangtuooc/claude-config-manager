#!/usr/bin/env node

import { Command } from 'commander';
import chalk from 'chalk';
import { createConfigManager } from './config-manager';
import { addCommand, listTemplates } from './commands/add';
import { listCommand, showCommand } from './commands/list';
import { switchCommand } from './commands/switch';
import { removeCommand } from './commands/remove';

const program = new Command();

// 程序基本信息
program
  .name('ccm')
  .description('Claude Code API 配置管理工具')
  .version('1.0.0');

// add 命令 - 添加新配置
program
  .command('add')
  .description('添加新的 API 配置')
  .option('-n, --name <name>', '配置名称')
  .option('-k, --api-key <key>', 'API Key')
  .option('-u, --base-url <url>', 'Base URL')
  .option('-t, --type <type>', '配置类型 (official|third-party|community)')
  .option('-d, --description <desc>', '配置描述')
  .option('--template <name>', '使用模板')
  .action(async (options) => {
    try {
      const manager = await createConfigManager();
      await addCommand(manager, options);
    } catch (error) {
      process.exit(1);
    }
  });

// list 命令 - 列出所有配置
program
  .command('list')
  .alias('ls')
  .description('列出所有 API 配置')
  .action(async () => {
    try {
      const manager = await createConfigManager();
      await listCommand(manager);
    } catch (error) {
      console.log(chalk.red('列出配置失败'));
      process.exit(1);
    }
  });

// show 命令 - 显示配置详情
program
  .command('show <name>')
  .description('显示配置详情')
  .action(async (name) => {
    try {
      const manager = await createConfigManager();
      await showCommand(manager, name);
    } catch (error) {
      console.log(chalk.red('显示配置详情失败'));
      process.exit(1);
    }
  });

// switch 命令 - 切换配置
program
  .command('switch [name]')
  .alias('use')
  .description('切换 API 配置')
  .action(async (name) => {
    try {
      const manager = await createConfigManager();
      await switchCommand(manager, name);
    } catch (error) {
      process.exit(1);
    }
  });

// remove 命令 - 删除配置
program
  .command('remove [name]')
  .alias('rm')
  .description('删除 API 配置')
  .action(async (name) => {
    try {
      const manager = await createConfigManager();
      await removeCommand(manager, name);
    } catch (error) {
      process.exit(1);
    }
  });

// templates 命令 - 列出可用模板
program
  .command('templates')
  .description('列出可用的配置模板')
  .action(async () => {
    try {
      await listTemplates();
    } catch (error) {
      console.log(chalk.red('列出模板失败'));
      process.exit(1);
    }
  });

// current 命令 - 显示当前活动配置
program
  .command('current')
  .description('显示当前活动的配置')
  .action(async () => {
    try {
      const manager = await createConfigManager();
      const config = await manager.getActiveConfig();

      if (!config) {
        console.log(chalk.yellow('没有活动配置'));
        console.log(chalk.gray('使用 "ccm switch" 激活一个配置'));
        return;
      }

      console.log('\n' + chalk.bold('当前活动配置:') + '\n');
      console.log(chalk.cyan('名称:       ') + chalk.bold(config.name));
      console.log(chalk.cyan('Base URL:   ') + config.baseUrl);
      console.log(chalk.cyan('类型:       ') + config.type);
      console.log('');
    } catch (error) {
      console.log(chalk.red('获取当前配置失败'));
      process.exit(1);
    }
  });

// 解析命令行参数
program.parse();

// 如果没有提供任何命令，显示帮助信息
if (!process.argv.slice(2).length) {
  program.outputHelp();
}
