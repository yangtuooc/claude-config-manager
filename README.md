# Claude Config Manager (CCM)

Claude Code API 配置管理工具，支持多个 API 配置的集中管理和快速切换。

## 功能特性

- 🔧 **集中管理** - 统一管理多个 Claude Code API 配置
- 🔄 **快速切换** - 一键切换不同的 API 配置
- 📋 **配置模板** - 预设常见公益站和第三方 API 模板
- 🎨 **友好界面** - 彩色终端输出和交互式命令
- 🔒 **安全存储** - API Key 脱敏显示，配置文件本地存储
- 📦 **导入导出** - 支持配置的备份和恢复

## 安装

### 从源码安装

```bash
# 克隆项目
git clone <repository-url>
cd claude-config-manager

# 安装依赖
npm install

# 编译 TypeScript
npm run build

# 全局安装（可选）
npm link
```

### 使用 npm 安装（待发布）

```bash
npm install -g claude-config-manager
```

## 快速开始

### 1. 添加第一个配置

```bash
# 交互式添加配置
ccm add

# 使用命令行参数添加
ccm add -n my-config -k sk-your-api-key -u https://api.anthropic.com
```

### 2. 列出所有配置

```bash
ccm list
# 或使用别名
ccm ls
```

### 3. 切换配置

```bash
# 交互式选择配置
ccm switch

# 直接切换到指定配置
ccm switch my-config
```

### 4. 查看当前配置

```bash
ccm current
```

## 命令详解

### `ccm add` - 添加配置

添加新的 API 配置。

**选项：**
- `-n, --name <name>` - 配置名称
- `-k, --api-key <key>` - API Key
- `-u, --base-url <url>` - Base URL
- `-t, --type <type>` - 配置类型（official/third-party/community）
- `-d, --description <desc>` - 配置描述
- `--template <name>` - 使用模板

**示例：**

```bash
# 交互式添加
ccm add

# 使用官方 API 模板
ccm add --template anthropic-official

# 完整参数
ccm add \
  -n openrouter-config \
  -k sk-xxx \
  -u https://openrouter.ai/api \
  -t third-party \
  -d "OpenRouter API"
```

### `ccm list` - 列出配置

列出所有已保存的配置，以表格形式显示。

**别名：** `ls`

**示例：**

```bash
ccm list
ccm ls
```

### `ccm show <name>` - 显示配置详情

显示指定配置的详细信息。

**示例：**

```bash
ccm show my-config
```

### `ccm switch [name]` - 切换配置

切换到指定的 API 配置，并应用到 Claude Code。

**别名：** `use`

**示例：**

```bash
# 交互式选择
ccm switch

# 直接切换
ccm switch my-config
ccm use my-config
```

### `ccm remove [name]` - 删除配置

删除指定的配置。

**别名：** `rm`

**示例：**

```bash
# 交互式选择
ccm remove

# 直接删除（需要确认）
ccm remove my-config
```

### `ccm templates` - 列出模板

列出所有可用的配置模板。

**示例：**

```bash
ccm templates
```

### `ccm current` - 当前配置

显示当前活动的配置信息。

**示例：**

```bash
ccm current
```

## 配置文件

### 配置存储位置

- 配置管理器数据：`~/.claude-config-manager/config.json`
- Claude Code 配置：`~/.claude/config.json`

### 配置文件结构

```json
{
  "version": "1.0.0",
  "activeConfig": "my-config",
  "configs": [
    {
      "name": "my-config",
      "apiKey": "sk-xxx",
      "baseUrl": "https://api.anthropic.com",
      "type": "official",
      "description": "我的配置",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

## 预设模板

目前支持以下模板：

- **anthropic-official** - Anthropic 官方 API
- **openrouter** - OpenRouter 多模型聚合平台

## 开发

### 项目结构

```
claude-config-manager/
├── src/
│   ├── cli.ts              # CLI 入口
│   ├── types.ts            # 类型定义
│   ├── constants.ts        # 常量定义
│   ├── config-manager.ts   # 配置管理核心
│   ├── utils/              # 工具函数
│   │   ├── file.ts         # 文件操作
│   │   └── validator.ts    # 配置验证
│   └── commands/           # 命令实现
│       ├── add.ts          # 添加配置
│       ├── list.ts         # 列出配置
│       ├── switch.ts       # 切换配置
│       └── remove.ts       # 删除配置
├── package.json
├── tsconfig.json
├── AGENTS.md               # 开发规范
└── README.md               # 使用文档
```

### 开发脚本

```bash
# 开发模式（自动编译）
npm run dev

# 编译
npm run build

# 运行
npm start

# 本地测试
node dist/cli.js
```

### 开发规范

请参阅 [AGENTS.md](./AGENTS.md) 了解详细的开发规范。

## 常见问题

### Q: 配置切换后为什么 Claude Code 没有生效？

A: 请重启 Claude Code 客户端，新的配置会在重启后生效。

### Q: API Key 安全吗？

A: API Key 以明文形式存储在本地配置文件中（`~/.claude-config-manager/config.json`）。该文件仅存储在您的本地计算机上，不会上传到任何服务器。在终端显示时，API Key 会被脱敏处理（显示为 `sk-****`）。

### Q: 如何备份我的配置？

A: 配置文件存储在 `~/.claude-config-manager/config.json`，您可以直接备份这个文件。未来版本将支持内置的导出/导入功能。

### Q: 如何添加更多公益站模板？

A: 您可以编辑 `src/constants.ts` 文件中的 `CONFIG_TEMPLATES` 数组，添加新的模板。

## 贡献

欢迎提交 Issue 和 Pull Request！

请参阅 [RELEASE.md](./RELEASE.md) 了解版本发布流程。

## 更新日志

查看 [CHANGELOG.md](./CHANGELOG.md) 了解详细的更新历史。

## 许可证

MIT License
