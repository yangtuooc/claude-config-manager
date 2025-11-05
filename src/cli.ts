#!/usr/bin/env node

import { Command } from 'commander';
import chalk from 'chalk';
import { VERSION } from './version';
import { createConfigManager } from './config-manager';
import { addCommand, listTemplates } from './commands/add';
import { listCommand, showCommand } from './commands/list';
import { switchCommand } from './commands/switch';
import { removeCommand } from './commands/remove';
import { updateCommand } from './commands/update';
import { keyAddCommand, keyListCommand, keySwitchCommand, keyRemoveCommand, keyEditCommand } from './commands/key';
import { editProfileCommand } from './commands/edit-profile';
import { wrapCommand } from './utils/command-wrapper';
import logger from './utils/logger';

const program = new Command();

// 程序基本信息
program
  .name('ccm')
  .description('Claude Code API 配置管理工具')
  .version(VERSION, '-v, --version');

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
  .action(wrapCommand(addCommand));

// list 命令 - 列出所有配置
program
  .command('list')
  .alias('ls')
  .description('列出所有 API 配置')
  .action(wrapCommand(listCommand));

// show 命令 - 显示配置详情
program
  .command('show <name>')
  .description('显示配置详情')
  .action(wrapCommand(showCommand));

// switch 命令 - 切换配置
program
  .command('switch [name]')
  .alias('use')
  .description('切换 API 配置')
  .action(wrapCommand(switchCommand));

// remove 命令 - 删除配置
program
  .command('remove [name]')
  .alias('rm')
  .description('删除 API 配置')
  .action(wrapCommand(removeCommand));

// edit 命令 - 编辑配置
program
  .command('edit [name]')
  .description('编辑 API 配置')
  .option('-n, --name <name>', '新配置名称')
  .option('-u, --base-url <url>', 'Base URL')
  .option('-t, --type <type>', '配置类型 (official|third-party|community)')
  .option('-d, --description <desc>', '配置描述')
  .action(wrapCommand(editProfileCommand));

// templates 命令 - 列出可用模板
program
  .command('templates')
  .description('列出可用的配置模板')
  .action(wrapCommand(listTemplates, { requireManager: false }));

// current 命令 - 显示当前活动配置
program
  .command('current')
  .description('显示当前活动的配置')
  .action(wrapCommand(async (manager) => {
    const config = await manager.getActiveConfig();

    if (!config) {
      logger.warn('没有活动配置');
      logger.log(chalk.gray('使用 "ccm switch" 激活一个配置'));
      return;
    }

    logger.log('\n' + chalk.bold('当前活动配置:') + '\n');
    logger.log(chalk.cyan('名称:       ') + chalk.bold(config.name));
    logger.log(chalk.cyan('Base URL:   ') + config.baseUrl);
    logger.log(chalk.cyan('类型:       ') + config.type);
    logger.log('');
  }));

// key 命令 - 管理配置的多个 API Keys
const keyCommand = program.command('key').description('管理配置的 API Keys');

// key add 子命令
keyCommand
  .command('add [config-name]')
  .description('为配置添加新的 API Key')
  .option('-k, --api-key <key>', 'API Key')
  .option('-a, --alias <alias>', 'Key 别名')
  .action(wrapCommand(keyAddCommand));

// key list 子命令
keyCommand
  .command('list [config-name]')
  .alias('ls')
  .description('列出配置的所有 API Keys')
  .action(wrapCommand(keyListCommand));

// key switch 子命令
keyCommand
  .command('switch [config-name] [key-id-or-alias]')
  .description('切换配置的活动 API Key')
  .action(wrapCommand(keySwitchCommand));

// key remove 子命令
keyCommand
  .command('remove [config-name] [key-id-or-alias]')
  .alias('rm')
  .description('删除配置的 API Key')
  .action(wrapCommand(keyRemoveCommand));

// key edit 子命令
keyCommand
  .command('edit [config-name] [key-id-or-alias]')
  .description('编辑配置的 API Key')
  .option('-k, --api-key <key>', 'API Key')
  .option('-a, --alias <alias>', 'Key 别名')
  .action(wrapCommand(keyEditCommand));

// update 命令 - 检查并安装更新
program
  .command('update')
  .description('检查并安装最新版本')
  .action(wrapCommand(updateCommand, { requireManager: false }));

// 解析命令行参数
program.parse();

// 如果没有提供任何命令，显示帮助信息
if (!process.argv.slice(2).length) {
  program.outputHelp();
}
