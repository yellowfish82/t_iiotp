const SqlJsAdapter = require('./sqljs-adapter');
const config = require('../../config');

// 使用sql.js适配器替代sqlite3
let dbAdapter = null;

const getAdapter = async () => {
  if (!dbAdapter) {
    dbAdapter = new SqlJsAdapter();
    await dbAdapter.init();
    
    // 启用查询跟踪（兼容原有API）
    dbAdapter.on('trace', (data) => {
      console.log(`sqlite db operation tracing: ${data}`);
    });
  }
  return dbAdapter;
};

const add = async (sql) => {
  console.log(`operation database create something ${sql}`);

  try {
    const db = await getAdapter();
    const result = await db.exec(sql);
    return result;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

const del = async (sql) => {
  console.log(`operation database delete something with condition: ${sql}`);

  try {
    const db = await getAdapter();
    const result = await db.run(sql);
    return { result };
  } catch (error) {
    console.error(error);
    throw error;
  }
};

const query = async (sql) => {
  console.log(`operation database query something with condition: ${sql}`);

  try {
    const db = await getAdapter();
    const result = await db.all(sql);
    return { result };
  } catch (error) {
    console.error(error);
    throw error;
  }
};

const update = async (sql) => {
  console.log(`operation database update something with condition: ${sql}`);

  try {
    const db = await getAdapter();
    const result = await db.run(sql);
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
const closeConnection = () => {
  if (dbAdapter) {
    dbAdapter.close();
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
};
