import { promises as fs } from 'fs';
import { dirname } from 'path';

/**
 * 确保目录存在
 * @param dirPath 目录路径
 */
export async function ensureDir(dirPath: string): Promise<void> {
  try {
    await fs.access(dirPath);
  } catch {
    await fs.mkdir(dirPath, { recursive: true });
  }
}

/**
 * 检查文件是否存在
 * @param filePath 文件路径
 * @returns 是否存在
 */
export async function fileExists(filePath: string): Promise<boolean> {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

/**
 * 读取 JSON 文件
 * @param filePath 文件路径
 * @returns 解析后的对象
 */
export async function readJsonFile<T>(filePath: string): Promise<T> {
  const content = await fs.readFile(filePath, 'utf-8');
  return JSON.parse(content);
}

/**
 * 写入 JSON 文件
 * @param filePath 文件路径
 * @param data 要写入的数据
 */
export async function writeJsonFile<T>(filePath: string, data: T): Promise<void> {
  // 确保父目录存在
  await ensureDir(dirname(filePath));

  const content = JSON.stringify(data, null, 2);
  await fs.writeFile(filePath, content, 'utf-8');
}

/**
 * 备份文件
 * @param filePath 文件路径
 * @returns 备份文件路径
 */
export async function backupFile(filePath: string): Promise<string> {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupPath = `${filePath}.backup.${timestamp}`;

  if (await fileExists(filePath)) {
    await fs.copyFile(filePath, backupPath);
  }

  return backupPath;
}
