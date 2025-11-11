import request from 'supertest';
import { expect } from '@jest/globals';
const Chance = require('chance');
const chance = new Chance();

const configurations = require('../../../config');
const v = 'v1.0.0';
let app;
const datapool = {};

describe('Use JEST to test an IIOT Demo Restful API based on Express', () => {
  beforeAll(() => {
    const tIIoTApp = require('../../../app');
    app = tIIoTApp.fetchApp(configurations.env.port_test);
  });

  afterAll(async () => {
    await app.close();
  });

  describe(`POST /${v}/tm`, () => {
    test('try to create a thing model', async () => {
      const name = chance.word();
      const properties = [];
      let n = chance.integer({ min: 1, max: 10, });
      while (n > 0) {
        n--;
        const min = chance.floating({ fixed: 2, min: -10, max: 10, });
        const max = min + 10;
        const name = chance.word();

        const property = {
          name,
          min,
          max,
        };

        if (n % 3 === 0) {
          const threshold = min + 5;
          property['alert_condition'] = {
            expression: configurations.common.CONDITION_EXPRESSION.LARGER,
            threshold,
          };
        }

        properties.push(property);
      }

      const thingModel = {
        name,
        properties,
      };

      const response = await request(app).post(`/${v}/tm`).send(thingModel);
      expect(response.statusCode).toBe(200);
      console.error(response.error);
    });
  });
});
