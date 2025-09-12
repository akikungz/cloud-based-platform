declare module 'amqplib' {
  export interface Connection {
    createChannel(): Promise<Channel>;
    close(): Promise<void>;
    on(event: 'close' | 'error', listener: (...args: any[]) => void): this;
  }

  export interface Channel {
    assertExchange(exchange: string, type: string, options?: any): Promise<void>;
    assertQueue(queue: string, options?: any): Promise<void>;
    bindQueue(queue: string, exchange: string, routingKey: string): Promise<void>;
    consume(queue: string, onMessage: (msg: ConsumeMessage | null) => void, options?: any): Promise<void>;
    ack(message: ConsumeMessage): void;
    nack(message: ConsumeMessage, allUpTo?: boolean, requeue?: boolean): void;
    publish(exchange: string, routingKey: string, content: Buffer, options?: any): boolean;
    close(): Promise<void>;
  }

  export interface ConsumeMessage {
    content: Buffer;
    fields: any;
    properties: any;
  }

  export function connect(url: string): Promise<Connection>;
}
