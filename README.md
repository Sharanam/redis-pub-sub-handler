# Basic Redis Pub/Sub Project Setup

This project was developed to experiment with JSON strings in Redis, as an alternative to using Redis Insights.

## Setup Instructions

Follow the steps below to get the project up and running:

1. Install the necessary dependencies by running the following command in your terminal:

   ```bash
   npm install
   ```

2. Create `.env` file with the necessary/default configuration settings.

   ```.env
      REDIS_URL="redis://127.0.0.1:6379" # address of the Redis server
      REDIS_PASSWORD=""
      REDIS_DB=0
      WS_PORT=8080
   ```

3. Start the server with the command:

   ```bash
   npm start
   ```

4. Open the [index.html](index.html) file in your browser. If needed, modify the Redis and WebSocket configurations according to your requirements.

### Redis Pub/Sub

The Redis Pub/Sub feature enables the exchange of messages between publishers and subscribers through channels. Messages are characterized into channels without specific subscribers, and subscribers express interest in one or more topics to receive relevant messages. This decoupling of publishers and subscribers allows for greater scalability and a more dynamic network topology
