// const moment = require('moment');
// const dbService = require('../db');
const configurations = require('../../config');
const dbService = require('../db');

const OT = require('../db/ormapping/ot');
const ThingModel = require('../db/ormapping/thing_model');
const ThingModelProperties = require('../db/ormapping/thing_model_properties');
const AlertCondition = require('../db/ormapping/alert_condition');
const ThingInstance = require('../db/ormapping/thing_instance');
const AlertData = require('../db/ormapping/alert_data');


const checkAuth = async (auth) => {
  const checkResult = false;
  // TODO check message format
  // ...

  // query related thing instance
  const deviceEntity = new ThingInstance();
  deviceEntity.setValue({
    sn: auth.sn,
  });
  const deviceSet = await dbService.query(deviceEntity.querySQL());
  const { key, id, thing_model_id, } = deviceSet.result[0];

  // TODO 鉴权 check sn compare key is correct?
  const checkAuthResult = key === auth.key;

  return {
    checkAuthResult,
    deviceID: id,
    thingModelID: thing_model_id,
  };
};

const storeData = async (id, thingModelID, data) => {
  // 处理单个数据项的情况
  if (!Array.isArray(data)) {
    console.log('data is not array: ', JSON.stringify(data));
    return;
  }
  
  // 处理数组数据
  for (const r of data) {
    const otDataId = await storeOriginalData(id, r);
    await storeAlertData(otDataId, thingModelID, r);
  }
};

const storeOriginalData = async (id, data) => {
  const { timestamp, } = data;
  delete data.timestamp;

  const otDataEntity = new OT();
  otDataEntity.setValue({
    thing_id: id,
    timestamp,
    payload: data,
  });
  await dbService.add(otDataEntity.insertSQL());

  otDataEntity.setValue({
    thing_id: id,
    timestamp,
  });
  const otSet = await dbService.query(otDataEntity.querySQL());
  const otData = otSet.result[0];

  return otData.id;
};

const storeAlertData = async (otDataId, thingModelID, data) => {
  // query thing instance related thing model
  // const thingModel = await dbService.getById(new ThingModel(), thingModelID);

  // assemble properties & alertConditions together
  const propertyCoditionMap = {};
  const conditionMap = {};
  const alertConditionEntity = new AlertCondition();
  alertConditionEntity.setValue({
    thing_model_id: thingModelID,
  });
  const alertConditions = await dbService.query(alertConditionEntity.querySQL());
  alertConditions.result.forEach((ac) => {
    conditionMap[ac.property_id] = ac;
  });

  const propertyMap = {};
  const pE = new ThingModelProperties();
  pE.setValue({
    thing_model_id: thingModelID,
  });
  const properties = await dbService.query(pE.querySQL());
  properties.result.forEach((p) => {
    if (conditionMap[p.id]) {
      propertyCoditionMap[p.name] = {
        id: conditionMap[p.id].id,
        condition: conditionMap[p.id],
      };
    }
  });

  // check alert data
  // traverse message data by property check whether trigger the alert condition
  const alertData = [];
  Object.keys(data).forEach((vk) => {
    if (propertyCoditionMap[vk]) {
      if (checkOTData(data[vk], propertyCoditionMap[vk].condition)) {
        const alertDataEntity = new AlertData();
        alertDataEntity.setValue({
          ot_data: otDataId,
          condition: propertyCoditionMap[vk].id,
        });

        alertData.push(alertDataEntity.insertSQL());
      }
    }
  });

  // store alert data
  const alertDataPromise = alertData.map(async (ad) => {
    try {
      await dbService.add(ad);
    } catch (error) {
      console.error(`add alert data(${ac}): ${error}`);
    }
  });
  await Promise.all(alertDataPromise);
};

const checkOTData = (v, c) => {
  let triggerCondition = false;
  const expression = parseInt(c.expression);
  switch (expression) {
    case configurations.common.CONDITION_EXPRESSION.EQUAL:
      if (v === c.threshold) {
        triggerCondition = true;
      }
      break;
    case configurations.common.CONDITION_EXPRESSION.LARGER_EQUAL:
      if (v >= c.threshold) {
        triggerCondition = true;
      }

      break;
    case configurations.common.CONDITION_EXPRESSION.SMALLER_EQUAL:
      if (v <= c.threshold) {
        triggerCondition = true;
      }

      break;
    case configurations.common.CONDITION_EXPRESSION.LARGER:
      if (v > c.threshold) {
        triggerCondition = true;
      }

      break;
    case configurations.common.CONDITION_EXPRESSION.SMALLER:
      if (v < c.threshold) {
        triggerCondition = true;
      }

      break;
    default:
      break;
  }

  return triggerCondition;
};

const handleMessage = async (message) => {
  console.log('handleMessage', message);

  // parese message
  const otData = JSON.parse(message.toString());
  const { auth, data, } = otData;

  const { checkAuthResult, deviceID, thingModelID, } = await checkAuth(auth);

  if (checkAuthResult) {
    await storeData(deviceID, thingModelID, data);
  } else {
    console.error(`SN: ${auth.sn}thing instance鉴权检查未通过！`);
  }
};

const mqttService = {
  handleMessage,
};

module.exports = mqttService;
