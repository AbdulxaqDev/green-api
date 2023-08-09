const amqp = require("amqplib");

require("dotenv").config()

connect();

async function connect() {
  try {

    const connection = await amqp.connect("amqp://localhost:5672");
    const channel = await connection.createChannel();
    const result = await channel.assertQueue(queue, {
      durable: true,
    });

    channel.bindQueue()
    channel.consume(queue, message => {
        channel.de
        console.log(message.content.toString());
    })

    console.log("Waiting for messages");


  } catch (error) {
    console.log(`Error on consuming, (consumer.js): `, error);
  }
}


