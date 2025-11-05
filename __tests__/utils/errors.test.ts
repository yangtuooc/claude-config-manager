import {
  AppError,
  ConfigError,
  ConfigNotFoundError,
  ConfigExistsError,
  ValidationError,
  ApiKeyError,
  ApiKeyNotFoundError,
  ApiKeyExistsError,
  FileError,
  UserCancelledError,
  isOperationalError
} from '../../src/utils/errors';

describe('Error Classes', () => {
  describe('AppError', () => {
    it('should create an error with message and code', () => {
      const error = new AppError('Test error', 'TEST_ERROR');
      expect(error.message).toBe('Test error');
      expect(error.code).toBe('TEST_ERROR');
      expect(error.isOperational).toBe(true);
      expect(error.name).toBe('AppError');
    });

    it('should be operational by default', () => {
      const error = new AppError('Test error');
      expect(error.isOperational).toBe(true);
    });
  });

  describe('ConfigNotFoundError', () => {
    it('should format message with config name', () => {
      const error = new ConfigNotFoundError('my-config');
      expect(error.message).toBe('配置 "my-config" 不存在');
      expect(error.code).toBe('CONFIG_NOT_FOUND');
    });
  });

  describe('ConfigExistsError', () => {
    it('should format message with config name', () => {
      const error = new ConfigExistsError('my-config');
      expect(error.message).toBe('配置 "my-config" 已存在');
      expect(error.code).toBe('CONFIG_EXISTS');
    });
  });

  describe('ValidationError', () => {
    it('should handle single error', () => {
      const error = new ValidationError('Invalid input');
      expect(error.message).toBe('Invalid input');
      expect(error.errors).toEqual(['Invalid input']);
    });

    it('should handle multiple errors', () => {
      const errors = ['Error 1', 'Error 2', 'Error 3'];
      const error = new ValidationError(errors);
      expect(error.message).toBe('Error 1; Error 2; Error 3');
      expect(error.errors).toEqual(errors);
    });
  });

  describe('ApiKeyNotFoundError', () => {
    it('should format message with key identifier', () => {
      const error = new ApiKeyNotFoundError('key-123');
      expect(error.message).toBe('API Key "key-123" 不存在');
      expect(error.code).toBe('API_KEY_NOT_FOUND');
    });
  });

  describe('ApiKeyExistsError', () => {
    it('should use default message', () => {
      const error = new ApiKeyExistsError();
      expect(error.message).toBe('该 API Key 已存在');
    });

    it('should use custom message', () => {
      const error = new ApiKeyExistsError('Custom message');
      expect(error.message).toBe('Custom message');
    });
  });

  describe('UserCancelledError', () => {
    it('should not be operational', () => {
      const error = new UserCancelledError();
      expect(error.isOperational).toBe(false);
      expect(error.message).toBe('操作已取消');
    });
  });

  describe('isOperationalError', () => {
    it('should return true for operational AppError', () => {
      const error = new AppError('Test', 'TEST', true);
      expect(isOperationalError(error)).toBe(true);
    });

    it('should return false for non-operational AppError', () => {
      const error = new UserCancelledError();
      expect(isOperationalError(error)).toBe(false);
    });

    it('should return false for regular Error', () => {
      const error = new Error('Test');
      expect(isOperationalError(error)).toBe(false);
    });
  });
});
