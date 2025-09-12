const initSqlJs = require('sql.js');
const fs = require('fs');
const path = require('path');

/**
 * sql.js SQLite 数据库适配器
 * 完全无需编译的SQLite解决方案
 */
class SqlJsAdapter {
  constructor() {
    this.db = null;
    this.SQL = null;
    this.dbPath = path.join(__dirname, '../../arcelormittal.db');
  }

  /**
   * 初始化数据库连接
   */
  async init() {
    if (this.db) return this.db;

    try {
      // 初始化sql.js
      this.SQL = await initSqlJs();
      
      // 尝试加载现有数据库文件
      let filebuffer;
      if (fs.existsSync(this.dbPath)) {
        filebuffer = fs.readFileSync(this.dbPath);
      }
      
      // 创建或打开数据库
      this.db = new this.SQL.Database(filebuffer);
      
      console.log('sql.js database initialized successfully');
      return this.db;
    } catch (error) {
      console.error('Failed to initialize sql.js database:', error);
      throw error;
    }
  }

  /**
   * 执行SQL语句（用于CREATE、INSERT、UPDATE、DELETE）
   */
  async exec(sql) {
    await this.init();
    try {
      this.db.exec(sql);
      this.saveToFile(); // 保存到文件
      return { changes: this.db.getRowsModified() };
    } catch (error) {
      console.error('SQL execution error:', error);
      throw error;
    }
  }

  /**
   * 执行查询语句（用于SELECT）
   */
  async all(sql, params = []) {
    await this.init();
    try {
      const stmt = this.db.prepare(sql);
      const result = [];
      
      while (stmt.step()) {
        const row = stmt.getAsObject();
        result.push(row);
      }
      
      stmt.free();
      return result;
    } catch (error) {
      console.error('SQL query error:', error);
      throw error;
    }
  }

  /**
   * 执行单条记录查询
   */
  async get(sql, params = []) {
    const results = await this.all(sql, params);
    return results[0] || null;
  }

  /**
   * 运行SQL语句并返回变更信息
   */
  async run(sql, params = []) {
    await this.init();
    try {
      const stmt = this.db.prepare(sql);
      stmt.run(params);
      stmt.free();
      
      this.saveToFile();
      
      return {
        changes: this.db.getRowsModified(),
        lastID: this.db.exec("SELECT last_insert_rowid()")[0]?.values[0][0] || null
      };
    } catch (error) {
      console.error('SQL run error:', error);
      throw error;
    }
  }

  /**
   * 保存数据库到文件
   */
  saveToFile() {
    try {
      const data = this.db.export();
      fs.writeFileSync(this.dbPath, Buffer.from(data));
    } catch (error) {
      console.error('Failed to save database to file:', error);
    }
  }

  /**
   * 关闭数据库连接
   */
  close() {
    if (this.db) {
      this.saveToFile();
      this.db.close();
      this.db = null;
    }
  }

  /**
   * 模拟事件监听（兼容sqlite包的API）
   */
  on(event, callback) {
    if (event === 'trace') {
      // sql.js doesn't have built-in tracing, but we can log queries
      console.log('Tracing enabled for sql.js adapter');
    }
  }
}

module.exports = SqlJsAdapter;
