#!/bin/bash

# 测试重构后的 CLI
echo "================================"
echo "测试重构后的 Claude Config Manager"
echo "================================"
echo ""

# 设置颜色
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}1. 检查版本${NC}"
node dist/cli.js --version
echo ""

echo -e "${BLUE}2. 查看帮助信息${NC}"
node dist/cli.js --help
echo ""

echo -e "${BLUE}3. 列出可用模板${NC}"
node dist/cli.js templates
echo ""

echo -e "${BLUE}4. 查看当前配置列表${NC}"
node dist/cli.js list
echo ""

echo -e "${BLUE}5. 查看当前活动配置${NC}"
node dist/cli.js current
echo ""

echo -e "${GREEN}================================${NC}"
echo -e "${GREEN}测试完成！${NC}"
echo -e "${GREEN}================================${NC}"
echo ""
echo "你可以运行以下命令进行交互式测试："
echo ""
echo "  node dist/cli.js add         # 添加新配置"
echo "  node dist/cli.js list        # 列出所有配置"
echo "  node dist/cli.js switch      # 切换配置"
echo "  node dist/cli.js key add     # 为配置添加 API Key"
echo ""
echo "或者使用 npm link 全局安装："
echo ""
echo "  npm link                     # 全局安装"
echo "  ccm --help                   # 使用 ccm 命令"
echo ""
