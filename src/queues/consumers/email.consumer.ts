import { getRabbitMQChannel } from "../../config/rabbitmq";
import { sendInviteEmail } from '../../utils/emailHelper';

const QUEUE_NAME = 'invite-email';

export const startEmailConsumer = async () => {
  const channel = await getRabbitMQChannel();

  await channel.assertQueue(QUEUE_NAME, { durable: true });

  console.log(`📥 Listening for email jobs on queue "${QUEUE_NAME}"`);

  channel.consume(QUEUE_NAME, async (msg) => {
    if (msg) {
      try {
        const { email, orgId } = JSON.parse(msg.content.toString());
        await sendInviteEmail(email, orgId);
        channel.ack(msg);
        console.log(`✅ Email sent to ${email}`);
      } catch (error) {
        console.error(`❌ Failed to process message`, error);
        channel.nack(msg, false, false);
      }
    }
  });
};
