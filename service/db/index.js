const SqlJsAdapter = require('./sqljs-adapter');
const PgAdapter = require('./pg-adapter');
const config = require('../../config');

// 根据配置选择数据库适配器
let dbAdapter = null;

const getAdapter = async () => {
  if (!dbAdapter) {
    const dbType = config.db.type;
    
    if (dbType === 'postgresql') {
      // 使用 PostgreSQL 适配器
      dbAdapter = new PgAdapter(config.db.postgresql);
      await dbAdapter.init();
      console.log('Using PostgreSQL database adapter');
    } else if (dbType === 'sqlite') {
      // 使用 SQLite 适配器
      dbAdapter = new SqlJsAdapter();
      await dbAdapter.init();
      console.log('Using SQLite database adapter');
    } else {
      throw new Error(`Unsupported database type: ${dbType}`);
    }
    
    // 启用查询跟踪（兼容原有API）
    dbAdapter.on('trace', (data) => {
      console.log(`${dbType} db operation tracing: ${data}`);
    });
  }
  return dbAdapter;
};

const add = async (sqlOrObj, params = []) => {
  // 支持两种调用方式：
  // 1. add(sql) - 字符串SQL（兼容旧代码）
  // 2. add({ sql, params }) - 参数化查询（推荐）
  let sql, queryParams;
  
  if (typeof sqlOrObj === 'string') {
    sql = sqlOrObj;
    queryParams = params;
  } else if (sqlOrObj && typeof sqlOrObj === 'object') {
    sql = sqlOrObj.sql;
    queryParams = sqlOrObj.params || [];
  } else {
    throw new Error('Invalid SQL parameter');
  }

  console.log(`operation database create something ${sql}`);

  try {
    const db = await getAdapter();
    const result = await db.exec(sql, queryParams);
    return result;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

const del = async (sqlOrObj, params = []) => {
  let sql, queryParams;
  
  if (typeof sqlOrObj === 'string') {
    sql = sqlOrObj;
    queryParams = params;
  } else if (sqlOrObj && typeof sqlOrObj === 'object') {
    sql = sqlOrObj.sql;
    queryParams = sqlOrObj.params || [];
  } else {
    throw new Error('Invalid SQL parameter');
  }

  console.log(`operation database delete something with condition: ${sql}`);

  try {
    const db = await getAdapter();
    const result = await db.run(sql, queryParams);
    return { result };
  } catch (error) {
    console.error(error);
    throw error;
  }
};

const query = async (sqlOrObj, params = []) => {
  let sql, queryParams;
  
  if (typeof sqlOrObj === 'string') {
    sql = sqlOrObj;
    queryParams = params;
  } else if (sqlOrObj && typeof sqlOrObj === 'object') {
    sql = sqlOrObj.sql;
    queryParams = sqlOrObj.params || [];
  } else {
    throw new Error('Invalid SQL parameter');
  }

  console.log(`operation database query something with condition: ${sql}`);

  try {
    const db = await getAdapter();
    const result = await db.all(sql, queryParams);
    return { result };
  } catch (error) {
    console.error(error);
    throw error;
  }
};

const getById = async (o, id) => {
  if (o === undefined) {
    throw new Error(`object can not be null/undefined`);
  }

  if (id === undefined) {
    throw new Error(`id can not be null/undefined`);
  }

  o.setValue({ id, });
  const queryResult = await query(o.querySQL());
  const resultSet = queryResult ? queryResult.result : [];

  if (resultSet.length === 0) {
    throw new Error(`can not find any instance for ${o.constructor.name} by pk(${id})`);
  } else if (resultSet.length > 1) {
    throw new Error(`find more than 1 instances for ${o.constructor.name} by pk(${id})`);
  }

  return resultSet[0];
};

const update = async (sqlOrObj, params = []) => {
  let sql, queryParams;
  
  if (typeof sqlOrObj === 'string') {
    sql = sqlOrObj;
    queryParams = params;
  } else if (sqlOrObj && typeof sqlOrObj === 'object') {
    sql = sqlOrObj.sql;
    queryParams = sqlOrObj.params || [];
  } else {
    throw new Error('Invalid SQL parameter');
  }

  console.log(`operation database update something with condition: ${sql}`);

  try {
    const db = await getAdapter();
    const result = await db.run(sql, queryParams);
    return { result };
  } catch (error) {
    console.error(error);
    throw error;
  }
};

const queryView = async (viewName, condition) => {
  console.log(`operation database queryView ${viewName} with condition: ${condition}`);

  try {
    const db = await getAdapter();
    let sql = `SELECT * FROM ${viewName}`;
    if (condition && condition.trim() !== '') {
      sql += ` WHERE ${condition}`;
    }
    const result = await db.all(sql);
    return { result };
  } catch (error) {
    console.error(error);
    throw error;
  }
};

// 清理函数
const closeConnection = async () => {
  if (dbAdapter) {
    await dbAdapter.close();
    dbAdapter = null;
  }
};

// 进程退出时清理
process.on('SIGINT', closeConnection);
process.on('SIGTERM', closeConnection);
process.on('exit', closeConnection);

module.exports = {
  add,
  del,
  query,
  update,
  queryView,
  closeConnection,
  // 直接导出适配器供高级使用
  getAdapter,
  getById,
};
