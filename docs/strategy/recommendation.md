# claude-config-manager 发展策略建议

## 推荐方案：整合/借鉴 + 独立开发（选项 B），并与 claude-code-router 做松耦合集成

### 理由
1. 差异定位清晰：CCR 专注运行期路由/转换/监控；CCM 专注 Profile/密钥/模板/Claude settings 写入与桌面端用户体验
2. 风险隔离：不 fork CCR，避免其无测试/无加密等技术债传导；通过接口层对接即可共享能力
3. 自主演进：CCM 可按我们期望的数据模型（多 Key、多 Profile、本地加密、导入导出、团队预设）稳定推进

### 实施路径

- Phase 1（基础功能收敛）
  - 完整 settings.json 管理（已具备，继续细化健壮性）
  - Profile CRUD/模板/导入导出（完善）
  - 本地加密存储（node crypto + 密钥派生 + 文件权限 600）
  - 与 CCR 集成：
    - 提供一键“指向 CCR”的环境写入（ANTHROPIC_BASE_URL 与临时 token 协议）
    - 新增 `ccm claude` 启动器（包装 `ccr code` 与官方 `claude`）

- Phase 2（差异化功能）
  - 监控与费用追踪：
    - 在 CCR 的 usage 抓取基础上，定义 Provider 价目模板（静态/可更新）
    - 本地日志与月度汇总、按 Profile/项目维度分摊
    - 提供极简 Web 面板或 TUI（选用成熟库，如 blessed 或内嵌静态页）
  - 健康检查与自动切换：
    - 定时探活 Provider（HEAD/简请求），失效时自动降级/切换
    - 与 CCR Router 协议对接（写 CCR config 或临时路由指令）

- Phase 3（高级功能）
  - 团队协作：
    - 共享只读模板、配额策略导出
    - Git 同步/加密导出（team key）
  - Dashboard：
    - 更全面的费用/用量/请求日志检索
    - 异常告警（超额、错误率、延迟）

### 风险与缓解
- 依赖 CCR 版本变动：
  - 缓解：以配置与 URL 约定对接，尽量不侵入 CCR 内核；维护“兼容性适配层”
- 本地加密的可用性：
  - 缓解：提供“主密码 + OS Keychain（可选）”双路线；失败时降级为明文但强提示
- 监控/费用统计准确性：
  - 缓解：明确定义统计口径，允许用户自定义价目/权重；提供导出能力以便外部分析

---

## 技术栈与架构建议

- 语言/CLI：TypeScript + commander + inquirer（保持现有）
- 存储：本地 JSON（加密），目录 ~/.claude-config-manager；提供导入导出与备份
- 加密：crypto.scrypt + crypto.createCipheriv（AES-256-GCM）；文件权限 600
- 监控：
  - 首选方案：apiKeyHelper/ENV 包装 + CCR usage 接口打通（推荐）
  - 备选：HTTP 代理完全自研（复杂度高，谨慎）
- 测试：vitest 或 jest + fs/promises mock；回归覆盖 Profile/Key/加密/写 settings.json

推荐架构模式：
- 参考 CCR 的“路由器/转换器/UI”分层思想，但在 CCM 侧保持“服务无状态，数据本地可控”的收敛方向
- 引入 Service 层（ConfigService/CryptoService/MonitorService）+ Command 层（命令解析/交互）

---

## 里程碑与估算（人周）
- Phase 1：基础收敛（2 周）
- Phase 2：差异化增强（3 周）
- Phase 3：高级功能（4 周）

---

## 迁移策略
- 保持现有配置文件向后兼容；首次引入加密时提供迁移向导（明文 -> 加密）
- 提供导出为 CCR config.json 的功能，便于用户直接导入 CCR UI/CLI
- 提供“回滚为明文”的一键操作（用于排障）
