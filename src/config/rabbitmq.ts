import amqp from 'amqplib';

let connection: amqp.Connection | null = null;
let channel: amqp.Channel | null = null;

export const getRabbitMQChannel = async (): Promise<amqp.Channel> => {
  if (channel) return channel;

  if (!process.env.RABBITMQ_URL) {
    throw new Error('Missing RABBITMQ_URL in env');
  }

  connection = await amqp.connect(process.env.RABBITMQ_URL);
  channel = await connection.createChannel();

  console.log('🐰 RabbitMQ connected successfully');
  return channel;
};
