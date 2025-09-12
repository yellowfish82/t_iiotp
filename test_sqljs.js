/**
 * sql.js 测试脚本
 * 验证sql.js是否能正常工作，无需编译
 */

const SqlJsAdapter = require('./service/db/sqljs-adapter');

async function testSqlJs() {
  console.log('🧪 开始测试 sql.js...');
  
  try {
    // 创建适配器实例
    const adapter = new SqlJsAdapter();
    
    // 测试初始化
    console.log('📝 初始化数据库...');
    await adapter.init();
    
    // 测试创建表
    console.log('🏗️  创建测试表...');
    await adapter.exec(`
      CREATE TABLE IF NOT EXISTS test_table (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // 测试插入数据
    console.log('📊 插入测试数据...');
    await adapter.run(
      'INSERT INTO test_table (name, email) VALUES (?, ?)',
      ['测试用户', 'test@example.com']
    );
    
    await adapter.run(
      'INSERT INTO test_table (name, email) VALUES (?, ?)',
      ['Another User', 'another@example.com']
    );
    
    // 测试查询数据
    console.log('🔍 查询测试数据...');
    const results = await adapter.all('SELECT * FROM test_table');
    console.log('查询结果:', results);
    
    // 测试更新数据
    console.log('✏️  更新测试数据...');
    await adapter.run(
      'UPDATE test_table SET email = ? WHERE name = ?',
      ['updated@example.com', '测试用户']
    );
    
    // 再次查询验证更新
    const updatedResults = await adapter.all('SELECT * FROM test_table WHERE name = ?', ['测试用户']);
    console.log('更新后结果:', updatedResults);
    
    // 测试删除数据
    console.log('🗑️  删除测试数据...');
    await adapter.run('DELETE FROM test_table WHERE name = ?', ['Another User']);
    
    // 最终查询
    const finalResults = await adapter.all('SELECT * FROM test_table');
    console.log('最终结果:', finalResults);
    
    // 清理测试表
    await adapter.exec('DROP TABLE test_table');
    
    // 关闭连接
    adapter.close();
    
    console.log('✅ sql.js 测试完成！所有操作正常工作。');
    console.log('');
    console.log('🎉 恭喜！你可以安全地使用 sql.js 替代 sqlite3，无需任何编译工具！');
    
  } catch (error) {
    console.error('❌ 测试失败:', error);
    console.log('');
    console.log('请检查是否已安装 sql.js:');
    console.log('npm install sql.js');
  }
}

// 运行测试
if (require.main === module) {
  testSqlJs();
}

module.exports = testSqlJs;
