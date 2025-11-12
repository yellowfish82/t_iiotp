const BaseEntity = require('./entity');
const { columnType, } = require('../../../config/db');


/**
 *   CREATE TABLE "alert_condition" (
 *     "id" integer NOT NULL PRIMARY KEY,
 *     "thing_model_id" INTEGER,
 *     "property_id" INTEGER,
 *     "expression" text,
 *     "threshold" text,
 *     FOREIGN KEY ("thing_model_id") REFERENCES "thing_model" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
 *     FOREIGN KEY ("property_id") REFERENCES "thing_model_properties" ("id") ON DELETE CASCADE ON UPDATE CASCADE
 *   );
 */
class AlertCondition extends BaseEntity {
  constructor() {
    super();
    this.tableName = 'alert_condition';
    this.columns = {
      'id': columnType.NUMBER,
      'thing_model_id': columnType.NUMBER,
      'property_id': columnType.NUMBER,
      'expression': columnType.STRING,
      'threshold': columnType.STRING,
    };
    this.pk = 'id';
  }
}

module.exports = AlertCondition;

