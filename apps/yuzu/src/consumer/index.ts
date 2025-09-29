import { ConsumeMessage } from 'amqplib';
import { RabbitMQConsumer, defaultRabbitMQConfig } from './rabbitmq';
import { VMMessageHandler, parseMessage } from './message-handlers';
import { logger } from '../libs/log';

export class YuzuConsumer {
  private rabbitMQ: RabbitMQConsumer;
  private messageHandler: VMMessageHandler;

  constructor() {
    this.rabbitMQ = new RabbitMQConsumer(defaultRabbitMQConfig);
    this.messageHandler = new VMMessageHandler();
  }

  /**
   * Starts the consumer service
   */
  async start(): Promise<void> {
    try {
      logger.info('Starting Yuzu Consumer...');

      // Connect to RabbitMQ
      await this.rabbitMQ.connect();

      // Setup queue and exchange
      await this.rabbitMQ.setupQueue(
        defaultRabbitMQConfig.exchange!,
        defaultRabbitMQConfig.queue!,
        defaultRabbitMQConfig.routingKey!
      );

      // Start consuming messages
      await this.rabbitMQ.consume(
        defaultRabbitMQConfig.queue!,
        this.handleMessage.bind(this)
      );

      logger.info('Yuzu Consumer started successfully');
    } catch (error) {
      logger.error({ error }, 'Failed to start Yuzu Consumer');
      throw error;
    }
  }

  /**
   * Handles incoming messages from RabbitMQ
   */
  private async handleMessage(message: ConsumeMessage | null): Promise<void> {
    if (!message) {
      logger.info('Received null message, ignoring...');
      return;
    }

    try {
      // Parse and validate message
      const vmMessage = parseMessage(message);

      // Process the message
      await this.messageHandler.handle(vmMessage);

      // Acknowledge successful processing
      this.rabbitMQ.ack(message);

      logger.info({ messageType: vmMessage.type, requestId: vmMessage.requestId }, 'Successfully processed message');
    } catch (error) {
      logger.error({ error }, 'Error processing message');

      // Reject message and requeue for retry
      this.rabbitMQ.nack(message, true);
    }
  }

  /**
   * Stops the consumer service
   */
  async stop(): Promise<void> {
    logger.info('Stopping Yuzu Consumer...');
    await this.rabbitMQ.close();
    logger.info('Yuzu Consumer stopped');
  }

  /**
   * Graceful shutdown handler
   */
  setupGracefulShutdown(): void {
    const shutdown = async (signal: string) => {
      logger.info({ signal }, 'Received shutdown signal, shutting down gracefully');
      try {
        await this.stop();
        process.exit(0);
      } catch (error) {
        logger.error({ error }, 'Error during shutdown');
        process.exit(1);
      }
    };

    process.on('SIGINT', () => shutdown('SIGINT'));
    process.on('SIGTERM', () => shutdown('SIGTERM'));
  }
}

// Export for use in main application
export { RabbitMQConsumer } from './rabbitmq';
export { VMMessageHandler, parseMessage } from './message-handlers';
