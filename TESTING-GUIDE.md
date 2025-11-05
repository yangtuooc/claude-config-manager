# 测试指南 - 重构后的 Claude Config Manager

本指南将帮助你测试重构后的版本，体验所有新功能。

## 🚀 快速开始

### 安装和运行

```bash
# 1. 安装依赖（如果还没安装）
npm install

# 2. 构建项目
npm run build

# 3. 运行测试
npm test

# 4. 全局安装（推荐）
npm link

# 现在可以直接使用 ccm 命令
ccm --version
ccm --help
```

## 📋 测试新功能

### 1. 测试错误处理

新的错误处理系统提供更清晰的错误信息：

```bash
# 测试配置不存在错误
ccm show non-existent-config
# 输出: ✗ 配置 "non-existent-config" 不存在

# 测试无配置时切换
ccm switch
# 输出: ⚠ 还没有任何配置
```

### 2. 测试日志系统

新的日志系统提供彩色输出和更好的可读性：

```bash
# 查看成功消息（绿色 ✓）
ccm templates

# 查看警告消息（黄色 ⚠）
ccm current

# 查看信息消息（蓝色）
ccm list
```

### 3. 测试配置管理

```bash
# 查看可用模板
ccm templates

# 添加配置（交互式）
ccm add

# 或者使用命令行参数
ccm add -n my-config -k sk-test-key -u https://api.anthropic.com -t official

# 列出所有配置
ccm list

# 显示配置详情
ccm show my-config

# 切换配置
ccm switch my-config

# 查看当前配置
ccm current

# 编辑配置
ccm edit my-config

# 删除配置
ccm remove my-config
```

### 4. 测试 API Key 管理

新功能！现在支持为一个配置管理多个 API Keys：

```bash
# 为配置添加新的 API Key
ccm key add my-config -k sk-new-key -a production

# 列出配置的所有 API Keys
ccm key list my-config

# 切换活动 API Key
ccm key switch my-config production

# 编辑 API Key
ccm key edit my-config production -k sk-updated-key

# 删除 API Key
ccm key remove my-config production
```

### 5. 测试用户取消操作

新的错误处理支持优雅地处理用户取消：

```bash
# 添加配置时按 Ctrl+C 或选择取消
ccm add
# 选择 "取消" 选项
# 输出: ✖ 操作已取消
```

### 6. 测试验证功能

增强的验证器会在数据不正确时给出详细提示：

```bash
# 尝试使用无效的配置名称
ccm add -n "invalid name" -k test -u https://api.test.com
# 输出: 验证失败:
#       - 配置名称无效：只能包含字母、数字、连字符和下划线，长度 1-50

# 尝试使用无效的 URL
ccm add -n test -k test -u not-a-url
# 输出: 验证失败:
#       - Base URL 格式无效：必须是有效的 HTTP/HTTPS URL
```

## 🧪 运行自动化测试

```bash
# 运行所有测试
npm test

# 运行测试并查看覆盖率
npm run test:coverage

# 监视模式（自动重新运行）
npm run test:watch
```

## 🔍 代码质量检查

```bash
# 运行 ESLint 检查
npm run lint

# 自动修复 ESLint 问题
npm run lint:fix

# 检查代码格式
npm run format:check

# 格式化代码
npm run format
```

## 📊 功能对比

### 旧版本 vs 重构版本

| 功能 | 旧版本 | 重构版本 |
|------|--------|----------|
| 错误处理 | 通用 Error | 自定义错误类 ✅ |
| 日志系统 | console.log | 统一 logger ✅ |
| 测试 | 无 | Jest + 28 测试 ✅ |
| 代码质量工具 | 无 | ESLint + Prettier ✅ |
| 验证 | 基础 | 增强验证 ✅ |
| 多 API Key | ❌ | ✅ |
| 用户体验 | 基础 | 彩色输出 + 图标 ✅ |

## 🐛 调试模式

启用调试模式查看详细日志：

```bash
# 设置 DEBUG 环境变量
DEBUG=1 ccm add

# 或者
export DEBUG=1
ccm list
```

调试模式会显示：
- 配置文件加载信息
- 详细的操作日志
- 错误堆栈信息

## 📝 测试清单

使用以下清单确保所有功能正常：

- [ ] ✅ 构建成功 (`npm run build`)
- [ ] ✅ 测试通过 (`npm test`)
- [ ] ✅ 查看版本 (`ccm --version`)
- [ ] ✅ 查看帮助 (`ccm --help`)
- [ ] ✅ 列出模板 (`ccm templates`)
- [ ] ✅ 添加配置 (`ccm add`)
- [ ] ✅ 列出配置 (`ccm list`)
- [ ] ✅ 显示配置 (`ccm show <name>`)
- [ ] ✅ 切换配置 (`ccm switch <name>`)
- [ ] ✅ 编辑配置 (`ccm edit <name>`)
- [ ] ✅ 删除配置 (`ccm remove <name>`)
- [ ] ✅ 查看当前配置 (`ccm current`)
- [ ] ✅ 添加 API Key (`ccm key add`)
- [ ] ✅ 列出 API Keys (`ccm key list`)
- [ ] ✅ 切换 API Key (`ccm key switch`)
- [ ] ✅ 错误提示清晰
- [ ] ✅ 用户取消操作正常
- [ ] ✅ 彩色输出显示正常

## 🎯 性能测试

测试命令的响应时间：

```bash
# 测试启动时间
time ccm --version

# 测试列表性能
time ccm list

# 测试模板显示
time ccm templates
```

## 🔄 回滚说明

如果需要回到旧版本：

```bash
# 切换到主分支
git checkout main

# 重新构建
npm run build

# 重新链接
npm link
```

## 💡 提示和技巧

### 1. 使用别名

```bash
# list 命令的别名
ccm ls

# remove 命令的别名
ccm rm <name>

# switch 命令的别名
ccm use <name>

# key list 的别名
ccm key ls
```

### 2. 命令行参数

大多数命令支持命令行参数，可以跳过交互式输入：

```bash
# 非交互式添加配置
ccm add -n test -k sk-key -u https://api.test.com -t official -d "测试配置"

# 非交互式添加 API Key
ccm key add test -k sk-new-key -a production
```

### 3. 管道和脚本

可以在脚本中使用：

```bash
#!/bin/bash

# 自动添加多个配置
ccm add -n config1 -k key1 -u https://api1.com -t official
ccm add -n config2 -k key2 -u https://api2.com -t third-party

# 列出所有配置
ccm list
```

## 🆘 常见问题

### Q: 如何卸载全局安装？

```bash
npm unlink -g claude-config-manager
```

### Q: 如何重新构建？

```bash
rm -rf dist
npm run build
```

### Q: 如何清理配置？

```bash
rm -rf ~/.claude-config-manager
```

### Q: 测试失败怎么办？

```bash
# 清理并重新安装
rm -rf node_modules package-lock.json
npm install
npm test
```

## 📚 相关文档

- [README.md](./README.md) - 项目介绍和使用说明
- [REFACTORING.md](./REFACTORING.md) - 重构详情
- [CHANGELOG.md](./CHANGELOG.md) - 版本变更记录

## 🎉 反馈

如果发现任何问题或有改进建议，请：
1. 提交 Issue 到 GitHub
2. 或直接联系开发者

祝测试愉快！✨
