#!/bin/bash

# 演示重构后的新功能
echo "================================================"
echo "  Claude Config Manager - 重构后功能演示"
echo "================================================"
echo ""

# 颜色定义
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

# 1. 测试错误处理
echo -e "${BLUE}📌 演示 1: 增强的错误处理${NC}"
echo "尝试显示不存在的配置..."
ccm show non-existent-config 2>&1 || true
echo ""

# 2. 测试新的日志系统
echo -e "${BLUE}📌 演示 2: 统一的日志系统（彩色输出）${NC}"
echo "查看可用模板..."
ccm templates
echo ""

# 3. 测试当前配置
echo -e "${BLUE}📌 演示 3: 改进的用户提示${NC}"
echo "查看当前配置（无配置时的友好提示）..."
ccm current
echo ""

# 4. 测试列表
echo -e "${BLUE}📌 演示 4: 配置列表${NC}"
echo "查看配置列表..."
ccm list
echo ""

# 5. 显示所有可用命令
echo -e "${BLUE}📌 演示 5: 完整的命令列表${NC}"
ccm --help
echo ""

echo -e "${GREEN}================================================${NC}"
echo -e "${GREEN}  演示完成！${NC}"
echo -e "${GREEN}================================================${NC}"
echo ""
echo "🎯 主要改进："
echo ""
echo "  ✅ 自定义错误类 - 更清晰的错误信息"
echo "  ✅ 统一日志系统 - 彩色输出，图标支持"
echo "  ✅ 命令包装器 - 统一错误处理"
echo "  ✅ 增强验证器 - 支持新旧配置格式"
echo "  ✅ 测试覆盖 - 28 个单元测试"
echo "  ✅ 代码质量工具 - ESLint + Prettier"
echo ""
echo "📚 查看完整测试指南："
echo "   cat TESTING-GUIDE.md"
echo ""
echo "🔍 查看重构详情："
echo "   cat REFACTORING.md"
echo ""
