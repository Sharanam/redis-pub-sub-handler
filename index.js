const redis = require("redis");
const WebSocket = require("ws");

const redisClient = redis.createClient({
  url: "redis://127.0.0.1:6379",
  database: 0,
});

const subscriber = redisClient;
const publisher = redisClient.duplicate();

(async function () {
  await subscriber.connect();
  subscriber.pSubscribe("*", (message, channel) => {
    sendSocket(channel + ": " + message.toString());
  });

  await publisher.connect();

  console.log("Redis connected");
})();

const wss = new WebSocket.Server({ port: 8080 });

wss.on("connection", (ws) => {
  sendSocket("New messages will start appearing here....");

  ws.on("message", (message) => {
    // sendSocket(message);
    try {
      message = JSON.parse(message);
    } catch (_) {
      message = message.toString();
    }
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
