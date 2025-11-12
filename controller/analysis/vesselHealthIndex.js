const service = require('../../service');
const BaseCtrler = require('../baseController');

const OT = require('../../service/db/ormapping/ot');

class VesselHealthIndexCtrler extends BaseCtrler {
  businessLogic = async (params) => {
    const { thing_id, starttime, endtime, sort_by, sort_order, limit } = params;

    // console.log(`\n\n\nbusinessLogic params: ${JSON.stringify(params)}\n\n\n`);
    const otEntity = new OT();
    otEntity.setValue({
      thing_id,
    });

    // 获取基本查询SQL
    let queryResult = otEntity.querySQL();
    let sql = queryResult.sql;
    let p = queryResult.params;

    // console.log(`\n\n\nbusinessLogic sql: ${sql}, params: ${JSON.stringify(p)}\n\n\n`);
    // 添加排序功能
    if (sort_by) {
      // 默认为升序，如果 sort_order 为 'desc' 则降序
      const order = sort_order && sort_order.toLowerCase() === 'desc' ? 'DESC' : 'ASC';
      sql = sql.replace(/;$/, ` ORDER BY ${sort_by} ${order};`);
    } else {
      // 如果没有指定排序字段，默认使用 timestamp ASC 排序
      sql = sql.replace(/;$/, ` ORDER BY timestamp ASC;`);
    }

    // 添加限制返回数据条数功能
    if (limit && !isNaN(parseInt(limit))) {
      // 添加 LIMIT 子句
      sql = sql.replace(/;$/, ` LIMIT ${parseInt(limit)};`);
    }

    // console.log(`OT History query SQL: ${sql}`);
    const otData = await service.dbService.query({ sql, params: p});

    return {
      status: 200,
      info: { otData: otData.result, },
    };
  };

  verifyReq = async (req) => {
    if (!req.params) {
      return {
        status: 400,
        errMsg: 'did not specified query body',
      };
    }

    if (!req.params.conditions) {
      return {
        status: 400,
        errMsg: 'did not specified query conditions',
      };
    }

    const conditions = JSON.parse(req.params.conditions);

    // console.log(`\n\n\nOT History query conditions: ${req.params.conditions}\n\n\n`);

    return {
      params: {
        ...conditions,
      },
    };
  };
}

let ctrlerInstance;
const getCtrlerInstance = () => {
  if (!ctrlerInstance) {
    ctrlerInstance = new VesselHealthIndexCtrler();
  }

  return ctrlerInstance;
};

const vesselHealthIndex = async (req) => {
  getCtrlerInstance();

  const result = await ctrlerInstance.ctrl(req);

  return result;
};
module.exports = vesselHealthIndex;
