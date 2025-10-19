# UX 与命令设计对比

## 1. 命令结构对比

claude-code-router：
- ccr start/stop/restart/status/statusline
- ccr code "..."（包装 Claude Code 命令）
- ccr model（交互式模型选择/Provider 管理）
- ccr ui（打开 Web UI）
- ccr -v/-h

其他项目（LiteLLM/One-API）：
- 以服务进程为主，CLI 着重配置/运行参数，较少与“Claude Code”直接集成的命令

claude-config-manager（当前/建议）：
- ccm profile add|list|show|remove|switch|rename
- ccm key add|list|switch|remove|rename
- ccm export|import
- ccm edit:profile
- ccm claude（新增）：包装 `claude` 或与 `ccr code` 协同

分析：
- CCR 的命令面向“服务生命周期 + 运行时路由/UI”，命名直观
- CCM 的命令面向“配置生命周期与安全”，与 CCR 不冲突
- 建议：新增 `ccm claude` 与 CCR 协作；保留 profile/key 命令分组，采用 commander 的子命令树

## 2. 交互体验对比

- 配置创建流程：
  - CCR 偏向 Provider/Model 维度的交互式选择（ccr model）
  - CCM 提供基于模板的 Profile 引导，适合终端用户快速上手

- 状态展示：
  - CCR 提供 status/statusline 与 UI 日志面板
  - CCM 可在终端展示“当前 Profile/Key/Claude 指向/CCR 状态”摘要

- 错误处理：
  - CCR 服务端接口较完善；CLI 侧存在少量非 Commander 风格的提示
  - CCM 建议统一错误提示文案，提供恢复建议（例如：CCR 未运行时，提示 ccr start 或自动拉起）
