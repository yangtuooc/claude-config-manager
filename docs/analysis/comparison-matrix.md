# 功能对比矩阵（摘要）

| 功能 | claude-code-router | LiteLLM | One-API | 我们（CCM 目标） |
|------|-------------------|---------|--------|-------------------|
| 基础配置管理 | ✅ Providers/Router/Transformers | ✅ | ✅ | ✅ 必需（Profile/模板/导入导出） |
| 完整 settings.json（Claude Code） | ✅ 通过 ccr code + 本地 config 结合 | ❌（OpenAI 兼容为主） | ❌ | ✅ 必需（直接写 ~/.claude/config.json） |
| API key 切换 | ✅（Provider 维度） | ✅ | ✅ | ✅（Profile/Key 多版本 + 切换） |
| 启动器 (ccm claude) | ✅ ccr code | ❌ | ❌ | ✅ 必需（与 CCR 对接） |
| 请求监控 | ✅ SSE usage 抓取 + 日志 | ✅ 完整面板 | ✅ 完整面板 | ✅ 必需（最少日志 + usage） |
| 费用追踪 | ⏳ 可在 usage 基础上扩展 | ✅ | ✅ | ✅ 必需（Phase 2） |
| 健康检查 | ⏳（可扩展） | ✅ | ✅ | ✅ 必需（Phase 3） |
| 自动切换 | ✅ longContext/think/webSearch/Haiku | ✅ 路由策略 | ✅ 渠道切换 | ✅ 必需（与 CCR/监控联动） |
| 导入导出 | ✅ config.json 读写/备份 | ✅ | ✅ | ✅ 重要 |
| 加密存储 | ❌ | ✅（可自建密钥管理） | ✅（服务端存储） | ✅ 重要（本地加密） |
| Web Dashboard | ✅ | ✅ | ✅ | 💡 Nice to have（Phase 2） |
| 团队协作 | ⏳ | ✅ 多租户 | ✅ | 💡 Nice to have（Phase 3） |
| 配置模板 | ✅ UI/CLI 指引 | ⏳ | ⏳ | 💡 Nice to have |
| Shell 补全 | ⏳ | ⏳ | ⏳ | 💡 Nice to have |
| 交互式编辑 | ✅ ccr model | ✅ | ✅ | ✅ 已有（ccm add/edit） |
| 批量操作 | ⏳ | ✅ | ✅ | 💡 Nice to have |

注：✅ 已具备；❌ 未具备；⏳ 可扩展/部分具备。
