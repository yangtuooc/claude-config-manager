import chalk from 'chalk';
import { exec } from 'child_process';
import { promisify } from 'util';
import { getLatestVersion, compareVersions } from '../utils/version-checker';
import { VERSION } from '../version';

const execAsync = promisify(exec);

/**
 * 更新命令
 * 检查并安装最新版本
 */
export async function updateCommand(): Promise<void> {
  try {
    const packageName = 'claude-config-manager';

    console.log(chalk.cyan('检查更新...'));
    console.log(chalk.gray(`当前版本: ${VERSION}`));

    // 获取最新版本
    const latestVersion = await getLatestVersion(packageName);

    if (!latestVersion) {
      console.log(chalk.yellow('无法获取最新版本信息，请检查网络连接'));
      return;
    }

    console.log(chalk.gray(`最新版本: ${latestVersion}`));
    console.log('');

    // 比较版本
    const compareResult = compareVersions(VERSION, latestVersion);

    if (compareResult >= 0) {
      console.log(chalk.green('✓ 已是最新版本，无需更新'));
      return;
    }

    // 有新版本，开始安装
    console.log(chalk.cyan(`发现新版本，开始安装...`));
    console.log('');

    try {
      await execAsync(`npm install -g ${packageName}@latest`);
      console.log('');
      console.log(chalk.green(`✓ 更新成功，已安装版本 ${latestVersion}`));
      console.log(chalk.gray('请在新终端窗口中使用新版本'));
    } catch (error) {
      console.log('');
      console.log(chalk.red('✗ 安装失败'));
      if (error instanceof Error) {
        console.log(chalk.gray(`错误: ${error.message}`));
      }
      console.log(chalk.gray(`请手动运行: npm install -g ${packageName}@latest`));
      throw error;
    }
  } catch (error) {
    if (error instanceof Error) {
      console.log(chalk.red(`✗ ${error.message}`));
    } else {
      console.log(chalk.red('检查更新失败'));
    }
    throw error;
  }
}
