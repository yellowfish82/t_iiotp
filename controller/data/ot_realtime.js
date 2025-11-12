const service = require('../../service');
const BaseCtrler = require('../baseController');

const OT = require('../../service/db/ormapping/ot');

class OTRealtimeCtrler extends BaseCtrler {
  businessLogic = async (params) => {
    const { thing_id, } = params;
    const otEntity = new OT();
    otEntity.setValue({
      thing_id,
    });

    const queryResult = otEntity.querySQL();
    const sql = queryResult.sql.slice(0, -1) + ` ORDER BY timestamp DESC LIMIT 1;`;
    const p = queryResult.params;
    
    const otData = await service.dbService.query({ sql, params: p });

    return {
      status: 200,
      info: { ot: otData.result[0], },
    };
  };

  verifyReq = async (req) => {
    // TODO get user information from token

    if (!req.params) {
      return {
        status: 400,
        errMsg: 'did not specified query parameters',
      };
    }

    if (!req.params.id) {
      return {
        status: 400,
        errMsg: 'did not specified device id',
      };
    }

    return {
      params: {
        thing_id: req.params.id,
      },
    };
  };
}

let ctrlerInstance;
const getCtrlerInstance = () => {
  if (!ctrlerInstance) {
    ctrlerInstance = new OTRealtimeCtrler();
  }

  return ctrlerInstance;
};

const otRealtime = async (req) => {
  getCtrlerInstance();

  const result = await ctrlerInstance.ctrl(req);

  return result;
};
module.exports = otRealtime;
