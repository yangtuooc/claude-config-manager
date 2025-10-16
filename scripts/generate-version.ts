import { readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

try {
  // 读取 package.json
  const packageJsonPath = join(__dirname, '../package.json');
  const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8'));

  // 生成版本文件
  const versionFilePath = join(__dirname, '../src/version.ts');
  const versionFileContent = `/**
 * 自动生成的版本文件
 * 不要手动修改此文件
 */
export const VERSION = '${packageJson.version}';\n`;

  writeFileSync(versionFilePath, versionFileContent);
  console.log(`✓ Generated version file: ${packageJson.version}`);
} catch (error) {
  console.error('✗ Failed to generate version file');
  if (error instanceof Error) {
    console.error(error.message);
  }
  process.exit(1);
}
