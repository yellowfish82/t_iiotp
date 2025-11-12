const BaseEntity = require('./entity');
const { columnType, } = require('../../../config/db');


/**
 *   CREATE TABLE "ot" (
 *     "id" integer NOT NULL PRIMARY KEY,
 *     "timestamp" bigint NOT NULL,
 *     "payload" text NOT NULL,
 *     "thing_id" integer,
 *     FOREIGN KEY ("thing_id") REFERENCES "thing_instance" ("id") ON DELETE CASCADE ON UPDATE CASCADE
 *   );
 */
class OT extends BaseEntity {
  constructor() {
    super();
    this.tableName = 'ot';
    this.columns = {
      'id': columnType.NUMBER,
      'timestamp': columnType.NUMBER,
      'payload': columnType.STRING,
      'thing_id': columnType.NUMBER,
    };
    this.pk = 'id';
  }
}

module.exports = OT;

