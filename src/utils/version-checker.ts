/**
 * 版本检查和更新工具
 */

/**
 * 从 npm registry 获取最新版本
 */
export async function getLatestVersion(packageName: string): Promise<string | null> {
  try {
    const response = await fetch(`https://registry.npmjs.org/${packageName}`);
    if (!response.ok) {
      return null;
    }
    const data = await response.json() as { 'dist-tags': { latest: string } };
    return data['dist-tags'].latest;
  } catch (error) {
    return null;
  }
}

/**
 * 比较版本号
 * 返回值：
 *   > 0: version1 > version2
 *   = 0: version1 = version2
 *   < 0: version1 < version2
 */
export function compareVersions(version1: string, version2: string): number {
  const v1Parts = version1.split('.').map(x => parseInt(x, 10));
  const v2Parts = version2.split('.').map(x => parseInt(x, 10));

  for (let i = 0; i < 3; i++) {
    const v1 = v1Parts[i] || 0;
    const v2 = v2Parts[i] || 0;

    if (v1 > v2) return 1;
    if (v1 < v2) return -1;
  }

  return 0;
}

/**
 * 检查是否有更新可用
 */
export async function hasUpdateAvailable(currentVersion: string, packageName: string): Promise<{
  hasUpdate: boolean;
  latestVersion: string | null;
}> {
  const latestVersion = await getLatestVersion(packageName);

  if (!latestVersion) {
    return { hasUpdate: false, latestVersion: null };
  }

  const hasUpdate = compareVersions(currentVersion, latestVersion) < 0;

  return { hasUpdate, latestVersion };
}
