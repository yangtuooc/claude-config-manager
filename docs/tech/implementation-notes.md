# 技术实现参考与代码片段

以下片段结合我们现有代码与竞品可借鉴点，给出建议性的接口与服务轮廓。

```ts
// Profile 数据模型（建议统一）
export interface IApiKey {
  id: string;
  apiKey: string;      // 加密存储（AES-256-GCM）
  alias?: string;
  isDefault?: boolean;
  createdAt: string;
  lastUsed?: string;
}

export interface IApiConfig {
  name: string;
  baseUrl: string;
  type: 'official' | 'third-party' | 'community';
  description?: string;
  keys: IApiKey[];
  activeKeyId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface IConfigStore {
  version: string;
  activeConfig: string;
  configs: IApiConfig[];
}
```

```ts
// 配置管理服务骨架（简化）
class ConfigService {
  constructor(private fileService: FileService, private crypto: CryptoService) {}

  async load(): Promise<IConfigStore> { /* 读取 + 解密关键字段 */ }
  async save(store: IConfigStore): Promise<void> { /* 写入 + 备份 */ }

  async addProfile(input: Omit<IApiConfig, 'createdAt'|'updatedAt'|'keys'> & { apiKey?: string }): Promise<void> {}
  async switchProfile(name: string): Promise<void> { /* 写入 ~/.claude/config.json */ }
  async addKey(profile: string, apiKey: string, alias?: string): Promise<void> {}
  // ... 其余 CRUD
}
```

```ts
// 监控实现（与 CCR 协同）
interface UsageSample {
  ts: number;
  profile: string;
  sessionId?: string;
  provider?: string;
  model?: string;
  inputTokens?: number;
  outputTokens?: number;
  costUsd?: number;
}

class MonitorService {
  // 价目配置，可内置默认，也可从远端更新
  private pricing: Record<string, { inputPer1K: number; outputPer1K: number }>; // 按 provider/model 多级

  addSample(s: UsageSample) { /* 聚合与持久化 */ }
  monthSummary(month: string) { /* 汇总报表 */ }
}
```

```ts
// 启动器（建议）
// ccm claude: 优先检查 CCR 是否就绪；如未就绪，可提示启动或自动拉起 CCR，再委派给 "ccr code"
```

要点：
- 配置存储加密：建议使用 Node.js crypto 模块（scrypt + AES-256-GCM）
- 文件权限：0600，避免越权读取
- 备份策略：写入前创建 timestamp.bak，保留 N 份
- 与 CCR 的协作协议：
  - 将 Claude settings.json 指向 CCR（ANTHROPIC_BASE_URL=http://127.0.0.1:3456）
  - 由 CCR 负责运行期路由与 usage 导出；CCM 负责汇总/展示/告警
```
