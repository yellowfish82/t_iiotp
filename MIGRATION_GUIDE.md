# SQLite 到 PostgreSQL 迁移指南

## 概述

本项目已支持从 SQLite 切换到 PostgreSQL 数据库，同时保持所有对外接口不变。

## 架构变更

### 新增文件
- `service/db/pg-adapter.js` - PostgreSQL 数据库适配器
- `.env.example` - 环境变量配置示例

### 修改文件
- `service/db/index.js` - 支持动态选择数据库适配器
- `config/db.js` - 添加 PostgreSQL 配置选项

### 保留文件
- `service/db/sqljs-adapter.js` - SQLite 适配器（保留以便切换）

## 安装依赖

### 安装 PostgreSQL 驱动

```bash
npm install pg
```

## 数据库初始化

### 快速初始化（推荐）

```bash
# 给脚本添加执行权限
chmod +x service/db/schema/init_postgresql.sh

# 执行初始化
./service/db/schema/init_postgresql.sh
```

### 手动初始化

```bash
# 1. 创建数据库
createdb -U terry iiot

# 2. 执行建表脚本
psql -U terry -d iiot -f service/db/schema/postgresql_schema.sql
```

## 配置说明

### 方式一：环境变量配置（推荐）

复制 `.env.example` 为 `.env` 并修改配置：

```bash
cp .env.example .env
```

编辑 `.env` 文件：

```env
DB_TYPE=postgresql
PG_HOST=localhost
PG_PORT=5432
PG_DATABASE=iiot
PG_USER=postgres
PG_PASSWORD=your_password
```

### 方式二：直接修改配置文件

编辑 `config/db.js`，修改默认值。

## 数据库切换

### 切换到 PostgreSQL

```bash
# 设置环境变量
export DB_TYPE=postgresql
export PG_HOST=localhost
export PG_PORT=5432
export PG_DATABASE=iiot
export PG_USER=postgres
export PG_PASSWORD=your_password

# 启动应用
npm start
```

### 切换回 SQLite

```bash
# 设置环境变量
export DB_TYPE=sqlite

# 启动应用
npm start
```

## 接口兼容性

所有对外暴露的接口保持完全不变，同时支持参数化查询：

```javascript
const db = require('./service/db');

// 方式一：字符串 SQL（兼容旧代码）
await db.add('INSERT INTO table (col1, col2) VALUES (1, "test")');
await db.query('SELECT * FROM table WHERE id=1');

// 方式二：参数化查询（推荐，防止 SQL 注入）
await db.add({ sql: 'INSERT INTO table (col1, col2) VALUES ($1, $2)', params: [1, 'test'] });
await db.query({ sql: 'SELECT * FROM table WHERE id=$1', params: [1] });

// ORM 方式（自动使用参数化查询）
const thingModel = new ThingModel();
thingModel.setValue({ name: 'test', description: 'desc' });
await db.add(thingModel.insertSQL()); // 自动返回 { sql, params }

// 其他方法
await db.del(sqlOrObj, params);
await db.update(sqlOrObj, params);
await db.queryView(viewName, condition);
await db.getById(object, id);
await db.closeConnection();
const adapter = await db.getAdapter();
```

## 适配器功能对比

| 功能 | SqlJsAdapter | PgAdapter |
|------|--------------|-----------|
| `init()` | ✅ | ✅ |
| `exec(sql)` | ✅ | ✅ |
| `all(sql, params)` | ✅ | ✅ |
| `get(sql, params)` | ✅ | ✅ |
| `run(sql, params)` | ✅ | ✅ |
| `close()` | ✅ | ✅ |
| `on('trace', callback)` | ✅ | ✅ |
| 连接池 | ❌ | ✅ |
| 事务支持 | ❌ | ✅ |

## PostgreSQL 特有功能

### 连接池状态查询

```javascript
const adapter = await db.getAdapter();
const status = adapter.getPoolStatus();
console.log(status);
// { totalCount: 5, idleCount: 3, waitingCount: 0 }
```

### 事务支持

```javascript
const adapter = await db.getAdapter();
await adapter.transaction(async (client) => {
  await client.query('INSERT INTO ...');
  await client.query('UPDATE ...');
  // 自动提交或回滚
});
```

## 数据迁移

如需从 SQLite 迁移数据到 PostgreSQL：

1. 导出 SQLite 数据为 SQL 文件
2. 转换 SQL 语法（SQLite → PostgreSQL）
3. 在 PostgreSQL 中创建相同的表结构
4. 导入数据

建议使用专业的迁移工具如 `pgloader`。

## 注意事项

### SQL 语法差异

- **自增主键**：
  - SQLite: `INTEGER PRIMARY KEY AUTOINCREMENT`
  - PostgreSQL: `SERIAL PRIMARY KEY` 或 `BIGSERIAL PRIMARY KEY`

- **布尔类型**：
  - SQLite: 使用 0/1
  - PostgreSQL: 使用 `BOOLEAN` 类型

- **日期时间**：
  - SQLite: 文本存储
  - PostgreSQL: `TIMESTAMP` 或 `TIMESTAMPTZ`

- **JSON 类型**：
  - SQLite: 文本存储
  - PostgreSQL: `JSON` 或 `JSONB` 类型（推荐 JSONB）

### 性能优化

- PostgreSQL 使用连接池，默认最大 20 个连接
- 可通过 `config/db.js` 调整连接池参数
- 建议为常用查询添加索引

## 故障排查

### 连接失败

检查：
1. PostgreSQL 服务是否启动
2. 连接参数是否正确
3. 防火墙是否允许连接
4. PostgreSQL 的 `pg_hba.conf` 配置

### 查询错误

- 检查 SQL 语法是否兼容 PostgreSQL
- 查看控制台日志获取详细错误信息
- 启用 trace 查看执行的 SQL 语句

## 回滚方案

如需回滚到 SQLite：

```bash
export DB_TYPE=sqlite
npm start
```

所有代码无需修改，只需切换环境变量即可。
