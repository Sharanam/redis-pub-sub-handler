const redis = require("redis");
const dotenv = require("dotenv");
const WebSocket = require("ws");

dotenv.config();
function main() {
  try {
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

    async function setup() {
      await subscriber.connect();
      subscriber.pSubscribe("*", (message, channel) => {
        sendSocket(channel + ": " + message.toString());
      });

      await publisher.connect();

      console.log(`Redis connected to ${redisClient.options.url}`);
    }
    setup();

    const wss = new WebSocket.Server({ port: process.env.WS_PORT || 8080 });

    wss.on("connection", (ws) => {
      try {
        sendSocket(
          `Welcome: you are communicating with ${redisClient.options.url}`
        );

        ws.on("message", (message) => {
          // sendSocket(message);
          try {
            message = JSON.parse(message);
          } catch (_) {
            message = message.toString().trim();
          }
          // if (message)
          publisher.publish(
            message?.channel || "test-channel",
            message.message || message
          );
        });
      } catch (error) {
        console.error(error);
      }
    });

    function sendSocket(msg) {
      wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(msg.toString());
        }
      });
    }
  } catch (er) {
    console.error(er);
  }
}
main();
