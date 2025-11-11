const express = require('express');
// const cors = require('cors');
const mqtt = require('mqtt');
const bodyParser = require('body-parser');
const configurations = require('./config');
const mountRoutes = require('./routes');
const service = require('./service');


const config = (app) => {
  app.all('*', (req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Content-Type,Content-Length, Authorization, Accept,X-Requested-With');
    res.header('Access-Control-Allow-Methods', 'PUT,POST,GET,DELETE,OPTIONS');
    res.header('X-Powered-By', ' 3.2.1');
    if (req.method === 'OPTIONS') res.sendStatus(200);/* 让options请求快速返回*/
    else next();
  });

  app.use(bodyParser.json({ limit: 1850000, }));
  app.use(bodyParser.urlencoded({ limit: 1850000, extended: true, }));

  app.set('trust proxy', true);

  mountRoutes(app);
};

const start = () => {
  const app = express();
  config(app);

  // MQTT 客户端配置
  const mqttClient = mqtt.connect('mqtt://localhost'); // 替换为你的 MQTT 服务器地址
  const topic = configurations.common.MQTT_TOPIC; // 替换为你想要订阅的主题

  // 订阅主题
  mqttClient.on('connect', () => {
    console.log('MQTT client connected to the broker.');
    mqttClient.subscribe(topic, (err) => {
      if (err) {
        console.error('Error subscribing to topic:', err);
      } else {
        console.log(`MQTT client subscribed to topic "${topic}"`);
      }
    });
  });

  // 处理接收到的 MQTT 消息
  mqttClient.on('message', async (topicReceived, message) => {
    console.log(`Received message on topic "${topicReceived}":`, message.toString());
    // 这里可以根据需要处理接收到的消息
    service.mqttService.handleMessage(message);
  });

  const server = app.listen(configurations.env.port, () => {
    console.log(`IIoT server listening on port ${configurations.env.port}`);
  });

  // 优雅关闭处理
  const gracefulShutdown = (signal) => {
    console.log(`\n${signal} received. Shutting down gracefully...`);
    
    // 关闭 HTTP 服务器
    server.close(() => {
      console.log('HTTP server closed.');
      
      // 关闭 MQTT 客户端
      mqttClient.end(false, () => {
        console.log('MQTT client disconnected.');
        process.exit(0);
      });
    });

    // 如果 10 秒后还没关闭，强制退出
    setTimeout(() => {
      console.error('Could not close connections in time, forcefully shutting down');
      process.exit(1);
    }, 10000);
  };

  // 监听进程信号
  process.on('SIGINT', () => gracefulShutdown('SIGINT'));
  process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
};

const fetchApp = (port) => {
  const app = express();
  config(app);

  return app.listen(port || configurations.env.port, () => {
    console.log(`IIoT server listening on port ${port || configurations.env.port}`);
  });
};

module.exports = {
  start,
  fetchApp,
};
