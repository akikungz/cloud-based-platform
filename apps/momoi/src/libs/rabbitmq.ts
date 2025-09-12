import amqp, { Connection, Channel } from 'amqplib';
import { env } from './env';
import { logger } from './log';

export interface VMCreateMessage {
  type: 'vm.create';
  data: {
    vmid: number;
    templateId: number;
    name: string;
    node: string;
    config?: {
      cores?: number;
      memory?: number;
      diskSize?: string;
      ipconfig0?: string;
      ciuser?: string;
      cipassword?: string;
      sshkeys?: string;
    };
  };
  requestId: string;
  userId: string;
}

export interface VMDeleteMessage {
  type: 'vm.delete';
  data: {
    vmid: number;
    node: string;
  };
  requestId: string;
  userId: string;
}

export interface VMResizeMessage {
  type: 'vm.resize';
  data: {
    vmid: number;
    node: string;
    size: string;
  };
  requestId: string;
  userId: string;
}

export interface VMStatusMessage {
  type: 'vm.status';
  data: {
    vmid: number;
    node: string;
    state: 'start' | 'stop' | 'suspend' | 'resume' | 'reboot';
  };
  requestId: string;
  userId: string;
}

export type VMMessage = VMCreateMessage | VMDeleteMessage | VMResizeMessage | VMStatusMessage;

export class RabbitMQPublisher {
  private connection: Connection | null = null;
  private channel: Channel | null = null;
  private isConnected = false;

  /**
   * Connects to RabbitMQ and sets up the exchange
   */
  async connect(): Promise<void> {
    try {
      logger.info(`Connecting to RabbitMQ... URL: ${env.RABBITMQ_URL}`);

      this.connection = await amqp.connect(env.RABBITMQ_URL);
      this.channel = await this.connection.createChannel();

      // Assert the exchange exists
      await this.channel.assertExchange(env.RABBITMQ_EXCHANGE, 'topic', {
        durable: true
      });

      this.isConnected = true;
      logger.info('Successfully connected to RabbitMQ');

      // Handle connection close
      this.connection.on('close', () => {
        logger.warn('RabbitMQ connection closed');
        this.isConnected = false;
      });

      this.connection.on('error', (error) => {
        logger.error('RabbitMQ connection error:', error);
        this.isConnected = false;
      });

    } catch (error) {
      if (error instanceof Error) {
        logger.error(`Failed to connect to RabbitMQ: ${error.message}`);
      }

      this.isConnected = false;
      throw error;
    }
  }

  /**
   * Publishes a message to the RabbitMQ exchange
   */
  async publishMessage(message: VMMessage): Promise<void> {
    if (!this.isConnected || !this.channel) {
      throw new Error('RabbitMQ publisher is not connected');
    }

    try {
      const messageBuffer = Buffer.from(JSON.stringify(message));
      const routingKey = this.getRoutingKey(message.type);

      const published = this.channel.publish(
        env.RABBITMQ_EXCHANGE,
        routingKey,
        messageBuffer,
        {
          persistent: true,
          messageId: message.requestId,
          timestamp: Date.now(),
          headers: {
            userId: message.userId,
            messageType: message.type
          }
        }
      );

      if (!published) {
        throw new Error('Failed to publish message to RabbitMQ');
      }

      logger.info(`Message published to RabbitMQ - Type: ${message.type}, RequestId: ${message.requestId}, UserId: ${message.userId}, RoutingKey: ${routingKey}`);

    } catch (error) {
      logger.error('Failed to publish message to RabbitMQ', {
        error: error instanceof Error ? error.message : String(error)
      } as any); 
      throw error;
    }
  }

  /**
   * Publishes a VM creation message
   */
  async publishVMCreateMessage(data: {
    vmid: number;
    templateId: number;
    name: string;
    node: string;
    config?: {
      cores?: number;
      memory?: number;
      diskSize?: string;
      ipconfig0?: string;
      ciuser?: string;
      cipassword?: string;
      sshkeys?: string;
    };
    requestId: string;
    userId: string;
  }): Promise<void> {
    const message: VMCreateMessage = {
      type: 'vm.create',
      data: {
        vmid: data.vmid,
        templateId: data.templateId,
        name: data.name,
        node: data.node,
        config: data.config
      },
      requestId: data.requestId,
      userId: data.userId
    };

    await this.publishMessage(message);
  }

  /**
   * Publishes a VM deletion message
   */
  async publishVMDeleteMessage(data: {
    vmid: number;
    node: string;
    requestId: string;
    userId: string;
  }): Promise<void> {
    const message: VMDeleteMessage = {
      type: 'vm.delete',
      data: {
        vmid: data.vmid,
        node: data.node
      },
      requestId: data.requestId,
      userId: data.userId
    };

    await this.publishMessage(message);
  }

  /**
   * Publishes a VM resize message
   */
  async publishVMResizeMessage(data: {
    vmid: number;
    node: string;
    size: string;
    requestId: string;
    userId: string;
  }): Promise<void> {
    const message: VMResizeMessage = {
      type: 'vm.resize',
      data: {
        vmid: data.vmid,
        node: data.node,
        size: data.size
      },
      requestId: data.requestId,
      userId: data.userId
    };

    await this.publishMessage(message);
  }

  /**
   * Publishes a VM status change message
   */
  async publishVMStatusMessage(data: {
    vmid: number;
    node: string;
    state: 'start' | 'stop' | 'suspend' | 'resume' | 'reboot';
    requestId: string;
    userId: string;
  }): Promise<void> {
    const message: VMStatusMessage = {
      type: 'vm.status',
      data: {
        vmid: data.vmid,
        node: data.node,
        state: data.state
      },
      requestId: data.requestId,
      userId: data.userId
    };

    await this.publishMessage(message);
  }

  /**
   * Gets the routing key based on message type
   */
  private getRoutingKey(messageType: string): string {
    switch (messageType) {
      case 'vm.create':
        return 'yuzu.create';
      case 'vm.delete':
        return 'yuzu.delete';
      case 'vm.resize':
        return 'yuzu.resize';
      case 'vm.status':
        return 'yuzu.status';
      default:
        return env.RABBITMQ_ROUTING_KEY;
    }
  }

  /**
   * Closes the RabbitMQ connection
   */
  async close(): Promise<void> {
    try {
      if (this.channel) {
        await this.channel.close();
        this.channel = null;
      }

      if (this.connection) {
        await this.connection.close();
        this.connection = null;
      }

      this.isConnected = false;
      logger.info('RabbitMQ connection closed');

    } catch (error) {
      logger.error('Error closing RabbitMQ connection', {
        error: error instanceof Error ? error.message : String(error)
      } as any);
      throw error;
    }
  }

  /**
   * Checks if the publisher is connected
   */
  isPublisherConnected(): boolean {
    return this.isConnected;
  }
}

// Singleton instance
let publisherInstance: RabbitMQPublisher | null = null;

/**
 * Gets the singleton RabbitMQ publisher instance
 */
export async function getRabbitMQPublisher(): Promise<RabbitMQPublisher> {
  if (!publisherInstance) {
    publisherInstance = new RabbitMQPublisher();
    await publisherInstance.connect();
  }

  if (!publisherInstance.isPublisherConnected()) {
    await publisherInstance.connect();
  }

  return publisherInstance;
}

/**
 * Closes the RabbitMQ publisher connection
 */
export async function closeRabbitMQPublisher(): Promise<void> {
  if (publisherInstance) {
    await publisherInstance.close();
    publisherInstance = null;
  }
}
