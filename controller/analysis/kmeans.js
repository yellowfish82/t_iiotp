const { kmeans } = require("ml-kmeans");

const service = require('../../service');
const BaseCtrler = require('../baseController');

const OT = require('../../service/db/ormapping/ot');
const ThingInstance = require('../../service/db/ormapping/thing_instance');

class KMeansCtrler extends BaseCtrler {
  businessLogic = async (params) => {
    const { thing } = params;

    const otEntity = new OT();
    otEntity.setValue({
      thing_id: thing.id,
    });

    // 获取基本查询SQL
    const queryInfo = otEntity.querySQL();
    const otData = await service.dbService.query(queryInfo);

    let avgRpm = 0, avgPower = 0, avgFuelFlow = 0, totalPoints = 0;
    const data = [];
    const rawData = []; // 保存原始数据用于分析
    
    for (const item of otData.result) {
      const d = JSON.parse(item.payload);
      if (!d || d.rpm <= 0 || d.power <= 0 || d.fuelFlow >= 0) continue;

      avgRpm += d.rpm;
      avgPower += d.power;
      avgFuelFlow += d.fuelFlow;
      totalPoints++;

      // 用于聚类的三维数据
      data.push([d.rpm, d.power, Math.abs(d.fuelFlow)]);
      // 保存原始数据用于后续分析
      rawData.push({ rpm: d.rpm, power: d.power, fuelFlow: Math.abs(d.fuelFlow) });
    }

    avgRpm /= totalPoints;
    avgPower /= totalPoints;
    avgFuelFlow /= totalPoints;

    const kmeansResult = kmeans(data, 4); // 4个簇        

    // 计算每个聚类的平均值和特征
    const clusterAnalysis = [];
    for (let i = 0; i < 4; i++) {
      const clusterPoints = [];
      const clusterRawData = [];
      
      // 收集属于该聚类的数据点
      kmeansResult.clusters.forEach((clusterIndex, pointIndex) => {
        if (clusterIndex === i) {
          clusterPoints.push(data[pointIndex]);
          clusterRawData.push(rawData[pointIndex]);
        }
      });
      
      if (clusterPoints.length > 0) {
        // 计算平均值
        const avgRpmCluster = clusterRawData.reduce((sum, d) => sum + d.rpm, 0) / clusterRawData.length;
        const avgPowerCluster = clusterRawData.reduce((sum, d) => sum + d.power, 0) / clusterRawData.length;
        const avgFuelFlowCluster = clusterRawData.reduce((sum, d) => sum + d.fuelFlow, 0) / clusterRawData.length;
        
        // 根据特征判断运行模式
        const mode = this.determineOperatingMode(avgRpmCluster, avgPowerCluster, avgFuelFlowCluster);
        
        clusterAnalysis.push({
          clusterId: i,
          avgRpm: Number(avgRpmCluster.toFixed(1)),
          avgPower: Number(avgPowerCluster.toFixed(1)),
          avgFuelFlow: Number(avgFuelFlowCluster.toFixed(1)),
          count: clusterPoints.length,
          percentage: Number((clusterPoints.length / data.length * 100).toFixed(1)),
          mode: mode,
          data: clusterPoints.map(point => [point[0], point[1]]) // 只返回rpm和power用于图表显示
        });
      }
    }

    // 按照运行模式排序（经济巡航 -> 普通巡航 -> 高负载 -> 待机/低速）
    clusterAnalysis.sort((a, b) => {
      const order = { '🟢 经济巡航': 0, '🟡 普通巡航': 1, '🔴 高负载': 2, '⚪ 待机/低速': 3 };
      return order[a.mode.status] - order[b.mode.status];
    });

    return {
      status: 200,
      info: { kmeans: kmeansResult, avgRpm, avgPower, avgFuelFlow, totalPoints, clusterAnalysis },
    };
  };

  // 运行模式判断函数
  determineOperatingMode = (avgRpm, avgPower, avgFuelFlow) => {
    // 基于数据特征判断运行模式
    if (avgRpm < 400 && avgPower < 3 && avgFuelFlow < 50) {
      return {
        status: '⚪ 待机/低速',
        description: '靠泊或低速运行',
        color: '#d9d9d9'
      };
    } else if (avgRpm >= 400 && avgRpm < 650 && avgPower >= 3 && avgPower < 5 && avgFuelFlow < 100) {
      return {
        status: '🟢 经济巡航',
        description: '平稳、高效',
        color: '#52c41a'
      };
    } else if (avgRpm >= 650 && avgRpm < 800 && avgPower >= 5 && avgPower < 7 && avgFuelFlow < 180) {
      return {
        status: '🟡 普通巡航',
        description: '能耗正常',
        color: '#faad14'
      };
    } else {
      return {
        status: '🔴 高负载',
        description: '潜在效率下降',
        color: '#ff4d4f'
      };
    }
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
    ctrlerInstance = new KMeansCtrler();
  }

  return ctrlerInstance;
};

const kmeansCtrl = async (req) => {
  getCtrlerInstance();

  const result = await ctrlerInstance.ctrl(req);

  return result;
};
module.exports = kmeansCtrl;
