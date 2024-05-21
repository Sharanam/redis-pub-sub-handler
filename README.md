# Redis Pub/Sub Viewer

### Initial Idea

This project was developed to experiment with JSON strings in Redis, as an alternative to using Redis Insights.

## Setup Instructions

Follow the steps below to get the project up and running:

1. Install the necessary dependencies by running the following command in your terminal:

   ```bash
   npm install
   ```

2. Create `.env` file with the necessary/default configuration settings.

   ```.env
   IS_STAGING = 1 // turn this off if using local

   REDIS_URL_LOCAL = "redis://127.0.0.1:6379";
   REDIS_PASSWORD_LOCAL = "";

   REDIS_URL_STAGING = "redis://#########";
   REDIS_PASSWORD_STAGING = "########";

   REDIS_DB = 0;
   WS_PORT = 8081;
   ```

3. Start the server with the command:

   ```bash
   npm start
   ```

4. Let the node process log `Redis connected to ...` message and then Open `localhost:3000` in browser.

## Tech Stack

- Node.js for connecting to the provided Redis configuration.
- Solid JS for the UI.

## Contribute

If you would like to contribute to this project, please follow these steps:

1. Check the [Issues](https://github.com/Sharanam/redis-pub-sub-handler/issues) page for any open tasks or bug reports.

2. Fork the repository to your own GitHub account.

3. Clone the forked repository to your local machine.

4. Create a new branch for your changes:

   ```bash
   git checkout -b <feature/your-feature-name>
   ```

5. Make your desired changes to the codebase.

6. Commit your changes:

   ```bash
   git commit -m "Added: <your feature>"
   ```

7. Push your changes to your forked repository:

   ```bash
   git push origin <feature/your-feature-name>
   ```

8. Open a pull request from your forked repository to the original repository.

9. Provide a clear and detailed description of your changes in the pull request.

10. Wait for the project maintainers to review and merge your pull request.

Thank you for your contribution! 💖

## Redis Pub/Sub

#### Basics:

> The Redis Pub/Sub feature enables the exchange of messages between publishers and subscribers through channels.

> Messages are characterized into channels without specific subscribers, and subscribers express interest in one or more topics to receive relevant messages.

> This decoupling of publishers and subscribers allows for greater scalability and a more dynamic network topology.

#### Disclaimer:

> This repository is designed to consume an existing Redis instance (located somewhere in the world) for viewing and publishing messages in a more customized manner, using the provided connection. Please note that Redis is no longer open source. The codebase is intended for personal or internal use only.
