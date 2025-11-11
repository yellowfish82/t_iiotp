/*
 Navicat Premium Data Transfer

 Source Server         : TIIoT
 Source Server Type    : SQLite
 Source Server Version : 3035005
 Source Schema         : main

 Target Server Type    : SQLite
 Target Server Version : 3035005
 File Encoding         : 65001

 Date: 21/04/2024 14:23:43
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
	thing_model.name, 
	thing_model.description
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
	thing_model
	ON 
		alert_condition.thing_model_id = thing_model.id;


-- ----------------------------
-- Table structure for sqlite_sequence
-- ----------------------------
DELETE FROM sqlite_sequence;


PRAGMA foreign_keys = true;
