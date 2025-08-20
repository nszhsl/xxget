# Xget 测试文档

本目录包含 Xget 的完整测试套件，涵盖单元测试、集成测试、性能测试和安全测试。

## 🚀 运行测试

### 基本命令

```bash
# 运行所有测试
npm test

# 运行测试并监听文件变化
npm run test:watch

# 运行测试一次（CI 模式）
npm run test:run

# 生成测试覆盖率报告
npm run test:coverage

# 运行性能基准测试
npm run test:bench
```

### 运行特定测试

```bash
# 运行特定测试文件
npm test -- index.test.js

# 运行匹配模式的测试
npm test -- --grep "GitHub"

# 运行特定测试套件
npm test -- --grep "Platform Configuration"
```

## 📋 测试类型

### 1. 单元测试

测试单个函数和模块的功能：

- **index.test.js**: 核心请求处理逻辑
- **platforms.test.js**: 平台配置和 URL 转换
- **utils.test.js**: 工具函数和辅助方法
- **performance.test.js**: 性能监控组件

### 2. 集成测试

测试组件间的交互和端到端流程：

- **integration.test.js**: 完整的请求-响应流程测试

### 3. 安全测试

验证安全功能和防护机制：

- **security.test.js**: 安全头、输入验证、防护机制

### 4. 性能测试

评估系统性能和基准：

- **benchmark/performance.bench.js**: 性能基准测试

## 🛠️ 测试工具

### 测试辅助函数

`test/helpers/test-utils.js` 提供了丰富的测试工具：

```javascript
import { 
  createMockRequest, 
  createMockResponse, 
  createGitRequest,
  TEST_URLS,
  PerformanceTestHelper 
} from './helpers/test-utils.js';

// 创建模拟请求
const request = createMockRequest('https://example.com/gh/user/repo');

// 创建 Git 请求
const gitRequest = createGitRequest('https://example.com/gh/user/repo.git');

// 性能测试
const perfHelper = new PerformanceTestHelper();
await perfHelper.measure(async () => {
  // 测试代码
}, 'operation-name');
```

### 模拟数据

`test/fixtures/responses.js` 包含预定义的响应数据：

```javascript
import { MOCK_RESPONSES, createMockResponse } from './fixtures/responses.js';

// 使用预定义的响应
const response = createMockResponse(MOCK_RESPONSES.github.packageJson);
```

## 📊 测试覆盖率

存储库设置了以下覆盖率目标：

- **分支覆盖率**: 80%
- **函数覆盖率**: 80%
- **行覆盖率**: 80%
- **语句覆盖率**: 80%

查看覆盖率报告：

```bash
npm run test:coverage
open coverage/index.html
```

## 🔧 测试配置

### Vitest 配置

测试使用 Vitest 和 Cloudflare Workers 测试池：

```javascript
// vitest.config.js
export default defineWorkersConfig({
  test: {
    poolOptions: {
      workers: {
        wrangler: { configPath: './wrangler.toml' },
      },
    },
    coverage: {
      provider: 'v8',
      thresholds: {
        global: {
          branches: 80,
          functions: 80,
          lines: 80,
          statements: 80
        }
      }
    }
  }
});
```

### 环境变量

测试支持以下环境变量：

- `NODE_ENV=test`: 测试环境标识
- `VERBOSE_TESTS=true`: 启用详细测试输出
- `TEST_TIMEOUT=30000`: 测试超时时间（毫秒）

## 📝 编写测试

### 基本测试结构

```javascript
import { describe, it, expect } from 'vitest';
import { SELF } from 'cloudflare:test';

describe('功能模块', () => {
  describe('子功能', () => {
    it('应该正确处理正常情况', async () => {
      const response = await SELF.fetch('https://example.com/test');
      expect(response.status).toBe(200);
    });

    it('应该正确处理错误情况', async () => {
      const response = await SELF.fetch('https://example.com/invalid');
      expect(response.status).toBe(400);
    });
  });
});
```

### 异步测试

```javascript
it('应该处理异步操作', async () => {
  const startTime = Date.now();
  const response = await SELF.fetch('https://example.com/test');
  const endTime = Date.now();
  
  expect(response.status).toBe(200);
  expect(endTime - startTime).toBeLessThan(5000);
});
```

### 错误测试

```javascript
it('应该抛出预期的错误', async () => {
  await expect(async () => {
    await SELF.fetch('https://example.com/error');
  }).rejects.toThrow('Expected error message');
});
```

## 🐛 调试测试

### 启用详细输出

```bash
VERBOSE_TESTS=true npm test
```

### 调试特定测试

```bash
# 只运行失败的测试
npm test -- --reporter=verbose --bail

# 运行特定测试并显示详细信息
npm test -- --grep "specific test" --reporter=verbose
```

### 使用调试器

```javascript
import { describe, it, expect } from 'vitest';

it('调试测试', async () => {
  debugger; // 在浏览器开发工具中设置断点
  const response = await SELF.fetch('https://example.com/test');
  console.log('Response:', response); // 临时调试输出
  expect(response.status).toBe(200);
});
```

## 📈 性能测试

### 基准测试

```bash
# 运行性能基准测试
npm run test:bench

# 比较性能结果
npm run test:bench -- --compare
```

### 性能监控

```javascript
import { PerformanceTestHelper } from './helpers/test-utils.js';

const perfHelper = new PerformanceTestHelper();

it('应该在合理时间内完成', async () => {
  const result = await perfHelper.measure(async () => {
    return await SELF.fetch('https://example.com/test');
  }, 'request-time');
  
  const metrics = perfHelper.getMeasurements();
  expect(metrics[0].duration).toBeLessThan(1000); // 1秒内完成
});
```

## 🔒 安全测试

### 输入验证测试

```javascript
import { SECURITY_PAYLOADS } from './helpers/test-utils.js';

describe('安全测试', () => {
  it('应该防止 XSS 攻击', async () => {
    for (const payload of SECURITY_PAYLOADS.xss) {
      const response = await SELF.fetch(`https://example.com/gh/${payload}`);
      expect(response.status).not.toBe(500); // 不应该导致服务器错误
    }
  });
});
```

### 安全头验证

```javascript
import { validateSecurityHeaders } from './helpers/test-utils.js';

it('应该包含所有安全头', async () => {
  const response = await SELF.fetch('https://example.com/test');
  const validation = validateSecurityHeaders(response);
  
  expect(validation.passed).toBe(true);
  expect(validation.missing).toHaveLength(0);
});
```

## 📚 最佳实践

### 1. 测试命名

- 使用描述性的测试名称
- 遵循 "应该...当...时" 的格式
- 使用汉语描述更清晰

### 2. 测试组织

- 按功能模块组织测试
- 使用 `describe` 嵌套分组
- 保持测试独立性

### 3. 断言

- 使用具体的断言
- 测试边界条件
- 验证错误情况

### 4. 性能

- 避免不必要的异步操作
- 使用模拟数据减少网络请求
- 设置合理的超时时间

### 5. 维护

- 定期更新测试数据
- 清理过时的测试
- 保持测试覆盖率

## 🤝 贡献测试

### 添加新测试

1. 确定测试类型和位置
2. 使用现有的测试工具
3. 遵循存储库的测试风格
4. 确保测试通过且有意义

### 修复测试

1. 理解测试失败的原因
2. 修复代码或更新测试
3. 验证修复不会破坏其他测试
4. 更新相关文档

---

如有问题或建议，请查看[贡献指南](../CONTRIBUTING.md)或提交 [Issue](https://github.com/xixu-me/Xget/issues)。
