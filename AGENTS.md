# Claude Config Manager 开发规范

## 项目概述

本项目是一个用于管理 Claude Code API 配置的命令行工具，支持多个 API 配置的集中管理和快速切换。

## 开发原则

### 1. 依赖选择原则

优先级顺序：**成熟的第三方库 > 标准库 > 自定义实现**

- **成熟的第三方库优先**：优先使用经过验证、维护良好的第三方库，加快开发速度
  - CLI 框架：`commander` - 功能强大的命令行参数解析
  - 交互式输入：`inquirer` - 提供友好的用户交互体验
  - 终端样式：`chalk` - 彩色输出，提升用户体验
  - 表格展示：`cli-table3` - 格式化表格显示配置列表
  - 配置加密：`node-cryptr` 或使用 Node.js `crypto` 模块

- **标准库辅助**：基础功能使用 Node.js 内置模块
  - 文件操作：`fs/promises`、`path`
  - 加密：`crypto`
  - 操作系统：`os`

- **避免重复造轮子**：除非有特殊需求，否则不自行实现已有的成熟解决方案

### 2. 命令行工具最佳实践

#### 2.1 用户体验
- 提供清晰的帮助信息（--help）
- 支持版本查询（--version）
- 错误信息要明确、友好
- 操作成功要有明确反馈
- 支持交互式和非交互式两种模式

#### 2.2 命令设计
- 命令名称要简洁、语义明确
- 支持常用的简写形式（-v, -h 等）
- 子命令结构清晰，易于理解
- 参数命名遵循惯例

#### 2.3 配置管理
- 配置文件存储在用户目录下（~/.claude-config-manager/）
- 使用 JSON 格式存储配置
- 支持备份和恢复
- 配置变更要有日志记录

### 3. 代码规范

#### 3.1 TypeScript 规范
- 使用严格模式（strict: true）
- 所有函数必须有类型注解
- 接口和类型定义放在单独的 types.ts 文件
- 使用 ESM 模块系统

#### 3.2 命名规范
- 文件名：kebab-case（如：config-manager.ts）
- 类名：PascalCase（如：ConfigManager）
- 函数/变量名：camelCase（如：loadConfig）
- 常量：UPPER_SNAKE_CASE（如：DEFAULT_CONFIG_PATH）
- 接口：PascalCase，以 I 开头（如：IConfig）

#### 3.3 注释规范
- 所有公开 API 必须有 JSDoc 注释（中文）
- 复杂逻辑要有行内注释说明
- 注释使用中文
- 代码本身使用英文

### 4. 项目结构

```
claude-config-manager/
├── src/
│   ├── cli.ts              # CLI 入口
│   ├── types.ts            # 类型定义
│   ├── config-manager.ts   # 配置管理核心
│   ├── utils/              # 工具函数
│   │   ├── file.ts         # 文件操作
│   │   └── validator.ts    # 配置验证
│   └── commands/           # 命令实现
│       ├── add.ts          # 添加配置
│       ├── list.ts         # 列出配置
│       ├── switch.ts       # 切换配置
│       ├── remove.ts       # 删除配置
│       └── export.ts       # 导出配置
├── package.json
├── tsconfig.json
├── AGENTS.md               # 开发规范
└── README.md               # 使用文档
```

### 5. 核心功能需求

#### 5.1 配置管理
- 添加新的 API 配置（名称、API Key、Base URL 等）
- 列出所有已保存的配置
- 删除指定配置
- 编辑现有配置
- 导出/导入配置

#### 5.2 配置切换
- 快速切换到指定配置
- 显示当前激活的配置
- 支持临时切换（不保存为默认）

#### 5.3 配置模板
- 预设常见公益站的配置模板
- 用户可以基于模板快速创建配置

### 6. 数据结构设计

```typescript
interface IApiConfig {
  name: string;              // 配置名称
  apiKey: string;            // API Key
  baseUrl: string;           // API Base URL
  type: 'official' | 'third-party' | 'community';  // 类型
  description?: string;      // 描述
  createdAt: string;         // 创建时间
  updatedAt: string;         // 更新时间
}

interface IConfigStore {
  version: string;           // 配置文件版本
  activeConfig: string;      // 当前激活的配置名称
  configs: IApiConfig[];     // 所有配置列表
}
```

### 7. Claude Code 配置文件

Claude Code 的配置文件通常位于：
- macOS/Linux: `~/.claude/config.json`
- Windows: `%USERPROFILE%\.claude\config.json`

配置文件格式示例：
```json
{
  "apiKey": "sk-xxx",
  "baseUrl": "https://api.anthropic.com"
}
```

