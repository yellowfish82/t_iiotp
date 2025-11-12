const { Pool } = require('pg');

/**
 * PostgreSQL 数据库适配器
 * 提供与 SqlJsAdapter 相同的接口，便于无缝切换
 */
class PgAdapter {
  constructor(config = {}) {
    this.pool = null;
    this.config = {
      host: config.host || process.env.PG_HOST || 'localhost',
      port: config.port || process.env.PG_PORT || 5432,
      database: config.database || process.env.PG_DATABASE || 'iiot',
      user: config.user || process.env.PG_USER || 'postgres',
      password: config.password || process.env.PG_PASSWORD || '',
      max: config.max || 20, // 连接池最大连接数
      idleTimeoutMillis: config.idleTimeoutMillis || 30000,
      connectionTimeoutMillis: config.connectionTimeoutMillis || 2000,
    };
    this.traceCallback = null;
  }

  /**
   * 初始化数据库连接池
   */
  async init() {
    if (this.pool) return this.pool;

    try {
      this.pool = new Pool(this.config);
      
      // 测试连接
      const client = await this.pool.connect();
      console.log('PostgreSQL database connected successfully');
      client.release();
      
      // 监听错误事件
      this.pool.on('error', (err) => {
        console.error('Unexpected error on idle PostgreSQL client', err);
      });
      
      return this.pool;
    } catch (error) {
      console.error('Failed to initialize PostgreSQL database:', error);
      throw error;
    }
  }

  /**
   * 执行SQL语句（用于CREATE、INSERT、UPDATE、DELETE）
   * 兼容 SqlJsAdapter 的 exec 方法
   * @param {string} sql - SQL语句
   * @param {array} params - 参数数组（可选）
   */
  async exec(sql, params = []) {
    await this.init();
    const client = await this.pool.connect();
    
    try {
      this._trace(sql);
      const result = await client.query(sql, params);
      return { 
        changes: result.rowCount || 0,
        lastID: result.rows[0]?.id || null 
      };
    } catch (error) {
      console.error('SQL execution error:', error);
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * 执行查询语句（用于SELECT）
   * 兼容 SqlJsAdapter 的 all 方法
   */
  async all(sql, params = []) {
    await this.init();
    const client = await this.pool.connect();
    
    try {
      this._trace(sql);
      const result = await client.query(sql, params);
      return result.rows;
    } catch (error) {
      console.error('SQL query error:', error);
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * 执行单条记录查询
   * 兼容 SqlJsAdapter 的 get 方法
   */
  async get(sql, params = []) {
    const results = await this.all(sql, params);
    return results[0] || null;
  }

  /**
   * 运行SQL语句并返回变更信息
   * 兼容 SqlJsAdapter 的 run 方法
   */
  async run(sql, params = []) {
    await this.init();
    const client = await this.pool.connect();
    
    try {
      this._trace(sql);
      const result = await client.query(sql, params);
      
      // 尝试获取最后插入的ID（如果有RETURNING子句）
      let lastID = null;
      if (result.rows && result.rows.length > 0) {
        // 检查是否有id字段
        lastID = result.rows[0].id || result.rows[0].ID || null;
      }
      
      return {
        changes: result.rowCount || 0,
        lastID: lastID
      };
    } catch (error) {
      console.error('SQL run error:', error);
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * 执行事务
   */
  async transaction(callback) {
    await this.init();
    const client = await this.pool.connect();
    
    try {
      await client.query('BEGIN');
      const result = await callback(client);
      await client.query('COMMIT');
      return result;
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Transaction error:', error);
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * 关闭数据库连接池
   */
  async close() {
    if (this.pool) {
      await this.pool.end();
      this.pool = null;
      console.log('PostgreSQL connection pool closed');
    }
  }

  /**
   * 模拟事件监听（兼容sqlite包的API）
   */
  on(event, callback) {
    if (event === 'trace') {
      this.traceCallback = callback;
      console.log('Tracing enabled for PostgreSQL adapter');
    }
  }

  /**
   * 内部方法：触发trace回调
   */
  _trace(sql) {
    if (this.traceCallback) {
      this.traceCallback(sql);
    }
  }

  /**
   * 获取连接池状态（调试用）
   */
  getPoolStatus() {
    if (!this.pool) return null;
    
    return {
      totalCount: this.pool.totalCount,
      idleCount: this.pool.idleCount,
      waitingCount: this.pool.waitingCount,
    };
  }
}

module.exports = PgAdapter;
