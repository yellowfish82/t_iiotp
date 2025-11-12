const service = require('../../service');
const BaseCtrler = require('../baseController');

const ThingModel = require('../../service/db/ormapping/thing_model');
const ThingModelProperties = require('../../service/db/ormapping/thing_model_properties');
const AlertCondition = require('../../service/db/ormapping/alert_condition');

class CreateModelCtrler extends BaseCtrler {
  businessLogic = async (params) => {
    const { thing_model, } = params;
    const thingmodelEntity = new ThingModel();
    thingmodelEntity.setValue({
      name: thing_model.name,
      description: thing_model.description,
    });
    await service.dbService.add(thingmodelEntity.insertSQL());

    const thingmodelSet = await service.dbService.query(thingmodelEntity.querySQL());
    // should add more checking code
    // ...
    const thingModel = thingmodelSet.result[0];
    const alertConditions = [];

    const thingModelPropertiesPromise = thing_model.properties.map(async (p) => {
      try {
        const propertyEntity = new ThingModelProperties();
        propertyEntity.setValue({
          thing_model_id: thingModel.id,
          name: p.name,
          max: p.max,
          min: p.min,
          type: p.type
        });

        await service.dbService.add(propertyEntity.insertSQL());

        if (p.alert_condition) {
          const propertiesSet = await service.dbService.query(propertyEntity.querySQL());
          const alertCondtionEntity = new AlertCondition();
          alertCondtionEntity.setValue({
            expression: p.alert_condition.expression,
            threshold: p.alert_condition.threshold,
            thing_model_id: thingModel.id,
            property_id: propertiesSet.result[0].id,
          });

          alertConditions.push(alertCondtionEntity.insertSQL());
        }
      } catch (error) {
        console.error(`add thing model property(${JSON.stringify(p)}): ${error}`);
      }
    });
    await Promise.all(thingModelPropertiesPromise);

    const thingModelAlertConditionsPromise = alertConditions.map(async (ac) => {
      try {
        await service.dbService.add(ac);
      } catch (error) {
        console.error(`add thing model alert(${ac}): ${error}`);
      }
    });
    await Promise.all(thingModelAlertConditionsPromise);

    return {
      status: 200,
      info: { alertData: createModel, },
    };
  };

  verifyReq = async (req) => {
    // TODO get user information from token

    if (!req.body) {
      return {
        status: 400,
        errMsg: 'did not specified payload',
      };
    }

    if (!req.body.properties) {
      return {
        status: 400,
        errMsg: 'did not specified properties',
      };
    }

    return {
      params: {
        thing_model: req.body,
      },
    };
  };
}

let ctrlerInstance;
const getCtrlerInstance = () => {
  if (!ctrlerInstance) {
    ctrlerInstance = new CreateModelCtrler();
  }

  return ctrlerInstance;
};

const createModel = async (req) => {
  getCtrlerInstance();

  const result = await ctrlerInstance.ctrl(req);

  return result;
};
module.exports = createModel;
