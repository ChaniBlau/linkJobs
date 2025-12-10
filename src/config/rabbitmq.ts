import { connect, Channel } from 'amqplib';

let channel: Channel | null = null;

export const getRabbitMQChannel = async (): Promise<Channel> => {
  if (channel) return channel;

  const url = process.env.RABBITMQ_URL;
  if (!url) {
    throw new Error('❌ Missing RABBITMQ_URL in env');
  }

  try {
    const connection = await connect(url);
    channel = await connection.createChannel();

    console.log('🐰 RabbitMQ connected and channel created successfully');
    return channel;
  } catch (error) {
    console.error('❌ Failed to connect to RabbitMQ:', error);
    throw error;
  }
};
