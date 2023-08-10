const amqp = require("amqplib/callback_api");
require("dotenv").config();

const QUEUE = process.env.QUEUE;
const AMQP_URL = process.env.AMQP_URL;

// Set up RabbitMQ connection
amqp.connect(AMQP_URL, (error0, connection) => {
  if (error0) throw error0;

  connection.createChannel((error1, channel) => {
    if (error1) throw error1;

    channel.assertQueue("", {
      durable: false,
      exclusive: true,
    });

    console.log(`M2 microservice is waiting for task in ${QUEUE}\n`);

    channel.consume(
      QUEUE,
      async (message) => {
        const { task } = JSON.parse(message.content.toString());
        const seconds = task.split(".").length; // to generate processing time

        console.log(" [.] Got a new task '%s'", task);

        // Processing task and send to M1 Microservice
        const result = task.replaceAll(".", "#");

        console.log(` [.] Start processing the task`);

        setTimeout(async () => {
          console.log(` [.] Finish processing the task`);
          console.log("\n ----------------------------\n");
          await channel.sendToQueue(
            message.properties.replyTo,
            Buffer.from(result)
          );
          // dequeuing
          channel.ack(message);
        }, seconds*1000);
      },
      { noAck: false }
    );
  });
});

console.log("M2 microservice is running");
