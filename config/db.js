const db = {
  type: process.env.DB_TYPE || 'postgresql',
  columnType: {
    NUMBER: 0,
    STRING: 1,
    JSON: 2,
  },
  // PostgreSQL 配置
  postgresql: {
    host: process.env.PG_HOST || 'localhost',
    port: parseInt(process.env.PG_PORT) || 5432,
    database: process.env.PG_DATABASE || 'iiot',
    user: process.env.PG_USER || 'terry',
    password: process.env.PG_PASSWORD || 'terry123',
    max: parseInt(process.env.PG_POOL_SIZE) || 10, // 连接池最大连接数
    idleTimeoutMillis: parseInt(process.env.PG_TIMEOUT) * 1000 || 30000, // 超时时间（毫秒）
    connectionTimeoutMillis: 2000,
  },
  // SQLite 配置（保留以便需要时切换）
  sqlite: {
    dbPath: process.env.SQLITE_DB_PATH || './t.db',
  },
};

module.exports = db;
