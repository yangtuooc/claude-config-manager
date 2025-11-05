import {
  isValidConfigName,
  isValidApiKey,
  isValidBaseUrl,
  isValidConfigType,
  validateConfig,
  validateApiKey
} from '../../src/utils/validator';

describe('Validator Utilities', () => {
  describe('isValidConfigName', () => {
    it('should accept valid config names', () => {
      expect(isValidConfigName('my-config')).toBe(true);
      expect(isValidConfigName('config_123')).toBe(true);
      expect(isValidConfigName('test-config-1')).toBe(true);
    });

    it('should reject invalid config names', () => {
      expect(isValidConfigName('')).toBe(false);
      expect(isValidConfigName('config with spaces')).toBe(false);
      expect(isValidConfigName('config@special')).toBe(false);
      expect(isValidConfigName('a'.repeat(51))).toBe(false);
    });
  });

  describe('isValidApiKey', () => {
    it('should accept valid API keys', () => {
      expect(isValidApiKey('sk-ant-1234567890')).toBe(true);
      expect(isValidApiKey('some-valid-key')).toBe(true);
    });

    it('should reject invalid API keys', () => {
      expect(isValidApiKey('')).toBe(false);
      expect(isValidApiKey('   ')).toBe(false);
      expect(isValidApiKey('a'.repeat(501))).toBe(false);
    });
  });

  describe('isValidBaseUrl', () => {
    it('should accept valid URLs', () => {
      expect(isValidBaseUrl('https://api.anthropic.com')).toBe(true);
      expect(isValidBaseUrl('http://localhost:3000')).toBe(true);
    });

    it('should reject invalid URLs', () => {
      expect(isValidBaseUrl('not-a-url')).toBe(false);
      expect(isValidBaseUrl('ftp://invalid.com')).toBe(false);
      expect(isValidBaseUrl('')).toBe(false);
    });
  });

  describe('isValidConfigType', () => {
    it('should accept valid config types', () => {
      expect(isValidConfigType('official')).toBe(true);
      expect(isValidConfigType('third-party')).toBe(true);
      expect(isValidConfigType('community')).toBe(true);
    });

    it('should reject invalid config types', () => {
      expect(isValidConfigType('invalid')).toBe(false);
      expect(isValidConfigType('')).toBe(false);
    });
  });

  describe('validateApiKey', () => {
    it('should validate valid API key objects', () => {
      const key = {
        id: 'key-123',
        apiKey: 'sk-ant-1234567890',
        isDefault: true,
        createdAt: new Date().toISOString()
      };
      const result = validateApiKey(key);
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject API key objects with missing fields', () => {
      const key = {
        id: '',
        apiKey: 'sk-ant-1234567890'
      };
      const result = validateApiKey(key);
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });
  });

  describe('validateConfig', () => {
    it('should validate valid config with apiKey (old format)', () => {
      const config = {
        name: 'test-config',
        apiKey: 'sk-ant-1234567890',
        baseUrl: 'https://api.anthropic.com',
        type: 'official' as const
      };
      const result = validateConfig(config);
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should validate valid config with keys array (new format)', () => {
      const config = {
        name: 'test-config',
        keys: [
          {
            id: 'key-1',
            apiKey: 'sk-ant-1234567890',
            isDefault: true,
            createdAt: new Date().toISOString()
          }
        ],
        baseUrl: 'https://api.anthropic.com',
        type: 'official' as const
      };
      const result = validateConfig(config);
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject config with invalid name', () => {
      const config = {
        name: 'invalid name',
        apiKey: 'sk-ant-1234567890',
        baseUrl: 'https://api.anthropic.com',
        type: 'official' as const
      };
      const result = validateConfig(config);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain(
        '配置名称无效：只能包含字母、数字、连字符和下划线，长度 1-50'
      );
    });

    it('should reject config without API key', () => {
      const config = {
        name: 'test-config',
        baseUrl: 'https://api.anthropic.com',
        type: 'official' as const
      };
      const result = validateConfig(config);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('配置必须包含 API Key（apiKey 字段或 keys 数组）');
    });

    it('should reject config with invalid URL', () => {
      const config = {
        name: 'test-config',
        apiKey: 'sk-ant-1234567890',
        baseUrl: 'not-a-valid-url',
        type: 'official' as const
      };
      const result = validateConfig(config);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Base URL 格式无效：必须是有效的 HTTP/HTTPS URL');
    });
  });
});
