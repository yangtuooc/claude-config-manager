# 快速开始指南

## 安装和配置

### 1. 安装依赖

```bash
npm install
```

### 2. 编译项目

```bash
npm run build
```

### 3. 链接到全局（可选）

```bash
npm link
```

之后就可以在任何地方使用 `ccm` 命令。

## 使用示例

### 示例 1：添加官方 API 配置

```bash
# 使用交互式命令添加
ccm add

# 按提示输入：
# 配置名称: official
# API Key: sk-ant-xxx...
# Base URL: https://api.anthropic.com
# 配置类型: 官方 API
# 描述: Anthropic 官方 API
```

### 示例 2：使用模板快速添加配置

```bash
# 先查看可用模板
ccm templates

# 使用模板添加配置（只需输入名称和 API Key）
ccm add --template anthropic-official
```

### 示例 3：添加多个公益站配置

假设你有多个公益站 API：

```bash
# 添加公益站 A
ccm add \
  -n community-a \
  -k sk-xxx-from-community-a \
  -u https://api.community-a.com \
  -t community \
  -d "公益站 A"

# 添加公益站 B
ccm add \
  -n community-b \
  -k sk-xxx-from-community-b \
  -u https://api.community-b.com \
  -t community \
  -d "公益站 B"
```

### 示例 4：查看和切换配置

```bash
# 列出所有配置
ccm list

# 输出示例：
# ┌──────────────┬───────┬─────────────────────────┬─────────┬──────┐
# │ 名称         │ 类型  │ Base URL                │ 描述    │ 状态 │
# ├──────────────┼───────┼─────────────────────────┼─────────┼──────┤
# │ official     │ 官方  │ https://api.anthropic...│ 官方API │ ✓ 活动│
# │ community-a  │ 公益站│ https://api.community...│ 公益站A │      │
# │ community-b  │ 公益站│ https://api.community...│ 公益站B │      │
# └──────────────┴───────┴─────────────────────────┴─────────┴──────┘

# 切换到公益站 A
ccm switch community-a

# 或使用交互式选择
ccm switch
```

### 示例 5：查看配置详情

```bash
# 查看当前活动配置
ccm current

# 查看指定配置的详细信息
ccm show community-a

# 输出示例：
# 配置详情:
#
# 名称:       community-a
# 类型:       公益站
# Base URL:   https://api.community-a.com
# API Key:    sk-x****xxx
# 描述:       公益站 A
# 状态:       活动
# 创建时间:   2024-10-16 11:00:00
# 更新时间:   2024-10-16 11:00:00
```

### 示例 6：管理配置

```bash
# 删除不再使用的配置
ccm remove community-b

# 或使用交互式选择
ccm rm
```

## 常见使用场景

### 场景 1：在多个公益站之间快速切换

当某个公益站速度变慢或不可用时：

```bash
# 1. 查看所有配置
ccm list

# 2. 快速切换到另一个公益站
ccm switch community-b

# 3. 重启 Claude Code 客户端
```

### 场景 2：工作和个人项目使用不同配置

```bash
# 添加工作配置
ccm add -n work -k sk-work-key -u https://api.company.com

# 添加个人配置
ccm add -n personal -k sk-personal-key -u https://api.anthropic.com

# 在工作时
ccm switch work

# 在个人项目时
ccm switch personal
```

### 场景 3：测试不同 API 提供商

```bash
# 添加多个第三方 API
ccm add --template openrouter
ccm add -n another-provider -k xxx -u https://api.another.com

# 快速切换测试
ccm switch openrouter
# 测试性能和响应...

ccm switch another-provider
# 对比测试...
```

## 开发和调试

### 开发模式

```bash
# 启动自动编译
npm run dev
```

在另一个终端中测试：

```bash
# 直接运行编译后的代码
node dist/cli.js <command>
```

### 本地测试

如果你还没有全局链接，可以这样测试：

```bash
# 使用完整路径
node dist/cli.js add
node dist/cli.js list
node dist/cli.js switch
```

### 查看配置文件

```bash
# 查看配置管理器的配置
cat ~/.claude-config-manager/config.json

# 查看 Claude Code 当前配置
cat ~/.claude/config.json
```

## 提示和技巧

1. **使用别名**：`ls` 等同于 `list`，`rm` 等同于 `remove`，`use` 等同于 `switch`

2. **快速切换**：直接使用配置名称参数可以跳过交互式选择
   ```bash
   ccm switch my-config
   ```

3. **记住重启**：切换配置后，需要重启 Claude Code 客户端才能生效

4. **备份配置**：定期备份 `~/.claude-config-manager/config.json` 文件

5. **API Key 安全**：
   - 配置文件仅存储在本地
   - 显示时会自动脱敏
   - 不要将配置文件提交到 Git 仓库

## 下一步

- 根据你的需求添加更多公益站模板到 `src/constants.ts`
- 自定义配置类型和字段
- 集成到你的工作流程中

如有问题，请查看 [README.md](./README.md) 或提交 Issue。
