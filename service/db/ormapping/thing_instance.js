const BaseEntity = require('./entity');
const { columnType, } = require('../../../config/db');


/**
 *   CREATE TABLE "thing_instance" (
 *     "id" integer NOT NULL PRIMARY KEY,
 *     "thing_model_id" integer,
 *     "sn" varchar(50) NOT NULL,
 *     "status" integer NOT NULL DEFAULT 0,
 *     "key" varchar(100) NOT NULL,
 *     "name" varchar(300) NOT NULL,
 *     "brand" varchar(300) NOT NULL,
 *     "note" varchar(500),
 *     "frequency" integer DEFAULT 2,
 *     FOREIGN KEY ("thing_model_id") REFERENCES "thing_model" ("id") ON DELETE CASCADE ON UPDATE CASCADE
 *   );
 */
class ThingInstance extends BaseEntity {
  constructor() {
    super();
    this.tableName = 'thing_instance';
    this.columns = {
      'id': columnType.NUMBER,
      'thing_model_id': columnType.NUMBER,
      'sn': columnType.STRING,
      'key': columnType.STRING,
      'status': columnType.NUMBER,
      'name': columnType.STRING,
      'brand': columnType.STRING,
      'note': columnType.STRING,
      'frequency': columnType.NUMBER,
    };
    this.pk = 'id';
  }
}

module.exports = ThingInstance;

