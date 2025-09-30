import amqp, { Channel, ConsumeMessage } from 'amqplib';
import { env } from '@yuzu/libs/env';
import { logger } from '../libs/log';

export interface RabbitMQConfig {
  url: string;
  exchange?: string;
  queue?: string;
  routingKey?: string;
}

export class RabbitMQConsumer {
  private connection: Awaited<ReturnType<typeof amqp.connect>> | null = null;
  private channel: Channel | null = null;
  private config: RabbitMQConfig;

  constructor(config: RabbitMQConfig) {
    this.config = config;
  }

  /**
   * Establishes connection to RabbitMQ
   */
  async connect(): Promise<void> {
    try {
      this.connection = await amqp.connect(this.config.url);
      this.channel = await this.connection.createChannel();

      logger.info('Connected to RabbitMQ');

      // Handle connection close
      this.connection.on('close', () => {
        logger.info('RabbitMQ connection closed');
      });

      this.connection.on('error', (error: Error) => {
        logger.error({ error }, 'RabbitMQ connection error');
      });
    } catch (error) {
      logger.error({ error }, 'Failed to connect to RabbitMQ');
      throw error;
    }
  }

  /**
   * Sets up exchange and queue
   */
  async setupQueue(exchange: string, queue: string, routingKey: string): Promise<void> {
    if (!this.channel) {
      throw new Error('Channel not initialized. Call connect() first.');
    }

    // Assert exchange
    await this.channel.assertExchange(exchange, 'topic', { durable: true });

    // Assert queue
    await this.channel.assertQueue(queue, { durable: true });

    // Bind queue to exchange
    await this.channel.bindQueue(queue, exchange, routingKey);

    logger.info({ queue, exchange, routingKey }, 'Queue bound to exchange with routing key');
  }

  /**
   * Starts consuming messages from the queue
   */
  async consume(
    queue: string,
    messageHandler: (message: ConsumeMessage | null) => Promise<void>,
    options: { noAck?: boolean } = { noAck: false }
  ): Promise<void> {
    if (!this.channel) {
      throw new Error('Channel not initialized. Call connect() first.');
    }

    await this.channel.consume(queue, messageHandler, options);
    logger.info({ queue }, 'Started consuming messages from queue');
  }

  /**
   * Acknowledges a message
   */
  ack(message: ConsumeMessage): void {
    if (this.channel) {
      this.channel.ack(message);
    }
  }

  /**
   * Rejects a message and optionally requeues it
   */
  nack(message: ConsumeMessage, requeue: boolean = false): void {
    if (this.channel) {
      this.channel.nack(message, false, requeue);
    }
  }

  /**
   * Closes the connection
   */
  async close(): Promise<void> {
    if (this.channel) {
      await this.channel.close();
    }
    if (this.connection) {
      await this.connection.close();
    }
    logger.info('RabbitMQ connection closed');
  }
}

// Default configuration using environment variables
export const defaultRabbitMQConfig: RabbitMQConfig = {
  url: env.RABBITMQ_URL,
  exchange: env.RABBITMQ_EXCHANGE,
  queue: env.RABBITMQ_QUEUE,
  routingKey: env.RABBITMQ_ROUTING_KEY
};
