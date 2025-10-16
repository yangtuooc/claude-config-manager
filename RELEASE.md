# 版本发布指南

本项目使用自动化的版本发布流程，基于 [Semantic Versioning](https://semver.org/) 和 [Conventional Commits](https://www.conventionalcommits.org/)。

## 自动化发布流程

### 工作原理

1. **提交代码**：开发者按照 Conventional Commits 规范提交代码到 `main` 分支
2. **自动分析**：GitHub Actions 自动分析提交历史，确定版本号变更
3. **创建 Release PR**：自动创建包含更新日志的 Release PR
4. **合并 PR**：维护者审核并合并 Release PR
5. **自动发布**：自动创建 GitHub Release、打标签、更新 CHANGELOG

### 版本号规则

遵循 [语义化版本控制 2.0.0](https://semver.org/lang/zh-CN/)：

```
MAJOR.MINOR.PATCH
```

- **MAJOR**（主版本号）：不兼容的 API 变更
- **MINOR**（次版本号）：向下兼容的功能新增
- **PATCH**（修订号）：向下兼容的问题修复

### Commit 类型对版本的影响

| Commit 类型 | 版本影响 | 示例 |
|------------|---------|------|
| `feat:` | MINOR +1 | `feat: 添加配置导出功能` |
| `fix:` | PATCH +1 | `fix: 修复配置切换时的路径错误` |
| `BREAKING CHANGE:` | MAJOR +1 | `feat!: 重构配置文件格式` |
| `docs:` | 无 | `docs: 更新 README` |
| `style:` | 无 | `style: 格式化代码` |
| `refactor:` | 无* | `refactor: 优化配置加载逻辑` |
| `perf:` | PATCH +1 | `perf: 优化配置读取性能` |
| `test:` | 无 | `test: 添加单元测试` |
| `chore:` | 无 | `chore: 更新依赖` |

> *注：`refactor:` 通常不触发发布，除非包含 `BREAKING CHANGE`

## Conventional Commits 规范

### 基本格式

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

### 示例

#### 1. 新功能（触发 MINOR 版本）

```bash
git commit -m "feat: 添加配置导出功能

支持将所有配置导出为 JSON 文件，方便备份和迁移。"
```

#### 2. Bug 修复（触发 PATCH 版本）

```bash
git commit -m "fix: 修复配置切换时的路径错误

修复在 Windows 系统下配置路径解析错误的问题。

Closes #123"
```

#### 3. 破坏性变更（触发 MAJOR 版本）

```bash
git commit -m "feat!: 重构配置文件格式

BREAKING CHANGE: 配置文件格式从 v1 升级到 v2，需要手动迁移旧配置。

迁移指南：
1. 备份旧配置文件
2. 运行 'ccm migrate' 命令
3. 验证配置正确性"
```

或使用 footer：

```bash
git commit -m "feat: 重构配置文件格式

配置文件格式从 v1 升级到 v2，提供更好的扩展性。

BREAKING CHANGE: 需要手动迁移旧配置，运行 'ccm migrate' 命令。"
```

#### 4. 文档更新（不触发版本）

```bash
git commit -m "docs: 更新快速开始指南

添加更多使用示例和常见问题解答。"
```

#### 5. 带作用域的提交

```bash
git commit -m "feat(cli): 添加配置验证命令

新增 'ccm validate' 命令，用于验证配置文件的正确性。"
```

## 发布流程

### 自动发布（推荐）

1. **正常开发和提交**
   ```bash
   git add .
   git commit -m "feat: 添加新功能"
   git push origin main
   ```

2. **等待 Release Please**
   - GitHub Actions 会自动运行
   - 如果有可发布的提交，会创建一个 Release PR
   - PR 标题：`chore(main): release 1.1.0`

3. **审核 Release PR**
   - 检查自动生成的 CHANGELOG
   - 确认版本号是否正确
   - 如有需要，可以编辑 CHANGELOG

4. **合并 Release PR**
   ```bash
   # 在 GitHub 上点击 "Merge" 按钮
   ```

5. **自动完成**
   - 自动创建 Git Tag（如 `v1.1.0`）
   - 自动创建 GitHub Release
   - 自动更新 CHANGELOG.md
   - 自动运行构建（如配置了 npm 发布，也会自动发布）

### 手动发布（特殊情况）

如果需要手动创建 Release：

```bash
# 1. 更新版本号
npm version patch  # 或 minor, major

# 2. 更新 CHANGELOG
# 手动编辑 CHANGELOG.md

# 3. 提交变更
git add .
git commit -m "chore: release v1.0.1"

# 4. 打标签
git tag v1.0.1

# 5. 推送
git push origin main --tags

# 6. 在 GitHub 上手动创建 Release
```

## CHANGELOG 格式

自动生成的 CHANGELOG 格式：

```markdown
# Changelog

## [1.1.0](https://github.com/yangtuooc/claude-config-manager/compare/v1.0.0...v1.1.0) (2024-10-16)

### ✨ Features

* 添加配置导出功能 ([abc123](https://github.com/yangtuooc/claude-config-manager/commit/abc123))
* 支持配置模板自定义 ([def456](https://github.com/yangtuooc/claude-config-manager/commit/def456))

### 🐛 Bug Fixes

* 修复配置切换时的路径错误 ([ghi789](https://github.com/yangtuooc/claude-config-manager/commit/ghi789))

### 📚 Documentation

* 更新快速开始指南 ([jkl012](https://github.com/yangtuooc/claude-config-manager/commit/jkl012))
```

## 版本号示例

假设当前版本是 `1.0.0`：

| 提交类型 | 当前版本 | 新版本 |
|---------|---------|--------|
| `fix:` | 1.0.0 | 1.0.1 |
| `feat:` | 1.0.0 | 1.1.0 |
| `feat!:` 或 `BREAKING CHANGE:` | 1.0.0 | 2.0.0 |
| `feat:` + `fix:` | 1.0.0 | 1.1.0 |
| `docs:` | 1.0.0 | (不发布) |

## 预发布版本（可选）

如需发布预发布版本（如 beta, alpha）：

```bash
# 创建预发布分支
git checkout -b release/v2.0.0-beta

# 提交到预发布分支
git push origin release/v2.0.0-beta

# 手动创建预发布 Release
# 标记为 "Pre-release"
```

## 最佳实践

### 1. 提交频率
- 小步提交，每个提交只做一件事
- 提交信息清晰，描述"做了什么"而不是"怎么做"

### 2. 合并策略
- 使用 Squash and Merge，保持主分支历史清晰
- 确保 squash 后的提交信息符合 Conventional Commits

### 3. 分支管理
```
main            # 主分支，只接受合并
  └── feature/* # 功能分支
  └── fix/*     # 修复分支
  └── docs/*    # 文档分支
```

### 4. Pull Request
- PR 标题使用 Conventional Commits 格式
- PR 描述清晰，包含变更说明和影响范围
- 审核通过后使用 "Squash and Merge"

### 5. 版本发布检查清单
- [ ] 所有测试通过
- [ ] 文档已更新
- [ ] CHANGELOG 准确无误
- [ ] 版本号符合预期
- [ ] 破坏性变更有迁移指南

## 故障排查

### Release Please 没有创建 PR

**原因**：
1. 没有符合规范的提交（如只有 `docs:` 提交）
2. GitHub Actions 权限不足
3. 已存在未合并的 Release PR

**解决**：
```bash
# 检查最近的提交
git log --oneline -10

# 检查 GitHub Actions 日志
# 访问 Actions 标签页查看运行日志
```

### 版本号不正确

**原因**：
- `.release-please-manifest.json` 中的版本与实际不符

**解决**：
```bash
# 1. 检查当前版本
cat .release-please-manifest.json

# 2. 手动修正版本号
echo '{"."："1.2.3"}' > .release-please-manifest.json

# 3. 提交修正
git add .release-please-manifest.json
git commit -m "chore: fix version in manifest"
git push
```

### CHANGELOG 不完整

**原因**：
- 某些提交不符合 Conventional Commits 规范

**解决**：
```bash
# 1. 检查提交历史
git log --oneline v1.0.0..HEAD

# 2. 手动编辑 CHANGELOG（在 Release PR 中）
# 或重新提交符合规范的 commit
```

## 参考资源

- [Semantic Versioning](https://semver.org/lang/zh-CN/)
- [Conventional Commits](https://www.conventionalcommits.org/zh-hans/)
- [Release Please Documentation](https://github.com/googleapis/release-please)
- [Keep a Changelog](https://keepachangelog.com/zh-CN/)

## 联系方式

如有问题或建议，请：
- 提交 Issue：https://github.com/yangtuooc/claude-config-manager/issues
- 发起 Discussion：https://github.com/yangtuooc/claude-config-manager/discussions
