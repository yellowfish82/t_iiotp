import request from 'supertest';
import { expect } from '@jest/globals';
const Chance = require('chance');
const chance = new Chance();

const configurations = require('../../../config');
const v = 'v1.0.0';
let app;
const datapool = {};

describe('Use JEST to test an IIoT Demo Restful API based on Express', () => {
  beforeAll(() => {
    const TIIoTApp = require('../../../app');
    app = TIIoTApp.fetchApp(configurations.env.port_test);
  });

  afterAll(async () => {
    await app.close();
  });

  describe(`GET /${v}/tm/query`, () => {
    test('try to query all thing models', async () => {
      const response = await request(app).get(`/${v}/tm/query`).send();

      expect(response.statusCode).toBe(200);
      expect(response.body).not.toBe(undefined);
      expect(response.body.ThingModels).not.toBe(undefined);
      expect(Array.isArray(response.body.ThingModels)).toBe(true);

      datapool['model_id'] = response.body.ThingModels[0].id;
    });
  });

  describe(`GET /${v}/tm/get/:id`, () => {
    test('try to get a thing model', async () => {
      const { model_id, } = datapool;
      const response = await request(app).get(`/${v}/tm/get/${model_id}`).send();

      expect(response.statusCode).toBe(200);
      expect(response.body).not.toBe(undefined);
      expect(response.body.thingModel).not.toBe(undefined);

      datapool['model'] = response.body.thingModel;
    });
  });

  describe(`POST /${v}/ti`, () => {
    test('try to register a thing instance', async () => {
      const { model, } = datapool;
      const response = await request(app).post(`/${v}/ti`).send({
        thing_model_id: model.id,
        name: chance.name(),
        brand: chance.animal(),
        note: chance.sentence(),
        frequency: chance.integer({ min: 1, max: 4, }),
      });

      expect(response.statusCode).toBe(200);
    });
  });
});
