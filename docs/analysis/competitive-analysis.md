# Claude Code 配置管理工具竞品分析报告

## Executive Summary
- 分析对象：claude-code-router（深度）+ LiteLLM + One-API（横向参考）
- 主要结论：
  - claude-code-router（CCR）已是最贴合 Claude Code 的本地路由器，具备 UI/CLI/转换/路由/日志完整链路
  - 通用网关（LiteLLM/One-API）在“监控/配额/面板/团队”方面成熟，但偏 OpenAI 兼容生态，与 Claude Code 的 Anthropic Messages 存在语义差异
  - claude-config-manager（CCM）应定位为“多 Profile/Key 安全管理 + settings.json 同步 + 与 CCR 松耦合集成”的桌面终端工具
- 差异化机会：
  1. 本地加密存储 + 模板生态 + 导入导出（个人/团队）
  2. `ccm claude` 启动器（与 CCR 协同）
  3. 基于 CCR usage 的费用追踪与最简面板（Phase 2）
  4. 健康检查 + 自动切换（Phase 3，与 CCR 对接）

## 详细分析

### claude-code-router
- 功能与技术详见：./claude-code-router.md
- 代码质量：工程实用取向，模块化良好，扩展友好；但缺乏系统性测试与本地密钥加密
- 借鉴点：Transformer/Router 插件化、JSON5 + 环境变量插值、日志轮转与备份、SSE usage 跟踪

### 其他项目
- LiteLLM：面向 OpenAI 兼容的网关/监控/路由/面板能力成熟，适合“费用追踪/配额”模型参考
- One-API：强渠道与配额管理，团队/多租户友好
- 详见：./related-projects.md

## 功能对比矩阵
详见：./comparison-matrix.md

## 技术方案评估（要点）
- 配置管理：
  - 推荐继续使用本地 JSON 存储 + 备份；新增 AES-256-GCM 加密（主密码/OS Keychain 可选），权限 600
- 监控追踪：
  - 推荐优先复用 CCR 的 usage 抓取与日志接口，CCM 侧聚合/计费；避免重复造轮子
  - 方案对比：
    - HTTP 代理（自研）——复杂度高、证书/跨平台成本高，非首选
    - apiKeyHelper/ENV wrapper（推荐）——在 settings.json 层与 CCR 配合，低侵入
- 启动器：
  - `ccm claude` 包装官方 `claude` 与 `ccr code`，在 CCR 未运行时自动拉起/提示

## 差异化建议
- CCM 应聚焦：
  1) 安全：本地加密存储、密钥别名、批量模板
  2) 便捷：Profile/Key 一键切换、导入导出、与 CCR 一键接入
  3) 可观察：基于 CCR 的 usage 汇总与轻量统计（Phase 2）

## 决策建议
- 方案：整合/借鉴 + 独立开发（非 Fork CCR）
  - 参考 transformer/router 思路，但不引入 CCR 内核
  - 与 CCR 通过配置与约定接口配合
- 实施路径与估算：见 ../strategy/recommendation.md

