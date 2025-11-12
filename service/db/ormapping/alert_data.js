const BaseEntity = require('./entity');
const { columnType, } = require('../../../config/db');


/**
 *   CREATE TABLE "alert_data" (
 *     "id" integer NOT NULL PRIMARY KEY,
 *     "ot_data" integer,
 *     "condition" integer,
 *     FOREIGN KEY ("ot_data") REFERENCES "ot" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
 *     FOREIGN KEY ("condition") REFERENCES "alert_condition" ("id") ON DELETE CASCADE ON UPDATE CASCADE
 *   );
 */
class AlertData extends BaseEntity {
  constructor() {
    super();
    this.tableName = 'alert_data';
    this.columns = {
      'id': columnType.NUMBER,
      'ot_data': columnType.NUMBER,
      'condition': columnType.NUMBER,
    };
    this.pk = 'id';
  }
}

module.exports = AlertData;

