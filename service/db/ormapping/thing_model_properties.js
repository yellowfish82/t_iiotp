const BaseEntity = require('./entity');
const { columnType, } = require('../../../config/db');


/**
 *   CREATE TABLE "thing_model_properties" (
 *     "id" integer NOT NULL PRIMARY KEY,
 *     "thing_model_id" integer NOT NULL,
 *     "name" varchar(200) NOT NULL,
 *     "min" integer,
 *     "max" integer,
 *     "type" varchar,
 *     FOREIGN KEY ("thing_model_id") REFERENCES "thing_model" ("id") ON DELETE CASCADE ON UPDATE CASCADE
 *   );
 */
class ThingModelProperties extends BaseEntity {
  constructor() {
    super();
    this.tableName = 'thing_model_properties';
    this.columns = {
      'id': columnType.NUMBER,
      'thing_model_id': columnType.NUMBER,
      'name': columnType.STRING,
      'min': columnType.NUMBER,
      'max': columnType.NUMBER,
      'type': columnType.STRING,
    };
    this.pk = 'id';
  }
}

module.exports = ThingModelProperties;