### 8. 错误处理

- 所有文件操作必须有错误处理
- 配置文件不存在时，自动创建默认配置
- API Key 等敏感信息要加密存储
- 网络请求要有超时和重试机制

### 9. 安全性

- API Key 使用加密存储
- 配置文件权限设置为 600（仅所有者可读写）
- 不在日志中输出敏感信息
- 导出配置时要提示敏感信息风险

### 10. 测试

- 核心功能必须有单元测试
- 文件操作使用 mock 测试
- 提供示例配置用于测试

## 开发流程

1. 先完成类型定义（types.ts）
2. 实现核心配置管理逻辑（config-manager.ts）
3. 实现各个命令（commands/）
4. 创建 CLI 入口（cli.ts）
5. 编写文档和示例
6. 测试和优化

## 注意事项

- 代码提交前必须通过 TypeScript 编译检查
- 遵循单一职责原则，每个模块只做一件事
- 函数保持简洁，单个函数不超过 50 行
- 避免使用 any 类型，必要时使用 unknown
- 所有异步操作使用 async/await

## 版本发布规范

### 11. Git 工作流

#### 11.1 分支管理
- **main 分支**：主分支，受保护，只能通过 PR 合并
- **feature/***: 功能开发分支
- **fix/***: 问题修复分支
- **chore/***: 配置和工具相关的修改分支

#### 11.2 提交规范
遵循 Conventional Commits 规范：

```
<type>(<scope>): <subject>

<body>

<footer>
```

**常用 type：**
- `feat`: 新功能
- `fix`: 修复 bug
- `docs`: 文档更新
- `style`: 代码格式调整（不影响功能）
- `refactor`: 重构代码
- `perf`: 性能优化
- `test`: 测试相关
- `build`: 构建系统或外部依赖变更
- `ci`: CI 配置变更
- `chore`: 其他不修改源代码的更改

**示例：**
```bash
feat(api): 添加配置导出功能
fix(config): 修复配置切换时的路径错误
chore(npm): 配置 npm 包发布
```

#### 11.3 代码提交流程

**重要原则：永远不要直接推送到 main 分支！**

1. **创建功能分支**
   ```bash
   git checkout -b feature/your-feature-name
   # 或
   git checkout -b fix/bug-description
   # 或
   git checkout -b chore/task-description
   ```

2. **开发并提交代码**
   ```bash
   git add .
   git commit -m "feat: 功能描述"
   ```

3. **推送到远程分支**
   ```bash
   git push origin feature/your-feature-name
   ```

4. **创建 Pull Request**
   - 在 GitHub 上创建 PR
   - 填写清晰的 PR 描述
   - 等待 CI 检查通过
   - 代码审查通过后合并到 main

### 12. npm 发布流程

本项目使用 **release-please** 自动化版本管理和发布。

#### 12.1 自动发布流程

1. **提交符合规范的 commit 到 main 分支**
   - 通过 PR 合并到 main
   - release-please 会分析 commit 消息

2. **release-please 自动创建 Release PR**
   - 自动更新版本号（遵循语义化版本）
   - 自动生成 CHANGELOG.md
   - PR 标题格式：`chore(main): release x.x.x`

3. **合并 Release PR 触发发布**
   - 自动构建项目（`npm run build`）
   - 自动发布到 npm（`npm publish`）
   - 自动创建 GitHub Release

#### 12.2 版本号规则

遵循语义化版本（Semantic Versioning）：`MAJOR.MINOR.PATCH`

- `feat`: 增加 MINOR 版本（例如：1.0.0 → 1.1.0）
- `fix`: 增加 PATCH 版本（例如：1.0.0 → 1.0.1）
- `BREAKING CHANGE`: 增加 MAJOR 版本（例如：1.0.0 → 2.0.0）

**触发 BREAKING CHANGE 的方式：**
```bash
git commit -m "feat!: 重构 API 接口"
# 或
git commit -m "feat: 重构 API 接口

BREAKING CHANGE: API 接口签名已更改"
```

#### 12.3 发布前检查清单

- [ ] 代码已通过所有测试
- [ ] TypeScript 编译无错误
- [ ] 更新了相关文档
- [ ] commit 消息符合规范
- [ ] 通过功能分支 PR 合并到 main
- [ ] 确保 npm token 已配置（GitHub Secrets: `NPM_TOKEN`）

#### 12.4 手动发布（仅限紧急情况）

如需手动发布，执行：
```bash
npm run build
npm version patch  # 或 minor, major
npm publish --access public
git push --tags
```

⚠️ **注意：优先使用自动发布流程，手动发布仅用于紧急情况！**
