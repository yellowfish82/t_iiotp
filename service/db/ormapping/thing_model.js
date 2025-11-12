const BaseEntity = require('./entity');
const { columnType, } = require('../../../config/db');


/**
 *   CREATE TABLE "thing_model" (
 *     "id" integer NOT NULL PRIMARY KEY,
 *     "name" varchar(60) NOT NULL,
 *     "description" text
 *   );
 */
class ThingModel extends BaseEntity {
  constructor() {
    super();
    this.tableName = 'thing_model';
    this.columns = {
      'id': columnType.NUMBER,
      'name': columnType.STRING,
      'description': columnType.STRING,
    };
    this.pk = 'id';
  }
}

module.exports = ThingModel;

