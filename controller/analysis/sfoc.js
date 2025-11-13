const regression = require('regression');

const service = require('../../service');
const BaseCtrler = require('../baseController');

const OT = require('../../service/db/ormapping/ot');
const ThingInstance = require('../../service/db/ormapping/thing_instance');

class SFOCCtrler extends BaseCtrler {
  businessLogic = async (params) => {
    const { thing } = params;

    const otEntity = new OT();
    otEntity.setValue({
      thing_id: thing.id,
    });

    // 获取基本查询SQL
    const queryInfo = otEntity.querySQL();
    const otData = await service.dbService.query(queryInfo);

    // 初始化统计变量
    let scatterData = [];
    let minRpm = Number.POSITIVE_INFINITY;
    let maxRpm = Number.NEGATIVE_INFINITY;
    let minSfoc = Number.POSITIVE_INFINITY;
    let maxSfoc = Number.NEGATIVE_INFINITY;
    let sumSfoc = 0;
    let validCount = 0;

    // 一次循环完成所有处理
    for (const item of otData.result) {
      try {
        const d = JSON.parse(item.payload);
        if (!d || d.rpm <= 0 || d.power <= 0 || d.fuelFlow >= 0) continue;

        // 计算SFOC (g/kWh)
        const sfoc = Math.abs(d.fuelFlow) / d.power * 1000;

        // 更新散点数据
        scatterData.push([d.rpm, sfoc]);

        // 更新统计值
        if (d.rpm < minRpm) minRpm = d.rpm;
        if (d.rpm > maxRpm) maxRpm = d.rpm;
        if (sfoc < minSfoc) minSfoc = sfoc;
        if (sfoc > maxSfoc) maxSfoc = sfoc;
        sumSfoc += sfoc;
        validCount++;

      } catch (err) {
        // 跳过解析错误项
        continue;
      }
    }

    // 计算平均值
    const avgSfoc = validCount > 0 ? sumSfoc / validCount : 0;

    // 做线性回归
    const result = regression.linear(scatterData, { precision: 4 });

    // 生成拟合线
    const step = (maxRpm - minRpm) / 50;
    const lineData = [];
    for (let x = minRpm; x <= maxRpm; x += step) {
      const y = result.predict(x)[1];
      lineData.push([x, y]);
    }

    // 输出结果
    const sfoc = {
      scatterData,
      lineData,
      statistics: {
        avgSfoc: Number(avgSfoc.toFixed(2)),
        minSfoc: Number(minSfoc.toFixed(2)),
        maxSfoc: Number(maxSfoc.toFixed(2)),
        minRpm: Number(minRpm.toFixed(2)),
        maxRpm: Number(maxRpm.toFixed(2)),
      }
    };

    return {
      status: 200,
      info: { sfoc },
    };
  };

  verifyReq = async (req) => {
    if (!req.body) {
      return {
        status: 400,
        errMsg: 'did not give thing instance information',
      };
    }

    if (!req.body.id) {
      return {
        status: 400,
        errMsg: 'did not give thing instance id',
      };
    }

    const thing = await service.dbService.getById(new ThingInstance(), req.body.id);

    if (!thing) {
      return {
        status: 400,
        errMsg: 'thing instance not found',
      };
    }

    return {
      params: {
        thing,
      },
    };
  };
}

let ctrlerInstance;
const getCtrlerInstance = () => {
  if (!ctrlerInstance) {
    ctrlerInstance = new SFOCCtrler();
  }

  return ctrlerInstance;
};

const sofc = async (req) => {
  getCtrlerInstance();

  const result = await ctrlerInstance.ctrl(req);

  return result;
};
module.exports = sofc;
