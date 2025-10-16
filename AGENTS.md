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
