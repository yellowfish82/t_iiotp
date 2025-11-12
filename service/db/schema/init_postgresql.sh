#!/bin/bash

# PostgreSQL 数据库初始化脚本
# 用于创建数据库和表结构

# 配置
DB_HOST=${PG_HOST:-localhost}
DB_PORT=${PG_PORT:-5432}
DB_NAME=${PG_DATABASE:-iiot}
DB_USER=${PG_USER:-terry}
DB_PASSWORD=${PG_PASSWORD:-terry123}

echo "=========================================="
echo "PostgreSQL 数据库初始化"
echo "=========================================="
echo "Host: $DB_HOST"
echo "Port: $DB_PORT"
echo "Database: $DB_NAME"
echo "User: $DB_USER"
echo "=========================================="

# 检查 PostgreSQL 是否运行
if ! pg_isready -h $DB_HOST -p $DB_PORT -U $DB_USER > /dev/null 2>&1; then
    echo "❌ 错误: 无法连接到 PostgreSQL 服务器"
    echo "请确保 PostgreSQL 服务正在运行"
    exit 1
fi

echo "✅ PostgreSQL 服务器连接成功"

# 检查数据库是否存在
DB_EXISTS=$(PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -lqt | cut -d \| -f 1 | grep -w $DB_NAME | wc -l)

if [ $DB_EXISTS -eq 0 ]; then
    echo "📦 创建数据库 $DB_NAME..."
    PGPASSWORD=$DB_PASSWORD createdb -h $DB_HOST -p $DB_PORT -U $DB_USER $DB_NAME
    if [ $? -eq 0 ]; then
        echo "✅ 数据库创建成功"
    else
        echo "❌ 数据库创建失败"
        exit 1
    fi
else
    echo "ℹ️  数据库 $DB_NAME 已存在"
    read -p "是否要重新创建表结构？这将删除所有现有数据！(y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "操作已取消"
        exit 0
    fi
fi

# 执行建表脚本
echo "📝 执行建表脚本..."
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -f "$SCRIPT_DIR/postgresql_schema.sql"

if [ $? -eq 0 ]; then
    echo "✅ 表结构创建成功"
else
    echo "❌ 表结构创建失败"
    exit 1
fi

# 验证表创建
echo "🔍 验证表结构..."
TABLE_COUNT=$(PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -t -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public' AND table_type = 'BASE TABLE';")

echo "✅ 共创建 $TABLE_COUNT 个表"

# 列出所有表
echo ""
echo "📋 数据库表列表:"
PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -c "\dt"

echo ""
echo "=========================================="
echo "✅ 初始化完成！"
echo "=========================================="
echo ""
echo "下一步："
echo "1. 配置环境变量或 .env 文件"
echo "2. 如需迁移数据，参考 migrate_sqlite_to_pg.md"
echo "3. 运行应用: npm start"
