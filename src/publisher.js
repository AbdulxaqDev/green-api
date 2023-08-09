const amqp = require("amqplib");

require("dotenv").config()

const msg = { number: process.argv[2] };

connect();

async function connect() {
  try {
    const connection = await amqp.connect("amqp://localhost:5672");
    const channel = await connection.createChannel();
    const result = await channel.assertQueue("jobs");
    for (let i = 0; i < 1; i++) {
      channel.sendToQueue("jobs", Buffer.from(JSON.stringify({ number: i })));
      console.log(`Job sent successfully! ${i}`);
    }
  } catch (error) {
     console.log(`Error on publishing message, (publisher.js): `, error);
  }
}
