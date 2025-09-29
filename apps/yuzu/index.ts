import { YuzuConsumer } from './src/consumer';
import { logger } from './src/libs/log';

async function main() {
  const consumer = new YuzuConsumer();

  // Setup graceful shutdown
  consumer.setupGracefulShutdown();

  try {
    // Start the consumer
    await consumer.start();

    logger.info('Yuzu Consumer is running. Press Ctrl+C to stop.');

    // Keep the process alive
    await new Promise(() => { });
  } catch (error) {
    logger.error({ error }, 'Failed to start consumer');
    process.exit(1);
  }
}

// Start the application
main().catch((error) => {
  logger.error({ error }, 'Unhandled error');
  process.exit(1);
});