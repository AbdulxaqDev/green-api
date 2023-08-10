const express = require("express");
const path = require("path");
const amqp = require("amqplib/callback_api");
require("dotenv").config();

const app = express();

app.use(express.json());

const PORT = process.env.M1_PORT;
const QUEUE = process.env.QUEUE;
const AMQP_URL = process.env.AMQP_URL;

// Set up RabbitMQ connection
amqp.connect(AMQP_URL, (error0, connection) => {
  if (error0) throw error0;

  connection.createChannel(
    (error1, channel) => {
      if (error1) throw error1;

      // anonymous exclusive callback queue
      channel.assertQueue(
        "",
        {
          exclusive: true,
        },
        (error2) => {
          if (error2) {
            throw error2;
          }

          channel.consume(
            QUEUE,
            (msg) => {
              console.log(" [.] Got the processed message '%s'", msg.content.toString());
              console.log("\n ----------------------------\n");
            },
            {
              noAck: true,
            }
          );
        }
      );

      app.post("/", (req, res) => {
        const { message } = req.body;

        console.log(" [.] Got HTTP request, message: '%s'", message);

        channel.sendToQueue(
          QUEUE,
          Buffer.from(JSON.stringify({ task: message })),
          {
            replyTo: QUEUE,
          }
        );

        console.log(" [.] Sent the message to M2 microserver through RabbitMQ");

        res.send(" [.] Sent the message to M2 microserver through RabbitMQ");
      });
    },
    { noAck: true, durable: false }
  );
});

app.listen(PORT, () => console.log(`M1 microservice is running on ${PORT}\n`));
