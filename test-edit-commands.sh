#!/bin/bash

# 测试编辑 profile 和 API key 功能的脚本
# 这是一个手动测试脚本，用于验证新功能

set -e

echo "==================================="
echo "测试 CCM 编辑功能"
echo "==================================="
echo ""

# 清理旧的测试数据
rm -rf ~/.claude-config-manager-test
mkdir -p ~/.claude-config-manager-test

# 使用临时测试目录
export HOME_BACKUP=$HOME
export HOME=$(mktemp -d)
mkdir -p $HOME/.claude-config-manager

echo "1. 创建测试配置 'test-profile'..."
ccm add -n test-profile -k sk-test-key-12345 -u https://api.test.com -t official -d "Test profile" <<EOF
n
EOF

echo ""
echo "2. 列出所有配置..."
ccm list

echo ""
echo "3. 为配置添加第二个 API key..."
ccm key add test-profile -k sk-test-key-67890 -a test-key-2

echo ""
echo "4. 列出所有 keys..."
ccm key list test-profile

echo ""
echo "5. 测试使用命令行参数编辑 profile..."
ccm edit test-profile --description "Updated test profile"

echo ""
echo "6. 验证修改..."
ccm show test-profile

echo ""
echo "7. 测试使用命令行参数编辑 API key..."
ccm key edit test-profile test-key-2 --alias renamed-key

echo ""
echo "8. 验证 key 修改..."
ccm key list test-profile

echo ""
echo "==================================="
echo "基本测试完成！"
echo "==================================="
echo ""
echo "提示: 可以运行以下命令进行交互式测试："
echo "  ccm edit test-profile          # 交互式编辑 profile"
echo "  ccm key edit test-profile      # 交互式编辑 key"
echo ""

# 恢复 HOME
export HOME=$HOME_BACKUP

echo "测试数据保存在临时目录中"
