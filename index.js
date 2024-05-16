const redis = require("redis");
const dotenv = require("dotenv");
const WebSocket = require("ws");

dotenv.config();

const redisClient = redis.createClient({
  // staging redis
  url: process.env.IS_STAGING
    ? process.env.REDIS_URL_STAGING
    : process.env.REDIS_URL_LOCAL || "redis://127.0.0.1:6379",
  password: process.env.IS_STAGING
    ? process.env.REDIS_PASSWORD_STAGING
    : process.env.REDIS_PASSWORD_LOCAL || "",

  database: process.env.REDIS_DB || 0,
});

const subscriber = redisClient;
const publisher = redisClient.duplicate();

(async function () {
  await subscriber.connect();
  subscriber.pSubscribe("*", (message, channel) => {
    sendSocket(channel + ": " + message.toString());
  });

  await publisher.connect();

  console.log("Redis connected to " + (process.env.REDIS_URL || "localhost"));
})();

const wss = new WebSocket.Server({ port: process.env.WS_PORT || 8080 });

wss.on("connection", (ws) => {
  sendSocket("Welcome: New messages will start appearing here....");

  ws.on("message", (message) => {
    // sendSocket(message);
    try {
      message = JSON.parse(message);
    } catch (_) {
      message = message.toString().trim();
    }
    if (message)
      publisher.publish(
        message?.channel || "test-channel",
        message.message || message
      );
  });
});

function sendSocket(msg) {
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(msg.toString());
    }
  });
}
