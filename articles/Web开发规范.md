---
title: Web开发规范
categories: 开发规范
createTime: 2023-12-09
updateTime: 2026-02-21
description: Web开发规范
top: 998
---

# JavaScript

# JAVA

# 接口设计规范

## 命名规则

- **URI使用名词复数**：`/users`
- **关联资源嵌套**：`/users/{uid}/orders/{oid}`
- **连字符命名**：`/api/v1/user-roles`（非下划线或驼峰）
- **版本控制**：URL路径（`/v1/users`）或请求头（`Accept: application/vnd.myapi.v1+json`）

## 目录结构示例

```markdown
/src
/controllers # 请求处理逻辑
/models # 数据模型定义
/routes # API路由配置
/middlewares # 鉴权/日志等中间件
/utils # 通用工具类
```

## 请求

### 请求URI

- **资源定位**：`GET /users/123`
- **过滤/排序**：`GET /users?role=admin&sort=-created_at`
- **搜索**：`GET /users?q=John+email:gmail.com`

### HTTP方法

| 方法   | 幂等性 | 用途         | 示例                |
| ------ | ------ | ------------ | ------------------- |
| GET    | ✔️     | 获取资源     | `GET /users`        |
| POST   | ❌     | 创建资源     | `POST /users`       |
| PUT    | ✔️     | 全量更新资源 | `PUT /users/123`    |
| PATCH  | ❌     | 部分更新资源 | `PATCH /users/123`  |
| DELETE | ✔️     | 删除资源     | `DELETE /users/123` |

## 响应

### 响应json格式

- **统一响应体**：
    ```json
    {
        "code": 200,
        "data": {
            /* 主数据 */
        },
        "pagination": {
            /* 分页信息 */
        },
        "links": {
            /* HATEOAS超链接 */
        }
    }
    ```

### 分页

- **请求参数**：`GET /users?page=2&per_page=20`
- **响应元数据**：
    ```json
    "pagination": {
      "total": 100,
      "current_page": 2,
      "per_page": 20,
      "total_pages": 5
    }
    ```

### 状态码

| 状态码 | 场景                     |
| ------ | ------------------------ |
| 200    | 常规成功                 |
| 201    | 资源创建成功             |
| 204    | 无内容（如DELETE成功）   |
| 400    | 客户端请求错误           |
| 401    | 未授权                   |
| 403    | 禁止访问                 |
| 404    | 资源不存在               |
| 429    | 请求过于频繁（限流触发） |
| 500    | 服务端内部错误           |

### 错误处理

```json
{
    "code": 40001,
    "message": "Invalid email format",
    "details": "Email must contain @ symbol"
}
```

# 安全规范

## 1. HTTPS强制

- 所有API必须通过**HTTPS**传输
- HTTP请求返回`301 Moved Permanently`

## 2. 鉴权方案

- **OAuth 2.0**：`Authorization: Bearer <token>`
- **API Key**：`X-API-Key: your_key`
- **JWT**：`Authorization: Bearer <JWT>`

## 3. 限流策略

- **速率限制**：`X-RateLimit-Limit: 100`（总配额）
- **剩余配额**：`X-RateLimit-Remaining: 95`
- **重置时间**：`X-RateLimit-Reset: 1661345678`
