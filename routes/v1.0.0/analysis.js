const controllers = require('../../controller');
const configurations = require('../../config');

const Router = require('express-promise-router');
const router = new Router();

module.exports = router;

router.post('/sfoc', async (req, res, next) => {
  try {
    const result = await controllers.analysis.sfoc(req);

    const { status, message, } = result;
    res.status(status).send(message);
  } catch (error) {
    next(error);
  }
});

router.post('/kmeans', async (req, res, next) => {
  try {
    const result = await controllers.analysis.kmeans(req);
    
    const { status, message, } = result;
    res.status(status).send(message);
  } catch (error) {
    next(error);
  }
});

router.post('/vesselHealthIndex', async (req, res, next) => {
  try {
    const result = await controllers.analysis.vesselHealthIndex(req);

    const { status, message, } = result;
    res.status(status).send(message);
  } catch (error) {
    next(error);
  }
});

