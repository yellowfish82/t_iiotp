const { columnType, } = require('../../../config/db');

/**
 * set the following values
 * this.tableName;
 * this.columns; { colname: 0 (is not number), 1 (is number)}
 * this.pk;
 *
 * use setValue() function complete entity assemble
 *
 */
class BaseEntity {
  constructor() {
    this.tableName;
    this.columns;
    this.pk;
    this.value = {};
  }

  insertSQL = () => {
    /**
         * INSERT INTO COMPANY (ID,NAME,AGE,ADDRESS,SALARY)
         * VALUES ($1, $2, $3, $4, $5);
         * 使用参数化查询，避免SQL注入
         */

    const cols = [];
    const params = [];
    const placeholders = [];
    let paramIndex = 1;

    Object.keys(this.columns).forEach((c) => {
      if (this.value[c] !== undefined) {
        cols.push(c);
        
        // JSON类型需要序列化
        if (this.columns[c] === columnType.JSON) {
          params.push(JSON.stringify(this.value[c]));
        } else {
          params.push(this.value[c]);
        }
        
        placeholders.push(`$${paramIndex}`);
        paramIndex++;
      }
    });

    const sql = `INSERT INTO ${this.getTableName()} (${cols.join(',')}) VALUES (${placeholders.join(',')});`;
    
    return { sql, params };
  };

  delSQL = (condition) => {
    /**
         * DELETE FROM table_name
         * WHERE [condition];
         * 使用参数化查询
         */
    if (!condition && !this.value[this.pk]) {
      throw new Error(`not offerred pk: ${this.pk}, and current version only support update specified entity`);
    }

    let sql;
    let params = [];

    if (!condition && this.value[this.pk]) {
      sql = `DELETE FROM ${this.getTableName()} WHERE ${this.pk}=$1;`;
      params = [this.value[this.pk]];
    } else {
      // 如果传入了自定义condition，暂时保持原样（需要调用方自行处理参数）
      sql = `DELETE FROM ${this.getTableName()} WHERE ${condition};`;
    }

    return { sql, params };
  };

  updateSQL = (condition) => {
    /**
         * UPDATE table_name
         * SET column1 = $1, column2 = $2
         * WHERE condition;
         * 使用参数化查询
         */

    if (!condition && !this.value[this.pk]) {
      throw new Error(`not offerred pk: ${this.pk}, and current version only support update specified entity`);
    }

    const setItems = [];
    const params = [];
    let paramIndex = 1;

    Object.keys(this.columns).forEach((key) => {
      if (key !== this.pk && this.value[key] !== undefined) {
        setItems.push(`${key}=$${paramIndex}`);
        
        // JSON类型需要序列化
        if (this.columns[key] === columnType.JSON) {
          params.push(JSON.stringify(this.value[key]));
        } else {
          params.push(this.value[key]);
        }
        
        paramIndex++;
      }
    });

    let sql;
    if (!condition && this.value[this.pk]) {
      sql = `UPDATE ${this.getTableName()} SET ${setItems.join(',')} WHERE ${this.pk}=$${paramIndex};`;
      params.push(this.value[this.pk]);
    } else {
      // 如果传入了自定义condition，暂时保持原样
      sql = `UPDATE ${this.getTableName()} SET ${setItems.join(',')} WHERE ${condition};`;
    }

    return { sql, params };
  };

  querySQL = () => {
    /**
        * SELECT * FROM table_name WHERE condition;
        * 使用参数化查询
        */

    const conditionResult = this.getCondition();
    return {
      sql: `SELECT * FROM ${this.getTableName()} WHERE ${conditionResult.condition};`,
      params: conditionResult.params
    };
  };

  getTableName = () => {
    if (!this.tableName) {
      throw new Error('table name not defined');
    }

    return this.tableName;
  };

  setValue = (v) => {
    Object.keys(v).forEach((key) => {
      if (Object.keys(this.columns).indexOf(key) < 0) {
        throw new Error(`${key} is invalid in ${this.getTableName()}`);
      }
    });
    this.value = v;
  };

  getCondition = () => {
    /**
     * 生成WHERE条件，使用参数化查询
     * 返回 { condition: string, params: array }
     */
    let condition = '1=1';
    const params = [];
    let paramIndex = 1;

    Object.keys(this.columns).forEach((key) => {
      if (this.value[key] !== undefined) {
        condition += ` AND ${key}=$${paramIndex}`;
        
        // JSON类型需要序列化
        if (this.columns[key] === columnType.JSON) {
          params.push(JSON.stringify(this.value[key]));
        } else {
          params.push(this.value[key]);
        }
        
        paramIndex++;
      }
    });

    return { condition, params };
  };

  getValue = (key) => this.value[key];
}

module.exports = BaseEntity;
