var queue = "publisher";
var rabbit_host = process.env.RABBIT_HOST;
var rabbit_port = process.env.RABBIT_PORT;
var rabbit_user = process.env.RABBIT_USERNAME;
var rabbit_password = process.env.RABBIT_PASSWORD;
var open = require("amqplib").connect(
  "amqp://" +
    rabbit_user +
    ":" +
    rabbit_password +
    "@" +
    rabbit_host +
    ":" +
    rabbit_port +
    "/"
);

// Consumer
open
  .then(function (conn) {
    return conn.createChannel();
  })
  .then(async (ch) => {
    const ok = await ch.assertQueue(queue);
    console.log(ok);
    return await ch.consume(queue, function (msg) {
      if (msg !== null) {
        console.log(msg.content.toString());
        ch.ack(msg);
      }
    });
  })
  .catch(console.warn);
