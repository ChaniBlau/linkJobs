import { getRabbitMQChannel } from "../../config/rabbitmq";

const QUEUE_NAME = 'invite-email';

export const publishInviteEmail = async (email: string, orgId: number) => {
  const channel = await getRabbitMQChannel();

  await channel.assertQueue(QUEUE_NAME, { durable: true });

  const message = JSON.stringify({ email, orgId });
  channel.sendToQueue(QUEUE_NAME, Buffer.from(message), { persistent: true });

  console.log(`📤 Invite email published to queue for ${email}`);
};
