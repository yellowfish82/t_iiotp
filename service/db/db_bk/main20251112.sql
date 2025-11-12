/*
 Navicat Premium Dump SQL

 Source Server         : t_iiotp
 Source Server Type    : SQLite
 Source Server Version : 3045000 (3.45.0)
 Source Schema         : main

 Target Server Type    : SQLite
 Target Server Version : 3045000 (3.45.0)
 File Encoding         : 65001

 Date: 12/11/2025 08:22:35
*/

PRAGMA foreign_keys = false;

-- ----------------------------
-- Table structure for alert_condition
-- ----------------------------
DROP TABLE IF EXISTS "alert_condition";
CREATE TABLE "alert_condition" (
  "id" integer NOT NULL PRIMARY KEY AUTOINCREMENT,
  "thing_model_id" INTEGER,
  "property_id" INTEGER,
  "expression" integer(1),
  "threshold" real,
  FOREIGN KEY ("thing_model_id") REFERENCES "thing_model" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
  FOREIGN KEY ("property_id") REFERENCES "thing_model_properties" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- ----------------------------
-- Table structure for alert_data
-- ----------------------------
DROP TABLE IF EXISTS "alert_data";
CREATE TABLE "alert_data" (
  "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
  "ot_data" integer,
  "condition" integer,
  FOREIGN KEY ("ot_data") REFERENCES "ot" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
  FOREIGN KEY ("condition") REFERENCES "alert_condition" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- ----------------------------
-- Table structure for ot
-- ----------------------------
DROP TABLE IF EXISTS "ot";
CREATE TABLE "ot" (
  "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
  "timestamp" integer NOT NULL,
  "payload" TEXT(900) NOT NULL,
  "thing_id" integer,
  FOREIGN KEY ("thing_id") REFERENCES "thing_instance" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- ----------------------------
-- Table structure for sqlite_sequence
-- ----------------------------
DROP TABLE IF EXISTS "sqlite_sequence";
CREATE TABLE sqlite_sequence(name,seq);

-- ----------------------------
-- Table structure for thing_instance
-- ----------------------------
DROP TABLE IF EXISTS "thing_instance";
CREATE TABLE "thing_instance" (
  "id" integer NOT NULL PRIMARY KEY AUTOINCREMENT,
  "thing_model_id" integer,
  "sn" TEXT(10) NOT NULL,
  "status" integer(1) NOT NULL DEFAULT 0,
  "key" TEXT(10) NOT NULL,
  "name" TEXT(300) NOT NULL,
  "brand" TEXT(300) NOT NULL,
  "note" TEXT(500),
  "frequency" integer DEFAULT 2,
  FOREIGN KEY ("thing_model_id") REFERENCES "thing_model" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- ----------------------------
-- Table structure for thing_model
-- ----------------------------
DROP TABLE IF EXISTS "thing_model";
CREATE TABLE "thing_model" (
  "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
  "name" text(60) NOT NULL,
  "description" TEXT(500)
);

-- ----------------------------
-- Table structure for thing_model_properties
-- ----------------------------
DROP TABLE IF EXISTS "thing_model_properties";
CREATE TABLE "thing_model_properties" (
  "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
  "thing_model_id" INTEGER NOT NULL,
  "name" TEXT(200) NOT NULL,
  "min" integer(10) NOT NULL,
  "max" integer(10) NOT NULL,
  FOREIGN KEY ("thing_model_id") REFERENCES "thing_model" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- ----------------------------
-- View structure for alert_data_view
-- ----------------------------
DROP VIEW IF EXISTS "alert_data_view";
CREATE VIEW "alert_data_view" AS SELECT
	ot.timestamp, 
	ot.payload, 
	alert_data.ot_data, 
	alert_data.condition, 
	alert_data.id, 
	ot.thing_id, 
	alert_condition.thing_model_id, 
	alert_condition.property_id, 
	alert_condition.expression, 
	alert_condition.threshold, 
	thing_model_properties.name
FROM
	alert_data
	INNER JOIN
	alert_condition
	ON 
		alert_data.condition = alert_condition.id
	INNER JOIN
	ot
	ON 
		alert_data.ot_data = ot.id
	INNER JOIN
	thing_model_properties
	ON 
		alert_condition.property_id = thing_model_properties.id;

-- ----------------------------
-- Auto increment value for alert_condition
-- ----------------------------
UPDATE "main"."sqlite_sequence" SET seq = 10 WHERE name = 'alert_condition';

-- ----------------------------
-- Auto increment value for alert_data
-- ----------------------------
UPDATE "main"."sqlite_sequence" SET seq = 3203 WHERE name = 'alert_data';

-- ----------------------------
-- Auto increment value for ot
-- ----------------------------
UPDATE "main"."sqlite_sequence" SET seq = 6418 WHERE name = 'ot';

-- ----------------------------
-- Auto increment value for thing_instance
-- ----------------------------
UPDATE "main"."sqlite_sequence" SET seq = 9 WHERE name = 'thing_instance';

-- ----------------------------
-- Auto increment value for thing_model
-- ----------------------------
UPDATE "main"."sqlite_sequence" SET seq = 9 WHERE name = 'thing_model';

-- ----------------------------
-- Auto increment value for thing_model_properties
-- ----------------------------
UPDATE "main"."sqlite_sequence" SET seq = 22 WHERE name = 'thing_model_properties';

PRAGMA foreign_keys = true;
