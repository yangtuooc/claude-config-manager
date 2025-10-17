# 编辑功能实现总结

## 概述

为 claude-config-manager 添加了编辑已有 profiles 和 API keys 的功能，支持交互式和命令行参数两种模式。

## 实现的功能

### 1. Profile 编辑命令

**命令**: `ccm edit [name]`

**命令行选项**:
- `-n, --name <name>` - 新配置名称（支持重命名）
- `-u, --base-url <url>` - Base URL
- `-t, --type <type>` - 配置类型（official|third-party|community）
- `-d, --description <desc>` - 配置描述

**功能特点**:
- 支持交互式和命令行参数两种模式
- 支持配置重命名，自动更新内部引用
- 当编辑活动配置时，提示同步到 Claude Code
- 完整的输入验证（配置名格式、URL 格式、配置类型）
- 如果没有实际变更，给出提示

### 2. API Key 编辑命令

**命令**: `ccm key edit [config-name] [key-id-or-alias]`

**命令行选项**:
- `-k, --api-key <key>` - 新的 API Key 值
- `-a, --alias <alias>` - Key 别名

**功能特点**:
- 支持交互式和命令行参数两种模式
- 交互式模式下 API Key 值 masked 显示
- 支持通过 Key ID 或别名定位 key
- 别名冲突检测
- 当编辑活动配置的活动 Key 时，提示同步到 Claude Code

## 新增文件

### 1. `/src/commands/edit-profile.ts`
Profile 编辑命令处理器，包含：
- `editProfileCommand()` - 主命令函数
- 交互式和命令行参数模式支持
- 输入验证
- 同步到 Claude Code 的逻辑

### 2. 扩展的文件

#### `/src/config-manager.ts`
添加了三个新方法：
- `updateKey()` - 更新 API Key 的 apiKey 值或别名
- `renameConfig()` - 重命名配置，自动更新 activeConfig 引用
- `getActiveConfigName()` - 获取当前活动配置名称

#### `/src/commands/key.ts`
添加了 `keyEditCommand()` 函数

#### `/src/cli.ts`
注册了新命令：
- `ccm edit` - 编辑 profile
- `ccm key edit` - 编辑 API key

## 技术实现细节

### 配置重命名逻辑
```typescript
async renameConfig(oldName: string, newName: string): Promise<boolean> {
  // 检查新名称是否已存在
  // 更新配置名称
  // 如果是活动配置，更新 activeConfig 引用
}
```

### API Key 更新逻辑
```typescript
async updateKey(
  configName: string,
  keyIdOrAlias: string,
  updates: Partial<Pick<IApiKey, 'apiKey' | 'alias'>>
): Promise<boolean> {
  // 定位要更新的 key
  // 检查别名冲突
  // 更新字段
}
```

### 同步到 Claude Code 的判断
编辑命令会检查：
1. 是否正在编辑活动配置
2. 对于 key 编辑，还会检查是否是活动 key

如果满足条件，会询问用户是否同步到 Claude Code。

### 输入验证
- **配置名**: 只能包含字母、数字、连字符和下划线
- **Base URL**: 必须是有效的 HTTP/HTTPS URL
- **配置类型**: 必须是 official、third-party 或 community 之一
- **别名冲突**: 同一配置内别名必须唯一

## 测试结果

所有功能已通过手动测试：

✅ 命令行参数模式编辑 profile（描述、名称、base URL、类型）
✅ 命令行参数模式编辑 API key（别名、key 值）
✅ 配置重命名
✅ 编辑活动配置时同步到 Claude Code
✅ 编辑活动 key 时同步到 Claude Code
✅ 编辑非活动配置时不提示同步
✅ 错误处理：
  - 不存在的配置
  - 无效的配置名称
  - 无效的 Base URL
  - 无效的配置类型
  - 别名冲突
  - 没有变更时的提示

## 命令使用示例

### 编辑 Profile

```bash
# 命令行参数模式
ccm edit myprofile --description "Updated description"
ccm edit myprofile --name newname
ccm edit myprofile --base-url https://new-api.com --type community

# 交互式模式
ccm edit
ccm edit myprofile
```

### 编辑 API Key

```bash
# 命令行参数模式
ccm key edit myprofile mykey --alias newAlias
ccm key edit myprofile keyId --api-key sk-new-key-value
ccm key edit myprofile mykey --api-key sk-new --alias newAlias

# 交互式模式
ccm key edit
ccm key edit myprofile
ccm key edit myprofile mykey
```

## 符合规范

✅ 使用 inquirer 进行交互式输入
✅ 使用 chalk 进行彩色输出
✅ 使用 commander 注册命令
✅ 遵循现有代码风格和架构
✅ 完整的 TypeScript 类型注解
✅ 中文注释和错误消息
✅ 与现有命令保持一致的用户体验

## 验收标准检查

- ✅ 可以通过交互式和命令行两种方式编辑 profiles
- ✅ 可以通过交互式和命令行两种方式编辑 API keys
- ✅ 编辑后数据正确保存
- ✅ 当前活动配置的编辑能同步到 Claude Code
- ✅ 适当的错误提示和输入验证
- ✅ 符合现有代码架构和风格

**所有验收标准已满足！**
